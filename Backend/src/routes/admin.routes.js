const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// Admin Dashboard KPI Stats
router.get('/dashboard', adminController.getDashboardStats);

// Worker verification & listing
router.get('/workers', adminController.listWorkers);
router.patch('/workers/:id/verify', adminController.verifyWorker);

// Employer verification & listing
router.get('/employers', adminController.listEmployers);
router.patch('/employers/:id/verify', adminController.verifyEmployer);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
