const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const assignmentRoutes = require('./assignment.routes');
const qaRoutes = require('./qa.routes');
const adminRoutes = require('./admin.routes');
const paymentRoutes = require('./payment.routes');

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Rural Talent API',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/qa', qaRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
