const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Record payment (Admin only)
router.post('/', requireRole('ADMIN'), paymentController.recordPayment);

// List payments (Admin or Employer)
router.get('/', requireRole('ADMIN', 'EMPLOYER'), paymentController.getPayments);

module.exports = router;
