const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Minutes = require('../models/Minutes');
const PaymentRequest = require('../models/PaymentRequest');
const MonthlyReport = require('../models/MonthlyReport');
const Task = require('../models/Task');
const ProjectTeam = require('../models/ProjectTeam');
const ProjectUpdate = require('../models/ProjectUpdate');
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');
const { isPositiveNumber, isValidDateRange } = require('../middleware/validation');

// Generate Token Helper
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.fullName },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Manager Login
// @route   POST /api/auth/manager/login
// @access  Public
exports.managerLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, role: 'manager' }).select("+password");

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (user.status !== "active") {
            return res.status(403).json({ success: false, message: "Account not active" });
        }

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            accessToken: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                photo: user.photo,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get manager dashboard stats
// @route   GET /api/manager/dashboard
// @access  Private/Manager
exports.getManagerDashboard = async (req, res, next) => {
    try {
        const managerId = req.user.id;

        // Get all projects for this manager
        const projects = await Project.find({
            $or: [{ assignedManager: managerId }, { managerId: managerId }]
        });

        const totalProjects = projects.length;

        // Calculate status distribution
        const statusDistribution = {
            ongoing: 0,
            completed: 0,
            pending: 0,
            onHold: 0
        };

        projects.forEach(project => {
            const status = project.status.toLowerCase();
            if (status === 'ongoing') statusDistribution.ongoing++;
            else if (status === 'completed') statusDistribution.completed++;
            else if (status === 'pending') statusDistribution.pending++;
            else if (status === 'on-hold') statusDistribution.onHold++;
        });

        const activeProjects = statusDistribution.ongoing;
        const totalStaff = await User.countDocuments({ role: 'staff' });


        // Get tasks stats for this manager's projects
        const projectIds = projects.map(p => p._id);
        const pendingTasks = await Task.countDocuments({
            project: { $in: projectIds },
            status: { $nin: ['completed', 'Completed'] }
        });

        const totalTasks = await Task.countDocuments({
            project: { $in: projectIds }
        });

        // Get upcoming deadlines
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const upcomingDeadlines = await Task.countDocuments({
            project: { $in: projectIds },
            dueDate: { $gte: new Date(), $lte: sevenDaysFromNow },
            status: { $nin: ['completed', 'Completed'] }
        });

        const totalComplaints = await Complaint.countDocuments({
            project: { $in: projectIds },
            status: 'pending'
        });

        // Get recent projects
        const recentProjects = await Project.find({
            $or: [{ assignedManager: managerId }, { managerId: managerId }]
        })
            .sort({ createdAt: -1 })
            .limit(5);

        const stats = {
            totalProjects,
            activeProjects,
            totalStaff,

            totalComplaints,
            statusDistribution,
            pendingTasks,
            totalTasks,
            upcomingDeadlines
        };

        res.status(200).json({
            success: true,
            stats,
            recentProjects
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all clients (Manager view)
// @route   GET /api/manager/clients
// @access  Private/Manager
exports.getManagerClients = async (req, res, next) => {
    try {
        const clients = await User.find({ role: 'client' }).select('-password');
        res.status(200).json({ success: true, data: clients });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update client details
// @route   PATCH /api/manager/clients/:id
// @access  Private/Manager
exports.updateClient = async (req, res, next) => {
    try {
        const client = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all staff (Manager view)
// @route   GET /api/manager/staff
// @access  Private/Manager
exports.getManagerStaff = async (req, res, next) => {
    try {
        // Only fetch staff who are 'active' as per requirement
        const staff = await User.find({ role: 'staff', status: 'active' }).select('-password');
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get projects (Manager view)
// @route   GET /api/manager/projects
// @access  Private/Manager
exports.getManagerProjects = async (req, res, next) => {
    try {
        console.log('Fetching projects for manager:', req.user.id);

        let managerId;
        try {
            managerId = new mongoose.Types.ObjectId(req.user.id);
            console.log("Querying with ObjectId:", managerId);
        } catch (err) {
            console.error("Invalid Manager ID format:", req.user.id);
            return res.status(400).json({ success: false, message: 'Invalid User ID' });
        }

        let query = {
            $or: [{ assignedManager: managerId }, { managerId: managerId }]
        };

        if (req.user.role === 'staff') {
            const teamProjects = await ProjectTeam.find({ userId: managerId }).select('projectId');
            const projectIds = teamProjects.map(tp => tp.projectId);
            query = { _id: { $in: projectIds } };
        }

        const projects = await Project.find(query)
            .populate('clientId', 'fullName email')
            .lean(); // Use lean for performance and to allow adding properties

        // Add team count to each project
        const projectsWithTeamCount = await Promise.all(projects.map(async (project) => {
            const teamCount = await ProjectTeam.countDocuments({ projectId: project._id });
            return {
                ...project,
                teamCount
            };
        }));

        console.log(`Found ${projectsWithTeamCount.length} projects for manager ${req.user.id}`);
        res.status(200).json({ success: true, data: projectsWithTeamCount });
    } catch (error) {
        next(error);
    }
};

// @desc    Update project status
// @route   PATCH /api/manager/projects/:id/status
// @access  Private/Manager
exports.updateProjectStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const managerId = req.user.id;

        // Find project and verify manager ownership
        const project = await Project.findOne({
            _id: req.params.id,
            $or: [{ assignedManager: managerId }, { managerId: managerId }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
        }

        project.status = status.toLowerCase();
        await project.save();

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Assign staff to project
// @route   PATCH /api/manager/projects/:id/assign-staff
// @access  Private/Manager
exports.assignStaffToProject = async (req, res, next) => {
    try {
        const { staffIds } = req.body;
        const projectId = req.params.id;

        if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide a list of staff IDs' });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if all selected staff are available
        const unavailableStaff = await User.find({
            _id: { $in: staffIds },
            isAvailable: false
        }).select('fullName');

        if (unavailableStaff.length > 0) {
            const names = unavailableStaff.map(s => s.fullName).join(', ');
            return res.status(400).json({
                success: false,
                message: `The following staff members are currently unavailable: ${names}`
            });
        }


        const newMembers = staffIds.map(staffId => ({
            projectId,
            userId: staffId,
            roleInProject: 'Staff'
        }));

        try {
            await ProjectTeam.insertMany(newMembers, { ordered: false });
        } catch (error) {
            if (error.code !== 11000 && error.writeErrors?.some(e => e.code !== 11000)) {
                console.error("Partial error adding members:", error);
            }
        }

        res.status(200).json({ success: true, message: 'Staff assigned successfully' });
    } catch (error) {
        console.error('Assign staff error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single project details
// @route   GET /api/manager/projects/:id/details
// @access  Private (Manager)
exports.getProjectDetails = async (req, res, next) => {
    try {
        console.log("---- Manager Project Detail Debug ----");
        console.log("Manager ID:", req.user.id);
        console.log("Project ID:", req.params.id);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid project ID format' });
        }

        const project = await Project.findById(req.params.id)
            .populate('assignedManager', 'fullName email')
            .populate('clientId', 'fullName email phone address photo');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const assignedManagerId = project.assignedManager?._id
            ? project.assignedManager._id.toString()
            : project.assignedManager?.toString();

        const managerId = project.managerId?._id
            ? project.managerId._id.toString()
            : project.managerId?.toString();

        console.log("Found Project Assigned Manager:", assignedManagerId, "ManagerID:", managerId);

        const isTeamMember = await ProjectTeam.findOne({ projectId: project._id, userId: req.user.id });

        if (assignedManagerId !== req.user.id && managerId !== req.user.id && !isTeamMember) {
            console.log("Unauthorized Access Attempt");
            return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
        }

        console.log("Access Granted");

        const teamCount = await ProjectTeam.countDocuments({ projectId: project._id });

        const projectData = {
            ...project.toObject(),
            teamCount
        };

        res.json({ success: true, project: projectData });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get project overview data
// @route   GET /api/manager/projects/:id/overview
// @access  Private (Manager)
exports.getProjectOverview = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        let managerId;
        try {
            managerId = new mongoose.Types.ObjectId(req.user.id);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'Invalid User ID' });
        }

        let projectQuery = {
            _id: projectId,
            $or: [{ assignedManager: managerId }, { managerId: managerId }]
        };

        if (req.user.role === 'staff') {
            const isMember = await ProjectTeam.findOne({ projectId, userId: req.user.id });
            if (isMember) {
                projectQuery = { _id: projectId };
            }
        }

        const project = await Project.findOne(projectQuery);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const recentTasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'fullName')
            .sort({ createdAt: -1 })
            .limit(5);

        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const upcomingDeadlines = await Task.find({
            project: projectId,
            dueDate: { $gte: new Date(), $lte: sevenDaysFromNow },
            status: { $nin: ['completed', 'Completed'] }
        }).populate('assignedTo', 'fullName').sort({ dueDate: 1 });

        const pendingPayments = await PaymentRequest.find({
            project: projectId,
            status: { $in: ['Pending', 'pending'] }
        }).sort({ createdAt: -1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayUpdates = await Task.find({
            project: projectId,
            updatedAt: { $gte: today }
        }).populate('assignedTo', 'fullName');

        const teamCount = await ProjectTeam.countDocuments({ projectId: project._id });

        const projectData = {
            ...project.toObject(),
            teamCount
        };

        res.json({
            success: true,
            overview: {
                project: projectData,
                recentTasks,
                upcomingDeadlines,
                pendingPayments,
                todayUpdates
            }
        });
    } catch (error) {
        console.error('Get overview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== TASK MANAGEMENT ====================

// @desc    Create new task
// @route   POST /api/manager/projects/:id/tasks
// @access  Private (Manager)
exports.createTask = async (req, res, next) => {
    try {
        const { title, description, assignedTo, dueDate, category } = req.body;
        const projectId = req.params.id;
        const files = req.files || [];

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (!assignedTo) {
            return res.status(400).json({ success: false, message: 'Task must be assigned to a staff member' });
        }

        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || assignedUser.isAvailable === false) {
            return res.status(400).json({ success: false, message: 'The selected staff member is currently unavailable' });
        }

        const teamMember = await ProjectTeam.findOne({ projectId, userId: assignedTo });
        if (!teamMember) {
            return res.status(400).json({ success: false, message: 'Assigned user must be a member of the project team' });
        }

        // Process attachments
        const attachments = files.map(file => {
            const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/').replace(/^\//, '');
            return `/uploads/${relativePath}`;
        });

        const task = await Task.create({
            title,
            description,
            project: projectId,
            assignedTo,
            dueDate,
            category: category || 'Other',
            createdBy: req.user.id,
            attachments
        });

        const populatedTask = await Task.findById(task._id).populate('assignedTo', 'fullName email');

        res.status(201).json({ success: true, task: populatedTask });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all tasks for a project
// @route   GET /api/manager/projects/:id/tasks
// @access  Private (Manager)
exports.getTasks = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        let projectQuery = {
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        };

        if (req.user.role === 'staff') {
            const isMember = await ProjectTeam.findOne({ projectId, userId: req.user.id });
            if (isMember) {
                projectQuery = { _id: projectId };
            }
        }

        const project = await Project.findOne(projectQuery);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update task
// @route   PATCH /api/manager/projects/:id/tasks/:taskId
// @access  Private (Manager)
exports.updateTask = async (req, res, next) => {
    try {
        const { id: projectId, taskId } = req.params;
        const { title, description, assignedTo, dueDate, category, status } = req.body;
        const files = req.files || [];

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo);
            if (!assignedUser || assignedUser.isAvailable === false) {
                return res.status(400).json({ success: false, message: 'The selected staff member is currently unavailable' });
            }

            const teamMember = await ProjectTeam.findOne({ projectId, userId: assignedTo });
            if (!teamMember) {
                return res.status(400).json({ success: false, message: 'Assigned user must be a member of the project team' });
            }
        }

        const updateData = {
            title,
            description,
            assignedTo,
            dueDate,
            category,
            status: status ? status.toLowerCase() : undefined
        };

        if (files.length > 0) {
            const newAttachments = files.map(file => {
                const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/').replace(/^\//, '');
                return `/uploads/${relativePath}`;
            });

            // For now, we'll append new attachments. 
            // If you want to replace, use: updateData.attachments = newAttachments;
            const existingTask = await Task.findById(taskId);
            if (existingTask) {
                updateData.attachments = [...(existingTask.attachments || []), ...newAttachments];
            }
        }

        const task = await Task.findOneAndUpdate(
            { _id: taskId, project: projectId },
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'fullName email');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.json({ success: true, task });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete task
// @route   DELETE /api/manager/projects/:id/tasks/:taskId
// @access  Private (Manager)
exports.deleteTask = async (req, res, next) => {
    try {
        const { id: projectId, taskId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== MILESTONE MANAGEMENT ====================

// Helper to calculate and update project progress
const calculateProjectProgress = async (projectId) => {
    try {
        const milestones = await Milestone.find({ project: projectId });

        if (milestones.length === 0) {
            await Project.findByIdAndUpdate(projectId, { progress: 0 });
            return 0;
        }

        const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
        const averageProgress = totalProgress / milestones.length;

        await Project.findByIdAndUpdate(projectId, { progress: averageProgress });

        return averageProgress;
    } catch (error) {
        console.error('Error calculating project progress:', error);
    }
};

// @desc    Create new milestone
// @route   POST /api/manager/projects/:id/milestones
// @access  Private (Manager)
exports.createMilestone = async (req, res, next) => {
    try {
        const { title, description, startDate, endDate, status, progress } = req.body;
        const projectId = req.params.id;

        if (!title || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Please provide title, start date, and end date' });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const lastMilestone = await Milestone.findOne({ project: projectId }).sort({ endDate: -1 });
        if (lastMilestone) {
            const lastEndDate = new Date(lastMilestone.endDate);
            lastEndDate.setHours(0, 0, 0, 0);
            const newStartDate = new Date(startDate);
            newStartDate.setHours(0, 0, 0, 0);
            
            if (newStartDate <= lastEndDate) {
                return res.status(400).json({ 
                    success: false, 
                    message: `New milestone must start after the last milestone's end date (${lastEndDate.toLocaleDateString()})` 
                });
            }
        }

        if (!isValidDateRange(startDate, endDate)) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        const milestone = await Milestone.create({
            title,
            description,
            project: projectId,
            startDate,
            endDate,
            status: status ? status.toLowerCase() : 'pending',
            progress: progress || 0,
            createdBy: req.user.id
        });

        await calculateProjectProgress(projectId);

        res.status(201).json({ success: true, milestone });
    } catch (error) {
        console.error('Create milestone error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all milestones for a project
// @route   GET /api/manager/projects/:id/milestones
// @access  Private (Manager)
exports.getMilestones = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        let projectQuery = {
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        };

        if (req.user.role === 'staff') {
            const isMember = await ProjectTeam.findOne({ projectId, userId: req.user.id });
            if (isMember) {
                projectQuery = { _id: projectId };
            }
        }

        const project = await Project.findOne(projectQuery);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const milestones = await Milestone.find({ project: projectId }).sort({ startDate: 1 });

        res.json({ success: true, milestones });
    } catch (error) {
        console.error('Get milestones error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update milestone
// @route   PATCH /api/manager/projects/:id/milestones/:milestoneId
// @access  Private (Manager)
exports.updateMilestone = async (req, res, next) => {
    try {
        const { id: projectId, milestoneId } = req.params;
        const { title, description, startDate, endDate, status, progress } = req.body;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        // Sequential Validation Logic
        const allMilestones = await Milestone.find({ project: projectId }).sort({ startDate: 1 });
        const currentIndex = allMilestones.findIndex(m => m._id.toString() === milestoneId);

        if (currentIndex === -1) {
            return res.status(404).json({ success: false, message: 'Milestone not found in project sequence' });
        }

        const currentMilestone = allMilestones[currentIndex];
        
        const isStatusChanging = status !== undefined && status.toLowerCase() !== currentMilestone.status;
        const isProgressChanging = progress !== undefined && Number(progress) !== currentMilestone.progress;

        if (isStatusChanging || isProgressChanging || req.body.startDate || req.body.endDate || req.body.title || req.body.description) {
            
            // 1. Previous milestone constraint: Only allow editing if previous is completed
            if (currentIndex > 0) {
                const previousMilestone = allMilestones[currentIndex - 1];
                if (previousMilestone.status !== 'completed') {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot edit this milestone. The previous milestone "${previousMilestone.title}" must be completed first.`
                    });
                }
            }

            // 2. Next milestone constraint: Cannot edit if the next milestone is already in progress or completed
            if (currentIndex < allMilestones.length - 1) {
                const nextMilestone = allMilestones[currentIndex + 1];
                if (nextMilestone.status !== 'pending' || nextMilestone.progress > 0) {
                     return res.status(400).json({
                        success: false,
                        message: `Cannot edit this milestone. The next milestone "${nextMilestone.title}" is already in progress.`
                    });
                }
            }
        }

        const milestone = await Milestone.findOneAndUpdate(
            { _id: milestoneId, project: projectId },
            {
                title,
                description,
                startDate,
                endDate,
                status: status ? status.toLowerCase() : undefined,
                progress
            },
            { new: true, runValidators: true }
        );

        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        await calculateProjectProgress(projectId);

        res.json({ success: true, milestone });
    } catch (error) {
        console.error('Update milestone error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete milestone
// @route   DELETE /api/manager/projects/:id/milestones/:milestoneId
// @access  Private (Manager)
exports.deleteMilestone = async (req, res, next) => {
    try {
        const { id: projectId, milestoneId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const allMilestones = await Milestone.find({ project: projectId }).sort({ startDate: 1 });
        const currentIndex = allMilestones.findIndex(m => m._id.toString() === milestoneId);

        if (currentIndex === -1) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        // Constraints for deletion 
        // 1. Cannot delete if the next milestone is in progress
        if (currentIndex < allMilestones.length - 1) {
             const nextMilestone = allMilestones[currentIndex + 1];
             if (nextMilestone.status !== 'pending' || nextMilestone.progress > 0) {
                  return res.status(400).json({
                     success: false,
                     message: `Cannot delete this milestone. The next milestone "${nextMilestone.title}" is already in progress.`
                 });
             }
        }
        
        // 2. Cannot delete if it's already completed and there are subsequent milestones
        if (allMilestones[currentIndex].status === 'completed' && currentIndex < allMilestones.length - 1) {
             return res.status(400).json({
                 success: false,
                 message: `Cannot delete a completed milestone that has subsequent milestones in the queue.`
             });
        }

        const milestone = await Milestone.findOneAndDelete({ _id: milestoneId, project: projectId });

        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        await calculateProjectProgress(projectId);

        res.json({ success: true, message: 'Milestone deleted successfully' });
    } catch (error) {
        console.error('Delete milestone error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== MINUTES MANAGEMENT ====================

// @desc    Create new minutes
// @route   POST /api/manager/projects/:id/minutes
// @access  Private (Manager)
exports.createMinutes = async (req, res, next) => {
    try {
        const { title, meetingDate, attendees, content, actionItems, location } = req.body;
        const projectId = req.params.id;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const minutes = await Minutes.create({
            content,
            projectId,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, minutes });
    } catch (error) {
        console.error('Create minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all minutes for a project
// @route   GET /api/manager/projects/:id/minutes
// @access  Private (Manager)
exports.getMinutes = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        let projectQuery = {
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        };

        if (req.user.role === 'staff') {
            const isMember = await ProjectTeam.findOne({ projectId, userId: req.user.id });
            if (isMember) {
                projectQuery = { _id: projectId };
            }
        }

        const project = await Project.findOne(projectQuery);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const minutes = await Minutes.find({ projectId })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'fullName email');

        res.json({ success: true, minutes });
    } catch (error) {
        console.error('Get minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update minutes
// @route   PATCH /api/manager/projects/:id/minutes/:minutesId
// @access  Private (Manager)
exports.updateMinutes = async (req, res, next) => {
    try {
        const { id: projectId, minutesId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const minutes = await Minutes.findOneAndUpdate(
            { _id: minutesId, projectId },
            { content: req.body.content },
            { new: true, runValidators: true }
        );

        if (!minutes) {
            return res.status(404).json({ success: false, message: 'Minutes not found' });
        }

        res.json({ success: true, minutes });
    } catch (error) {
        console.error('Update minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete minutes
// @route   DELETE /api/manager/projects/:id/minutes/:minutesId
// @access  Private (Manager)
exports.deleteMinutes = async (req, res, next) => {
    try {
        const { id: projectId, minutesId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const minutes = await Minutes.findOneAndDelete({ _id: minutesId, projectId });

        if (!minutes) {
            return res.status(404).json({ success: false, message: 'Minutes not found' });
        }

        res.json({ success: true, message: 'Minutes deleted successfully' });
    } catch (error) {
        console.error('Delete minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== TEAM VIEW ====================
// @desc    Get project team members
// @route   GET /api/manager/projects/:id/team
// @access  Private (Manager)
exports.getProjectTeam = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        let projectQuery = {
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        };

        if (req.user.role === 'staff') {
            const isMember = await ProjectTeam.findOne({ projectId, userId: req.user.id });
            if (isMember) {
                projectQuery = { _id: projectId };
            }
        }

        const project = await Project.findOne(projectQuery);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const team = await ProjectTeam.find({ projectId })
            .populate('userId', 'fullName email role photo status qualification phone');

        res.json({ success: true, team });
    } catch (error) {
        console.error('Get project team error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Remove staff from project
// @route   DELETE /api/manager/projects/:id/team/:staffId
// @access  Private (Manager)
exports.removeStaffFromProject = async (req, res, next) => {
    try {
        const { id: projectId, staffId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const teamMember = await ProjectTeam.findOneAndDelete({ projectId, userId: staffId });

        if (!teamMember) {
            return res.status(404).json({ success: false, message: 'Team member not found' });
        }

        res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error) {
        console.error('Remove team member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create monthly report
// @route   POST /api/manager/projects/:id/monthly-reports
// @access  Private (Manager)
exports.createMonthlyReport = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { summary, issuesOrBlockers } = req.body;
        const files = req.files || [];

        if (!summary) {
            return res.status(400).json({ success: false, message: 'Summary is required' });
        }

        if (files.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one work image is required' });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ assignedManager: req.user.id }, { managerId: req.user.id }]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const workImages = files.map(file => {
            const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
            return `/uploads${relativePath}`;
        });

        const report = await MonthlyReport.create({
            projectId,
            submittedBy: req.user.id,
            summary,
            workImages,
            issuesOrBlockers,
            createdAt: new Date()
        });

        res.status(201).json({ success: true, report });
    } catch (error) {
        console.error('Create monthly report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get monthly reports for a project
// @route   GET /api/manager/projects/:id/monthly-reports
// @access  Private (Manager)
exports.getMonthlyReports = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const managerId = req.user.id;

        // Access check
        let projectQuery = {
            _id: projectId,
            $or: [{ assignedManager: managerId }, { managerId: managerId }]
        };

        if (req.user.role === 'staff') {
            const isMember = await ProjectTeam.findOne({ projectId, userId: req.user.id });
            if (!isMember) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
            }
            projectQuery = { _id: projectId };
        }

        const project = await Project.findOne(projectQuery);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const reports = await MonthlyReport.find({ projectId })
            .populate('submittedBy', 'fullName')
            .sort({ createdAt: -1 });

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get monthly reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Get all complaints
// @route   GET /api/manager/complaints
// @access  Private (Manager)
exports.getComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find()
            .populate('submittedBy', 'fullName email')
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, complaints });
    } catch (error) {
        console.error('Get all complaints error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update complaint status
// @route   PATCH /api/manager/complaints/:id/status
// @access  Private (Manager)
exports.updateComplaintStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Please provide status' });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: status.toLowerCase() },
            { new: true }
        ).populate('submittedBy', 'fullName email')
            .populate('project', 'name');

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        res.json({ success: true, complaint });
    } catch (error) {
        console.error('Update complaint status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all updates for a project
// @route   GET /api/manager/projects/:id/updates
// @access  Private (Manager)
exports.getProjectUpdates = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const managerId = req.user.id;

        // Access check
        let projectQuery = {
            _id: projectId,
            $or: [{ assignedManager: managerId }, { managerId: managerId }]
        };

        if (req.user.role === 'staff') {
            const isMember = await ProjectTeam.findOne({ projectId, userId: req.user.id });
            if (!isMember) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
            }
            projectQuery = { _id: projectId };
        }

        const project = await Project.findOne(projectQuery);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const updates = await ProjectUpdate.find({ projectId })
            .populate('staffId', 'fullName role photo')
            .populate('milestoneId', 'title')
            .sort({ createdAt: -1 });

        res.json({ success: true, updates });
    } catch (error) {
        console.error('Get project updates error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

