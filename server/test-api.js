const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing College Complaint API Endpoints ---');

  // 1. Health check
  const health = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. GET /api/health -> Status:', health.status, health.data.status === 'OK' ? 'PASSED' : 'FAILED');

  // 2. Admin Login
  const adminLogin = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'admin@college.edu', password: 'admin123' }
  );
  console.log('2. POST /api/auth/login (Admin) -> Status:', adminLogin.status, adminLogin.data.token ? 'PASSED' : 'FAILED');
  const adminToken = adminLogin.data.token;

  // 3. Student Login
  const studentLogin = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'rahul@college.edu', password: 'student123' }
  );
  console.log('3. POST /api/auth/login (Student) -> Status:', studentLogin.status, studentLogin.data.token ? 'PASSED' : 'FAILED');
  const studentToken = studentLogin.data.token;

  // 4. Fetch Departments
  const depts = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/departments',
    method: 'GET'
  });
  console.log('4. GET /api/departments -> Status:', depts.status, depts.data.departments ? 'PASSED' : 'FAILED');

  // 5. Admin Statistics API
  const stats = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/statistics',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('5. GET /api/admin/statistics -> Status:', stats.status, stats.data.total !== undefined ? 'PASSED' : 'FAILED');

  // 6. Student Complaints
  const studentComplaints = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/complaints/my',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log('6. GET /api/complaints/my -> Status:', studentComplaints.status, studentComplaints.data.complaints ? 'PASSED' : 'FAILED');

  console.log('--- All Backend API Verification Tests Finished ---');
}

runTests().catch((err) => console.error('Test execution failed:', err));
