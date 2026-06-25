const User = require('../models/User');
const Project = require('../models/Project');

// GET /api/admin/dashboard/stats
const getAdminStats = async (req, res) => {
    try {
        const totalManagers = await User.countDocuments({ role: 'manager', status: 'active' });
        const totalStaff = await User.countDocuments({ role: 'staff', status: 'active' });
        const totalClients = await User.countDocuments({ role: 'client', status: 'active' });
        const totalProjects = await Project.countDocuments();

        res.status(200).json({
            success: true,
            totalManagers,
            totalStaff,
            totalClients,
            totalProjects
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to fetch dashboard statistics"
        });
    }
};

module.exports = { getAdminStats };
