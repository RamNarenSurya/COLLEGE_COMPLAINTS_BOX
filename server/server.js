const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const departmentRoutes = require('./routes/departments');
const staffRoutes = require('./routes/staff');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'College Complaint Management System API', timestamp: new Date() });
});

// Serve frontend static build if production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('API Server Running. Frontend build not present yet.');
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize DB and Start Server
function startServer(retries = 5) {
  initDB()
    .then(() => {
      // Trigger background sync to Neon PostgreSQL Cloud DB if configured
      if (process.env.NEON_DATABASE_URL) {
        try {
          const { syncToNeon } = require('./sync-neon');
          syncToNeon()
            .then(() => console.log('⚡ [Neon Cloud DB] Startup bi-directional cloud sync completed.'))
            .catch((err) => console.warn('⚡ [Neon Cloud DB] Startup cloud sync notice:', err.message));
        } catch (e) {
          console.error('Neon sync helper error:', e.message);
        }
      }

      const server = app.listen(PORT, () => {
        console.log(`===================================================`);
        console.log(`🚀 College Complaint API Server running on port ${PORT}`);
        console.log(`   Health Check: http://localhost:${PORT}/api/health`);
        console.log(`===================================================`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`⚠️ Port ${PORT} is busy. Retrying connection in 1.5s... (${retries} retries left)`);
          if (retries > 0) {
            setTimeout(() => {
              server.close();
              startServer(retries - 1);
            }, 1500);
          } else {
            console.error(`❌ Port ${PORT} is permanently occupied by another application.`);
          }
        } else {
          console.error('Unhandled Server Error:', err);
        }
      });
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
    });
}

startServer();
