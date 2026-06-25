const User = require('../models/User');
const Project = require('../models/Project');
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');
const { isPositiveNumber, isValidDateRange, isValidEmail, isStrongPassword } = require('../middleware/validation');

// ------------------------------------------------------------------
// SECTION 1: ADMIN AUTH
// ------------------------------------------------------------------

// POST /api/admin/login
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Find admin
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check Role
        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Not an admin.' });
        }

        // Check Password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role, fullName: user.fullName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send Cookie
        res.cookie('token', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production', // Uncomment in prod
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Admin logged in successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                photo: user.photo,
                phone: user.phone,
                address: user.address,
            }
        });

    } catch (error) {
        next(error); // Forward to centralized error handler
    }
};

// ------------------------------------------------------------------
// SECTION 2: DASHBOARD
// ------------------------------------------------------------------

// GET /api/admin/dashboard/stats
exports.getAdminDashboardStats = async (req, res, next) => {
    try {
        const totalManagers = await User.countDocuments({ role: 'manager' });
        const totalStaff = await User.countDocuments({ role: 'staff' });
        const totalClients = await User.countDocuments({ role: 'client' });
        const totalProjects = await Project.countDocuments();
        const totalComplaints = await Complaint.countDocuments();

        // "Pending Approvals" - usually means users waiting for approval
        const totalPendingApprovals = await User.countDocuments({ approved: false });
        // OR status: 'pending' depending on User model usage. 
        // Looking at User.js, it has `status: { type: String, enum: ['pending', 'active'...], default: 'pending' }`
        // AND the routes/admin.js used `approved: false`. 
        // Let's check both or stick to one. User.js has `status`. routes/admin.js uses `approved`.
        // I will count `status: 'pending'` to align with the schema I saw earlier, 
        // but the existing admin routes use `approved` field which might not be in the schema I saw?
        // Wait, the User.js file I viewed had `status` field but NO `approved` field explicitly defined in the schema snippet I saw?
        // Let's re-read User.js output. 
        // Ah, lines 41-45 define `status`. Line 132 in admin.js queries `approved: false`. 
        // This is a discrepancy in the existing code. `status: 'pending'` seems the safer bet based on schema.
        // However, I must NOT break existing code. 
        // I will return stats based on `status: 'pending'` as it is clearly in the model.

        const pendingRequests = await User.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            stats: {
                totalManagers,
                totalStaff,
                totalClients,
                totalProjects,
                totalComplaints,
                totalPendingApprovals: pendingRequests,
            }
        });

    } catch (error) {
        next(error);
    }
};

// ------------------------------------------------------------------
// SECTION 3: USER MANAGEMENT STUBS (To be implemented fully in Section 2)
// ------------------------------------------------------------------

