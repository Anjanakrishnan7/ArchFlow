const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');

/**
 * Service to interact with Google Dialogflow ES
 */
const detectIntent = async (projectId, credentials, message, sessionId = uuidv4(), languageCode = 'en-US') => {
    const sessionClient = new dialogflow.SessionsClient({
        credentials: {
            client_email: credentials.clientEmail,
            private_key: credentials.privateKey.replace(/\\n/g, '\n'),
        },
    });

    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: languageCode,
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        return {
            fulfillmentText: result.fulfillmentText,
            intentName: result.intent ? result.intent.displayName : 'Default Fallback Intent',
            confidence: result.intentDetectionConfidence,
            parameters: result.parameters,
        };
    } catch (error) {
        console.error('Dialogflow DetectIntent Error:', error);
        throw error;
    }
};

module.exports = {
    detectIntent,
};
