const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide a full name'],
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [100, 'Password cannot exceed 100 characters'],
    select: false,
  },

  role: {
    type: String,
    enum: ['staff', 'client', 'admin', 'manager'],
    default: 'client',
  },

  phone: {
    type: String,
    match: [/^\+?[\d\s-]{10,15}$/, 'Please provide a valid phone number'],
  },

  address: {
    type: String,
  },



  qualification: {
    type: String,
    default: null,
  },

  status: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending',
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  // ⭐ ADD THIS FIELD SO IMAGE SAVES IN DB
  photo: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});


/* ======================================================
   PRE-SAVE HOOK – CORRECT APPROVAL LOGIC
   ====================================================== */
UserSchema.pre('save', async function (next) {

  if (this.isNew) {
    if (this.role === 'admin') {
      this.status = 'active';
    } else {
      // Only force pending if status is NOT already active (e.g. set by admin controller)
      if (this.status !== 'active') {
        this.status = 'pending';
      }
    }
  }

  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// --- INDEXES ---
// --- INDEXES ---
UserSchema.index({ role: 1, status: 1 });


/* ======================================================
   COMPARE PASSWORD METHOD
   ====================================================== */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);
