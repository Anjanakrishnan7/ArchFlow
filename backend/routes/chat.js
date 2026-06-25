const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');

// @route   POST /api/chat
// @desc    Send message to Dialogflow
router.post('/', handleChat);

module.exports = router;
