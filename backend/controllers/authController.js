const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { isValidEmail, isStrongPassword } = require('../middleware/validation');

// Create JWT token
// CREATE TOKEN HELPERS
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.fullName, fullName: user.fullName },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Extended expiry for admin project fix
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, // Use separate secret in prod if possible
    { expiresIn: '7d' } // Long-lived refresh token
  );
};

// REGISTER USER (Client or Staff)
exports.register = async (req, res) => {
  const { fullName, email, password, role, phone, qualification } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long and contain both letters and numbers" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    if (role === "admin") {
      return res.status(400).json({ success: false, message: "Admin cannot self-register" });
    }

    const newUser = new User({
      fullName,
      email,
      password,
      role,
      phone,
      qualification
    });

    await newUser.save();

    return res.json({
      success: true,
      message: "Registration successful. Please wait for admin approval."
    });

  } catch (error) {
    console.log("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, role }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Block non-admin pending accounts
    // isActive only affects availability display, not login permission
    if (user.role !== "admin" && user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved yet"
      });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store Refresh Token in Cookie
    // Store Refresh Token in Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // NEW: Store Access Token in Cookie (HttpOnly)
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching expiry) - or 15m if strict
    });

    return res.json({
      success: true,
      accessToken, // Keep sending for now (backward compat) but frontend will ignore soon
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photo: user.photo,
        phone: user.phone,
        address: user.address,
        qualification: user.qualification
      }
    });

  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// REFRESH TOKEN
exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    // Verify Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Generate new Access Token
    const accessToken = generateAccessToken(user);

    // Set new Access Token Cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken
    });

  } catch (error) {
    console.log("Refresh token error:", error);
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

// CHECK USER SESSION (/me)
exports.getMe = async (req, res) => {
  // Middleware already attached user to req
  if (!req.user) {
    return res.json({ success: true, user: null });
  }

  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: true, user: null });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("token");
  res.json({ success: true });
};
