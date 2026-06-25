const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect Admin Routes
const adminAuth = async (req, res, next) => {
    try {

        // 1. Get token from header (Bearer <token>)
        const authHeader = req.headers.authorization;
        let token = authHeader?.split(" ")[1];

        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authenticated, please login." });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Check if user is actually admin
        // Optional: Fetch user from DB to be extra sure the role hasn't changed
        // For now we rely on the token for speed, or fetch if we want to be strict.
        // Let's fetch to be safe as per "Admin routes must be protected using admin-only middleware."
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error("Admin Auth Error:", err);
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

module.exports = { adminAuth };
