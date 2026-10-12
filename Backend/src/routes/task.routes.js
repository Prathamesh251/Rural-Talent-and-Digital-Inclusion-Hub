const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticateToken);

// Create task (Employer, Admin)
router.post('/', requireRole('EMPLOYER', 'ADMIN'), taskController.createTask);

// List tasks (Filtered by role)
router.get('/', taskController.getTasks);

// Get specific task
router.get('/:id', taskController.getTaskById);

// Update task
router.patch('/:id', taskController.updateTask);

// Upload CSV/XLSX source file
router.post('/:id/files', requireRole('EMPLOYER', 'ADMIN'), upload.single('file'), taskController.uploadTaskFile);

// Task records (records within task)
router.get('/:id/records', taskController.getTaskRecords);

// Save/update individual record
router.patch('/records/:recordId', requireRole('WORKER', 'ADMIN'), taskController.updateRecord);

module.exports = router;
