require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const checkEnv = require('./config/validateEnv');

// --- CONFIG & VALIDATION ---
checkEnv(); // Will crash server if env is missing


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const managerRoutes = require('./routes/manager');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const clientRoutes = require('./routes/client');
const minutesRoutes = require('./routes/minutes');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/paymentRoutes');
const taskRoutes = require('./routes/task');
const chatRoutes = require('./routes/chat');



// --- SECURITY CHECKS ---
// JWT_SECRET checked in validateEnv.js

const app = express();

// --- SECURITY MIDDLEWARES ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(mongoSanitize());
app.use(hpp());
app.use(morgan('dev')); // Request Logging

// HTTPS Redirect (Production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}


// --- MIDDLEWARES ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increased limit for dev/testing
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth', authLimiter);
app.use('/api/auth/manager/login', authLimiter);


app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DB ---
connectDB();

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/minutes', minutesRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/chat', chatRoutes);

const errorHandler = require('./middleware/error');
app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Trying another port...`);
    const newPort = PORT + 1;
    server.listen(newPort, () => console.log(`Server running on ${newPort}`));
  } else {
    console.error(err);
  }
});
