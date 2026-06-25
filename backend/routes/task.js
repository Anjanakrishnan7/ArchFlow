const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { markUpdateSeen } = require('../controllers/clientController');
const { deleteUpdate } = require('../controllers/staffController');

// All routes require authentication
router.use(auth);

// Mark update as seen
router.patch('/update/mark-seen/:updateId', markUpdateSeen);

// Delete update
router.delete('/update/:updateId', deleteUpdate);

module.exports = router;
