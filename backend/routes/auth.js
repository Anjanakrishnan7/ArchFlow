const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  refresh
} = require('../controllers/authController');
const { managerLogin } = require('../controllers/managerController');
const { auth } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/register', [
  check('fullName', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
  check('role', 'Invalid role').isIn(['client', 'staff', 'manager', 'admin']),
  // check('phone', 'Phone number must be valid').optional().isMobilePhone(), // Optional: Add locale if needed
], validate, register);
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], validate, login);
router.post('/manager/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], validate, managerLogin);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', auth, getMe);

module.exports = router;
