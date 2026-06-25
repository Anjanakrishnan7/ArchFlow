const { generateResponse } = require('../utils/geminiService');

/**
 * @desc    Handle chatbot message
 * @route   POST /api/chat
 * @access  Public (or Private depending on requirements)
 */
exports.handleChat = async (req, res, next) => {
    try {
        const { message, sessionId, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn('Gemini API key not found in environment variables');
            return res.status(503).json({
                success: false,
                message: 'Chatbot service is currently unavailable. Please verify environment variables.'
            });
        }

        const response = await generateResponse(message, history);

        res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        next(error);
    }
};
