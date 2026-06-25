const express = require('express');
const router = express.Router();
const {
  getAdminDashboard
} = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

// Admin dashboard
router.get('/admin', auth, authorize('admin'), getAdminDashboard);

module.exports = router;

