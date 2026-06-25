const { GoogleGenerativeAI } = require('@google/generative-ai');
const { systemInstruction } = require('./chatbotPrompt');

const generateResponse = async (message, history = []) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in environment variables');
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction
        });

        let formattedHistory = history.map(msg => ({
            role: msg.isBot ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));


        while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            formattedHistory.shift();
        }

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage([{ text: message }]);
        const responseText = result.response.text();

        return {
            fulfillmentText: responseText,
            intentName: 'Gemini Generative Intent',
            confidence: 1.0,
        };
    } catch (error) {
        console.error('Gemini GenerateResponse Error:', error);
        throw error;
    }
};

module.exports = {
    generateResponse,
};
