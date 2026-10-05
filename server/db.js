const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'complaints.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run SQL queries as Promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDB() {
  await run(`PRAGMA foreign_keys = ON`);

  // Users Table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      student_id TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'admin')) NOT NULL,
      department_id INTEGER,
      year INTEGER,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Departments Table
  await run(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Staff Table
  await run(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      department_id INTEGER,
      role TEXT NOT NULL,
      status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    )
  `);

  // Complaints Table
  await run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_number TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
      status TEXT CHECK(status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed')) DEFAULT 'Submitted',
      department_id INTEGER,
      assigned_staff_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      closed_at DATETIME,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_staff_id) REFERENCES staff(id) ON DELETE SET NULL
    )
  `);

  // Complaint Attachments Table
  await run(`
    CREATE TABLE IF NOT EXISTS complaint_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    )
  `);

  // Complaint Updates / Timeline Table
  await run(`
    CREATE TABLE IF NOT EXISTS complaint_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      user_id INTEGER,
      user_name TEXT,
      user_role TEXT,
      status TEXT,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    )
  `);

  // Resolutions Table
  await run(`
    CREATE TABLE IF NOT EXISTS resolutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER UNIQUE NOT NULL,
      resolved_by TEXT NOT NULL,
      description TEXT NOT NULL,
      attachment_url TEXT,
      resolved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    )
  `);

  // Feedback Table
  await run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // Login Logs Table (Audit History)
  await run(`
    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Seed default data if empty
  // Seed default data if empty or ensure required departments exist
  await seedDatabase();
  await ensureDepartments();
}

const defaultDepts = [
  { name: 'Computer Science and Engineering (CSE)', desc: 'Department of Computer Science and Engineering' },
  { name: 'Artificial Intelligence (AI)', desc: 'Department of Artificial Intelligence' },
  { name: 'Artificial Intelligence and Machine Learning (AI & ML)', desc: 'Department of Artificial Intelligence and Machine Learning' },
  { name: 'Data Science (DS)', desc: 'Department of Data Science' },
  { name: 'Artificial Intelligence and Data Science (AI & DS)', desc: 'Department of Artificial Intelligence and Data Science' },
  { name: 'Electronics and Communication Engineering (ECE)', desc: 'Department of Electronics and Communication Engineering' },
  { name: 'Electrical and Electronics Engineering (EEE)', desc: 'Department of Electrical and Electronics Engineering' },
  { name: 'Civil Engineering (Civil)', desc: 'Department of Civil Engineering' },
  { name: 'Mechanical Engineering (Mechanical)', desc: 'Department of Mechanical Engineering' },
  { name: 'IT Department', desc: 'Campus Network, Hardware, Software & Lab Systems' },
  { name: 'Maintenance Department', desc: 'Furniture, Doors, Windows & General Repairs' },
  { name: 'Hostel Department', desc: 'Hostel Amenities, Rooms & Mess Services' },
  { name: 'Transport Department', desc: 'College Buses, Parking & Commute Services' },
  { name: 'Electrical Department', desc: 'Lighting, Fans, Power Outlets & Air Conditioning' },
  { name: 'Cleanliness Department', desc: 'Sanitization, Housekeeping & Waste Management' },
  { name: 'Security Department', desc: 'Campus Gate Access, CCTV & Safety Management' },
  { name: 'Administration', desc: 'Academic Records, Library & Office Facilities' }
];

async function ensureDepartments() {
  try {
    // Standardize legacy 'AI Department' if present
    await run(`UPDATE departments SET name = 'Artificial Intelligence (AI)', description = 'Department of Artificial Intelligence' WHERE name = 'AI Department' OR name = 'AI'`);

    for (const d of defaultDepts) {
      const existing = await get(`SELECT id FROM departments WHERE name = ?`, [d.name]);
      if (!existing) {
        await run(`INSERT INTO departments (name, description, status) VALUES (?, ?, 'Active')`, [d.name, d.desc]);
      }
    }
  } catch (err) {
    console.error('Failed to ensure departments:', err);
  }
}

async function seedDatabase() {
  const userCount = await get(`SELECT COUNT(*) as count FROM users`);
  if (userCount.count > 0) return;

  console.log('Seeding initial database content...');

  // Seed Admin Account
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminResult = await run(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    ['System Administrator', 'admin@college.edu', adminPasswordHash, 'admin']
  );

  // Seed Departments
  const deptMap = {};
  for (const d of defaultDepts) {
    const res = await run(
      `INSERT INTO departments (name, description) VALUES (?, ?)`,
      [d.name, d.desc]
    );
    deptMap[d.name] = res.lastID;
  }

  // Seed Staff
  const staffMembers = [
    { name: 'Ravi Kumar', email: 'ravi.it@college.edu', phone: '9876543201', dept: 'IT Department', role: 'Network Administrator' },
    { name: 'Suresh Sharma', email: 'suresh.maint@college.edu', phone: '9876543202', dept: 'Maintenance Department', role: 'Facility Supervisor' },
    { name: 'Anita Roy', email: 'anita.hostel@college.edu', phone: '9876543203', dept: 'Hostel Department', role: 'Hostel Warden' },
    { name: 'Vikram Singh', email: 'vikram.elec@college.edu', phone: '9876543204', dept: 'Electrical Department', role: 'Senior Electrician' },
    { name: 'Meena Verma', email: 'meena.clean@college.edu', phone: '9876543205', dept: 'Cleanliness Department', role: 'Housekeeping Lead' }
  ];

  const staffMap = {};
  for (const s of staffMembers) {
    const res = await run(
      `INSERT INTO staff (name, email, phone, department_id, role) VALUES (?, ?, ?, ?, ?)`,
      [s.name, s.email, s.phone, deptMap[s.dept], s.role]
    );
    staffMap[s.name] = res.lastID;
  }

  console.log('Database seeded successfully with initial data.');
}

module.exports = {
  db,
  run,
  get,
  all,
  initDB
};
