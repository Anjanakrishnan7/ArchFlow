const User = require('../models/User');
const Project = require('../models/Project');

// Admin Dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: 'client' });
    const pendingApprovals = await User.countDocuments({ status: 'pending' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalProjects = await Project.countDocuments();

    res.json({
      stats: {
        totalClients,
        totalStaff,
        totalProjects,
        pendingApprovals,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
