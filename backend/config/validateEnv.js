const validateEnv = () => {
    const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
    const missingEnv = requiredEnv.filter((env) => !process.env[env]);

    if (missingEnv.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
    }
};

module.exports = validateEnv;
