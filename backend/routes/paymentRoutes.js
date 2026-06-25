const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin routes
router.post('/request', auth, authorize('admin'), paymentController.createPaymentRequest);
router.patch('/verify/:id', auth, authorize('admin'), paymentController.verifyPayment);

// Client routes
router.post('/pay', auth, upload.single('report'), paymentController.submitPayment);

// General routes (access controlled in controller)
router.get('/:projectId', auth, paymentController.getProjectPayments);
router.get('/receipt/:id', auth, paymentController.getReceipt);

module.exports = router;