exports.createManager = async (req, res) => {
    try {
        const { fullName, email, password, phone, address } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'Please provide fullName, email, password, and phone' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain both letters and numbers' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const photo = req.file ? `/uploads/photos/${req.file.filename}` : '';
        user = new User({
            fullName,
            email,
            password,
            phone,
            address,
            photo,
            role: 'manager',
            status: 'active'
        });

        await user.save();

        res.json({
            success: true,
            message: 'Manager created successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};
exports.getManagers = async (req, res) => {
    try {
        const managers = await User.find({ role: 'manager' }).select('-password');
        res.json({ success: true, users: managers });
    } catch (error) {
        console.error("Error fetching managers:", error);
        res.status(500).json({ success: false, message: "Error fetching managers" });
    }
};
exports.createStaff = async (req, res) => {
    try {
        const { fullName, email, password, phone, qualification, address } = req.body;

        if (!fullName || !email || !password || !phone || !qualification) {
            return res.status(400).json({ success: false, message: 'Please provide fullName, email, password, phone, and qualification' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain both letters and numbers' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const photo = req.file ? `/uploads/photos/${req.file.filename}` : '';
        user = new User({
            fullName,
            email,
            password,
            phone,
            role: 'staff',
            qualification,
            address, // <--- Added address
            photo,
            status: 'active' 
        });

        await user.save();

        res.json({
            success: true,
            message: 'Staff created successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};
exports.createClient = async (req, res) => {
    try {
        const { fullName, email, password, phone, address } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'Please provide fullName, email, password, and phone' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain both letters and numbers' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const photo = req.file ? `/uploads/photos/${req.file.filename}` : '';
        user = new User({
            fullName,
            email,
            password,
            phone,
            address,
            photo,
            role: 'client',
            status: 'active'
        });

        await user.save();

        res.json({
            success: true,
            message: 'Client created successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

// ------------------------------------------------------------------
// SECTION 4: PROJECT MANAGEMENT
// ------------------------------------------------------------------

// PATCH /api/admin/projects/:id/assign-manager
exports.assignManagerToProject = async (req, res) => {
    try {
        const { managerId } = req.body;
        const projectId = req.params.id;

        if (!managerId) {
            return res.status(400).json({ success: false, message: "Please provide a manager ID" });
        }

        // Verify manager exists and has manager role
        const manager = await User.findById(managerId);
        if (!manager || manager.role !== 'manager') {
            return res.status(400).json({ success: false, message: "Invalid manager ID or user is not a manager" });
        }

        // Check if manager is available
        if (manager.isAvailable === false) {
            return res.status(400).json({ success: false, message: "The selected manager is currently unavailable for assignments" });
        }

        // Update project with assigned manager
        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                assignedManager: managerId,
                managerId: managerId
            },
            { new: true }
        )
            .populate('assignedManager', 'fullName email');

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.json({
            success: true,
            message: "Manager assigned successfully",
            project: project
        });

    } catch (error) {
        console.error("Error assigning manager:", error);
        res.status(500).json({ success: false, message: "Error assigning manager to project" });
    }
};


// POST /api/admin/projects
exports.createProject = async (req, res, next) => {
    try {
        const { name, type, location, clientId, budget, startDate, endDate, managerId, description } = req.body;

        // 1. Basic Validation
        if (!name || !clientId || !budget) {
            return res.status(400).json({ success: false, message: "Please provide Name, Client, and Budget" });
        }

        if (!isPositiveNumber(budget)) {
            return res.status(400).json({ success: false, message: "Budget must be a positive number" });
        }

        if (!isValidDateRange(startDate, endDate)) {
            return res.status(400).json({ success: false, message: "End date must be after start date" });
        }

        // 2. Validate Client
        const clientUser = await User.findById(clientId);
        if (!clientUser || clientUser.role !== 'client') {
            return res.status(400).json({ success: false, message: "Invalid Client selected" });
        }

        // 3. Validate Manager (if provided)
        let assignedManager = null;
        if (managerId) {
            const managerUser = await User.findById(managerId);
            if (!managerUser || managerUser.role !== 'manager') {
                return res.status(400).json({ success: false, message: "Invalid Manager selected" });
            }
            if (managerUser.isAvailable === false) {
                return res.status(400).json({ success: false, message: "The selected manager is currently unavailable for assignments" });
            }
            assignedManager = managerId;
        }

        // 4. Create Project
        const project = await Project.create({
            name,
            type,
            location,
            description,
            clientId,
            client: clientUser.fullName, // Legacy text field support
            budget,
            startDate: startDate || Date.now(),
            endDate,
            managerId: assignedManager,
            assignedManager: assignedManager, // Legacy/Dual support
            status: 'pending' // Default status
        });

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get monthly reports for a project (Admin)
// @route   GET /api/admin/projects/:id/reports
// @access  Private (Admin)
exports.getMonthlyReports = async (req, res) => {
    try {
        const MonthlyReport = require('../models/MonthlyReport');
        const projectId = req.params.id;

        const reports = await MonthlyReport.find({ projectId })
            .populate('submittedBy', 'fullName')
            .sort({ createdAt: -1 });

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get monthly reports error (Admin):', error);
        res.status(500).json({ success: false, message: 'Server error fetching reports' });
    }
};


// @desc    Toggle user availability status
// @route   PATCH /api/admin/users/:id/availability
// @access  Private (Admin)
exports.toggleUserAvailability = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isAvailable = !user.isAvailable;
        await user.save();

        res.json({
            success: true,
            message: `User availability set to ${user.isAvailable ? 'Available' : 'Unavailable'}`,
            isAvailable: user.isAvailable
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update project details
// @route   PUT /api/admin/projects/:id
// @access  Private (Admin)
exports.updateProject = async (req, res, next) => {
    try {
        const { name, type, location, clientId, budget, startDate, endDate, managerId, description, status } = req.body;
        const projectId = req.params.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // 1. Basic Validation
        if (name && !name) return res.status(400).json({ success: false, message: "Project Name is required" });
        if (budget && !isPositiveNumber(budget)) {
            return res.status(400).json({ success: false, message: "Budget must be a positive number" });
        }
        if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
            return res.status(400).json({ success: false, message: "End date must be after start date" });
        }

        // 2. Validate Client (if changed)
        if (clientId && clientId.toString() !== project.clientId?.toString()) {
            const clientUser = await User.findById(clientId);
            if (!clientUser || clientUser.role !== 'client') {
                return res.status(400).json({ success: false, message: "Invalid Client selected" });
            }
            project.clientId = clientId;
            project.client = clientUser.fullName; // Update legacy field
        }

        // 3. Validate Manager (if changed)
        if (managerId !== undefined && managerId !== project.assignedManager?.toString()) {
            if (managerId) {
                const managerUser = await User.findById(managerId);
                if (!managerUser || managerUser.role !== 'manager') {
                    return res.status(400).json({ success: false, message: "Invalid Manager selected" });
                }
                project.assignedManager = managerId;
                project.managerId = managerId;
            } else {
                project.assignedManager = null;
                project.managerId = null;
            }
        }

        // 4. Update Other Fields
        if (name) project.name = name;
        if (type) project.type = type;
        if (location !== undefined) project.location = location;
        if (description !== undefined) project.description = description;
        if (budget) project.budget = budget;
        if (startDate) project.startDate = startDate;
        if (endDate !== undefined) project.endDate = endDate;
        if (status) project.status = status;

        await project.save();

        res.json({
            success: true,
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Optional: Check for associated data (like payments, tasks) 
        // For now, simple delete
        await Project.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
