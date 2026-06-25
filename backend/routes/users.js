const express = require('express');
const router = express.Router();
const { getUsersByRole, getUser, createUser, updateUser, deleteUser, changePassword } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);


/* ======================================================
   GET PENDING USERS (CLIENT + STAFF)
   ====================================================== */
router.get(
  "/pending",
  authorize("admin"),
  async (req, res) => {
    try {
      const User = require("../models/User");

      const pending = await User.find({
        role: { $in: ["staff", "client"] },
        status: "pending",
      }).select("-password");

      res.json({ success: true, users: pending });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending users",
      });
    }
  }
);


/* ======================================================
   GET COUNT OF PENDING USERS
   ====================================================== */
router.get(
  "/pending/count",
  authorize("admin"),
  async (req, res) => {
    try {
      const User = require("../models/User");

      const count = await User.countDocuments({
        role: { $in: ["staff", "client"] },
        status: "pending",
      });

      res.json({ success: true, count });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending count",
      });
    }
  }
);


/* ======================================================
   APPROVE OR DECLINE USER
   ====================================================== */
router.patch(
  "/approve/:id",
  authorize("admin"),
  async (req, res) => {
    try {
      const { action } = req.body;
      const User = require("../models/User");

      if (!["approve", "decline"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid action.",
        });
      }

      if (action === "decline") {
        await User.findByIdAndDelete(req.params.id);
        return res.json({
          success: true,
          message: "User registration declined and removed",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: "active", isActive: true },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      res.json({
        success: true,
        message: "User approved successfully",
        user,
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to update user status",
      });
    }
  }
);


/* ======================================================
   ADMIN: GET USERS BY ROLE
   ====================================================== */
router.get('/role/:role', authorize('admin'), getUsersByRole);


/* ======================================================
   CHANGE PASSWORD
   ====================================================== */
router.put('/change-password', changePassword);


/* ======================================================
   GET SINGLE USER
   ====================================================== */
router.get('/:id', getUser);


/* ======================================================
   ADMIN: CREATE USER
   ====================================================== */
router.post('/', authorize('admin'), upload.single('photo'), createUser);


/* ======================================================
   UPDATE USER
   ====================================================== */
router.put('/:id', upload.single('photo'), updateUser);


/* ======================================================
   ADMIN: DELETE USER
   ====================================================== */
router.delete('/:id', authorize('admin'), deleteUser);


module.exports = router;
