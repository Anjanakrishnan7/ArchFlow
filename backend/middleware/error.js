const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Always log stack trace for debugging

    let error = { ...err };
    error.message = err.message;

    // Mongoose Bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = { message, statusCode: 404 };
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        // Only send stack in development, never in production (High #9)
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
};

module.exports = errorHandler;
