const User = require('../models/User');

const mongoose = require('mongoose');

// Get all users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    console.log('getUser called with ID:', req.params.id);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ID detected');
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { fullName, name, email, password, role, phone, address, qualification, status } = req.body;

    const photo = req.file ? `/uploads/photos/${req.file.filename}` : '';

    const user = new User({
      fullName: fullName || name, // Support both for backward compatibility
      email,
      password,
      role,
      phone,
      address,
      qualification,
      photo,
      status: status || 'active'
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user (Profile Details + Photo)
exports.updateUser = async (req, res) => {
  try {
    console.log('=== UPDATE USER REQUEST ===');
    console.log('User ID from params:', req.params.id);
    console.log('User ID from token:', req.user.id);
    console.log('Request Body fields:', Object.keys(req.body));
    console.log('Request File:', req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');

    // Security check: simple users can only update themselves
    // Admin (role='admin') can update anyone
    // This assumes req.user is populated by auth middleware
    // Security check: simple users can only update themselves
    // Admin (role='admin') can update anyone
    const userRole = req.user.role;
    const isTargetingSelf = req.user.id.toString() === req.params.id.toString();

    if (userRole !== 'admin' && !isTargetingSelf) {
      console.warn('Unauthorized update attempt:', {
        reqUserId: req.user.id,
        paramsId: req.params.id
      });
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    // 1. Check if updates include password
    const { password, ...otherUpdates } = req.body;
    let user;

    const adminAllowedFields = ['fullName', 'name', 'email', 'phone', 'address', 'qualification', 'status', 'isActive', 'role'];
    const otherAllowedFields = ['fullName', 'name', 'email', 'phone', 'address', 'qualification'];
    const clientAllowedFields = ['phone', 'address', 'fullName', 'name']; // Added fullName/name for basic info update if needed, but phone/address are priority

    let allowedFields = [];
    if (userRole === 'admin') {
      allowedFields = adminAllowedFields;
    } else if (userRole === 'client') {
      allowedFields = clientAllowedFields;
    } else {
      allowedFields = otherAllowedFields;
    }

    // If password is provided (and not empty), use findById + save to trigger pre-save hook
    if (password && password.trim() !== '') {
      if (!isStrongPassword(password)) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain both letters and numbers' });
      }
      console.log('Password update detected');
      user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      Object.keys(otherUpdates).forEach(key => {
        if (allowedFields.includes(key) && otherUpdates[key] !== undefined && otherUpdates[key] !== null) {
          user[key] = otherUpdates[key];
        }
      });

      // Update Password
      user.password = password;

      // Update Photo if provided
      if (req.file) {
        user.photo = `/uploads/photos/${req.file.filename}`;
      }

      await user.save();

      // Return without password
      user = user.toObject();
      delete user.password;

    } else {
      const updates = {};
      console.log('Allowed fields for role', userRole, ':', allowedFields);

      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key) && req.body[key] !== '' && req.body[key] !== null && req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      });

      if (req.file) {
        updates.photo = `/uploads/photos/${req.file.filename}`;
        console.log('Update includes photo:', updates.photo);
      }

      console.log('Final updates object:', updates);

      user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        console.warn('User not found for update:', req.params.id);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    console.log('Update successful for user:', user._id);
    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new passwords' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long and contain both letters and numbers' });
    }

    // 2. Find user with password selected
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // 4. Set new password and save (triggers pre-save hook for hashing)
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




