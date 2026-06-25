const Project = require('../models/Project');
const Minutes = require('../models/Minutes');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const ProjectTeam = require('../models/ProjectTeam');

// @desc    Get all minutes for a project (Client view - filtered)
// @route   GET /api/client/projects/:projectId/minutes
// @access  Private (Client)
exports.getProjectMinutes = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Verify client owns this project
        const project = await Project.findOne({
            _id: projectId,
            $or: [{ client: req.user.id }, { clientId: req.user.id }]
        });

        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized or project not found' });
        }

        const minutes = await Minutes.find({
            projectId: projectId
        })
            .populate('createdBy', 'fullName email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, minutes });
    } catch (error) {
        console.error('Get client project minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get monthly reports for a project
// @route   GET /api/client/projects/:projectId/monthly-reports
// @access  Private (Client)
exports.getMonthlyReports = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const MonthlyReport = require('../models/MonthlyReport');

        // Verify client owns this project
        const project = await Project.findOne({
            _id: projectId,
            $or: [{ client: req.user.id }, { clientId: req.user.id }]
        });

        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized or project not found' });
        }

        const reports = await MonthlyReport.find({ projectId })
            .populate('submittedBy', 'fullName')
            .sort({ createdAt: -1 });

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get client monthly reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get client dashboard stats
// @route   GET /api/client/dashboard
// @access  Private (Client)
exports.getDashboardStats = async (req, res) => {
    try {
        // Find projects where the user is listed as the client

        // Find projects where the user is listed as the client
        // Note: Project schema might have 'client' (string name) or 'clientId' (ObjectId) or both.
        // Based on getProjectMinutes, we use: $or: [{ client: req.user.id }, { clientId: req.user.id }]
        // But typically req.user.id is an ObjectId.
        // Let's assume standard query for now.
        const query = { $or: [{ client: req.user.id }, { clientId: req.user.id }] };
        const ProjectUpdate = require('../models/ProjectUpdate');
        const PaymentRequest = require('../models/PaymentRequest');

        const projects = await Project.find(query);

        const totalProjects = projects.length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const inProgress = projects.filter(p => p.status === 'ongoing').length;
        const pending = projects.filter(p => p.status === 'pending').length;
        const onHold = projects.filter(p => p.status === 'on-hold').length;

        // Get total project updates for all client projects
        const projectIds = projects.map(p => p._id);
        const projectUpdates = await ProjectUpdate.countDocuments({
            projectId: { $in: projectIds }
        });

        // Get payment requests count for the client
        const paymentRequests = await PaymentRequest.countDocuments({
            clientId: req.user.id,
            status: 'Requested'
        });

        res.json({
            success: true,
            stats: {
                totalProjects,
                completed,
                inProgress,
                pending,
                onHold,
                projectUpdates,
                paymentRequests
            }
        });

    } catch (error) {
        console.error('Get client dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all projects for a client
// @route   GET /api/client/projects
// @access  Private (Client)
exports.getProjects = async (req, res) => {
    try {
        // Find projects where the user is listed as the client

        // Find projects where the user is listed as the client
        // Using the same logic as dashboard stats
        const query = { $or: [{ client: req.user.id }, { clientId: req.user.id }] };

        const projects = await Project.find(query)
            .populate('managerId', 'fullName email phone')
            .sort({ createdAt: 1 })
            .lean(); // Use lean() for better performance and to allow adding properties

        // Fetch milestones for all projects in one query
        const projectIds = projects.map(p => p._id);
        const milestones = await Milestone.find({ project: { $in: projectIds } }).sort({ startDate: 1 });

        // Map milestones to their respective projects
        const projectsWithMilestones = projects.map(project => ({
            ...project,
            milestones: milestones.filter(m => m.project.toString() === project._id.toString())
        }));

        res.json({ success: true, projects: projectsWithMilestones });
    } catch (error) {
        console.error('Get client projects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Get complete project details (info, tasks, milestones)
// @route   GET /api/client/projects/:projectId/details
// @access  Private (Client)
exports.getProjectDetails = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Verify client owns this project
        const project = await Project.findOne({
            _id: projectId,
            $or: [{ client: req.user.id }, { clientId: req.user.id }]
        }).populate('managerId', 'fullName email');

        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized or project not found' });
        }

        // Fetch tasks
        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'fullName email phone photo')
            .sort({ dueDate: 1 });

        // Fetch milestones
        const milestones = await Milestone.find({ project: projectId })
            .sort({ startDate: 1 });

        res.json({
            success: true,
            project,
            tasks,
            milestones
        });
    } catch (error) {
        console.error('Get client project details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Get project team members (Manager + Staff)
// @route   GET /api/client/projects/:projectId/team
// @access  Private (Client)
exports.getProjectTeam = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Verify client owns this project
        const project = await Project.findOne({
            _id: projectId,
            $or: [{ client: req.user.id }, { clientId: req.user.id }]
        }).populate('managerId', 'fullName email phone qualification');

        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized or project not found' });
        }

        // Fetch team members from ProjectTeam
        const teamMembers = await ProjectTeam.find({ projectId })
            .populate('userId', 'fullName email phone photo qualification')
            .sort({ assignedAt: 1 });

        // Fetch all tasks to get categories for each staff
        const tasks = await Task.find({ project: projectId }).select('assignedTo category');
        const userCategories = {};

        tasks.forEach(task => {
            if (task.assignedTo) {
                const uid = task.assignedTo.toString();
                if (!userCategories[uid]) userCategories[uid] = new Set();
                userCategories[uid].add(task.category);
            }
        });

        // Build the team list
        const team = [];

        // 2. Add Staff members
        teamMembers.forEach(member => {
            if (member.userId) {
                const uid = member.userId._id.toString();
                const categories = userCategories[uid]
                    ? Array.from(userCategories[uid]).join(', ')
                    : (member.roleInProject || 'Staff');

                team.push({
                    _id: member._id,
                    role: 'Staff',
                    type: categories,
                    fullName: member.userId.fullName,
                    email: member.userId.email,
                    phone: member.userId.phone,
                    photo: member.userId.photo,
                    isManager: false
                });
            }
        });

        res.json({ success: true, team });
    } catch (error) {
        console.error('Get project team error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Get project updates
// @route   GET /api/client/projects/:projectId/updates
// @access  Private (Client)
exports.getProjectUpdates = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const ProjectUpdate = require('../models/ProjectUpdate');

        // Verify client owns this project
        const project = await Project.findOne({
            _id: projectId,
            $or: [{ client: req.user.id }, { clientId: req.user.id }]
        });

        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized or project not found' });
        }

        const updates = await ProjectUpdate.find({ projectId })
            .populate('staffId', 'fullName')
            .sort({ createdAt: -1 });

        res.json({ success: true, updates });
    } catch (error) {
        console.error('Get project updates error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Mark update as seen by client
// @route   PATCH /api/client/task/update/mark-seen/:updateId
// @access  Private (Client)
exports.markUpdateSeen = async (req, res) => {
    try {
        const updateId = req.params.updateId;
        const ProjectUpdate = require('../models/ProjectUpdate');

        const update = await ProjectUpdate.findById(updateId);
        if (!update) {
            return res.status(404).json({ success: false, message: 'Update not found' });
        }

        // Verify client owns the project this update belongs to
        const project = await Project.findOne({
            _id: update.projectId,
            $or: [{ client: req.user.id }, { clientId: req.user.id }]
        });

        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update seen status
        update.feedback.seen = true;
        update.feedback.seenAt = new Date();
        if (req.body.message !== undefined) {
            update.feedback.message = req.body.message;
        }

        await update.save();

        res.json({ success: true, update });
    } catch (error) {
        console.error('Mark update seen error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Get all complaints for a client
// @route   GET /api/client/complaints
// @access  Private (Client)
exports.getComplaints = async (req, res) => {
    try {
        const Complaint = require('../models/Complaint');
        const complaints = await Complaint.find({ submittedBy: req.user.id })
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, complaints });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Submit a new complaint
// @route   POST /api/client/complaints
// @access  Private (Client)
exports.submitComplaint = async (req, res) => {
    try {
        const { title, description, projectId } = req.body;
        const Complaint = require('../models/Complaint');

        if (!title || !description || !projectId) {
            return res.status(400).json({ success: false, message: 'Please provide title, description and select a project' });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ client: req.user.id }, { clientId: req.user.id }]
        });
        
        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized or project not found' });
        }

        let attachmentPaths = [];
        if (req.files && req.files.length > 0) {
            attachmentPaths = req.files.map(file => {
                const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/').replace(/^\//, '');
                return `/uploads/${relativePath}`;
            });
        }

        const complaint = await Complaint.create({
            title,
            description,
            project: projectId,
            submittedBy: req.user.id,
            attachments: attachmentPaths
        });

        res.status(201).json({ success: true, complaint });
    } catch (error) {
        console.error('Submit complaint error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all payment requests for a client
// @route   GET /api/client/payments
// @access  Private (Client)
exports.getClientPayments = async (req, res) => {
    try {
        const PaymentRequest = require('../models/PaymentRequest');
        const PaymentTransaction = require('../models/PaymentTransaction');

        const payments = await PaymentRequest.find({ clientId: req.user.id })
            .populate('projectId', 'name')
            .sort({ requestedAt: -1 })
            .lean();

        // For each payment, find its transaction to get the receipt if it exists
        const paymentIds = payments.map(p => p._id);
        const projectIds = payments.map(p => p.projectId?._id || p.projectId);

        // Find transactions linked by ID OR matching project+client (for fallback)
        const transactions = await PaymentTransaction.find({
            $or: [
                { requestId: { $in: paymentIds } },
                { projectId: { $in: projectIds }, clientId: req.user.id }
            ]
        }).lean();

        const paymentsWithTransactions = payments.map(p => {
            const transaction = transactions.find(t =>
                (t.requestId && t.requestId.toString() === p._id.toString()) ||
                (!t.requestId &&
                    t.projectId?.toString() === p.projectId?._id?.toString() &&
                    t.amount === p.amount)
            );
            return {
                ...p,
                receiptUrl: transaction ? transaction.receiptUrl : null,
                paymentProofUrl: transaction ? transaction.paymentProofUrl : null,
                transactionId: transaction ? transaction._id : null
            };
        });

        res.json({ success: true, payments: paymentsWithTransactions });
    } catch (error) {
        console.error('Get client payments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteComplaint = async (req, res) => {
    try {
        const Complaint = require('../models/Complaint');
        const complaint = await Complaint.findOne({ _id: req.params.id, submittedBy: req.user.id });

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        await Complaint.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
