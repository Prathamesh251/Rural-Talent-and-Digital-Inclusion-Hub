const express = require('express');
const router = express.Router();
const qaController = require('../controllers/qa.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Review submission and record QA result (Admin only)
router.post('/submissions/:submissionId', requireRole('ADMIN'), qaController.reviewSubmission);

// List QA reviews
router.get('/', requireRole('ADMIN'), qaController.getQAReviews);

module.exports = router;
