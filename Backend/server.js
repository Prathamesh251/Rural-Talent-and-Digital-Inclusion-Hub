const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./src/config/db');
const apiRoutes = require('./src/routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Welcome root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Rural Talent & Digital Inclusion Hub API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server after establishing database connection
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Rural Talent Server running on port ${PORT}`);
      console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Fatal: Could not initialize database. Server stopped.', err.message);
    process.exit(1);
  }
}

startServer();