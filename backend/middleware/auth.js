const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    let token;

    // Check header for token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const extracted = authHeader.split(' ')[1];
      if (extracted && extracted !== 'null' && extracted !== 'undefined') {
        token = extracted;
      }
    }

    // REMOVED: Check cookie if no valid header token found. 
    // We enforce tab-based sessions by strictly requiring the Authorization header
    // sent from frontend's sessionStorage.

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role, fullName }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
  };
};

module.exports = { auth, authorize };
