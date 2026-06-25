const managerMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a manager' });
    }
};

module.exports = managerMiddleware;
