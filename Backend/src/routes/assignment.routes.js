const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Assign worker to task (Admin only)
router.post('/', requireRole('ADMIN'), assignmentController.assignWorker);

// List assignments for current user / role
router.get('/', assignmentController.getAssignments);

// Get single assignment
router.get('/:id', assignmentController.getAssignmentById);

// Worker marks assignment as started
router.post('/:id/start', requireRole('WORKER', 'ADMIN'), assignmentController.startAssignment);

// Worker submits completed work
router.post('/:id/submit', requireRole('WORKER', 'ADMIN'), assignmentController.submitAssignment);

module.exports = router;
