const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Document = require('../models/Document');
const Minutes = require('../models/Minutes');
const MonthlyReport = require('../models/MonthlyReport');
const ProjectTeam = require('../models/ProjectTeam');
const Milestone = require('../models/Milestone');
const ProjectUpdate = require('../models/ProjectUpdate');


// @desc    Get tasks assigned to logged-in staff
// @route   GET /api/staff/tasks
// @access  Private (Staff)
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate({
                path: 'project',
                populate: {
                    path: 'clientId',
                    select: 'fullName'
                }
            })
            .populate({
                path: 'projectId',
                populate: {
                    path: 'clientId',
                    select: 'fullName'
                }
            })
            .sort({ dueDate: 1 }); // Sort by due date ascending

        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Get my tasks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update task status
// @route   PATCH /api/staff/tasks/:id/status
// @access  Private (Staff)
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const taskId = req.params.id;
        const userId = req.user.id;

        console.log(`[DEBUG] Attempting to update task ${taskId} to status: ${status} for user: ${userId}`);

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid task ID format' });
        }

        // Find task
        const task = await Task.findById(taskId);

        if (!task) {
            console.warn(`[DEBUG] Task ${taskId} not found in database`);
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        console.log(`[DEBUG] Task found. AssignedTo in DB: ${task.assignedTo}, User from token: ${userId}`);

        // Verify ownership
        if (task.assignedTo.toString() !== userId.toString()) {
            console.warn(`[DEBUG] Task ${taskId} is assigned to ${task.assignedTo}, but user ${userId} attempted update`);
            return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
        }

        const currentStatusNormalized = task.status ? task.status.toLowerCase() : '';
        const requestedStatusNormalized = status ? status.toLowerCase() : '';

        console.log(`[DEBUG] Current Normalized: '${currentStatusNormalized}', Requested Normalized: '${requestedStatusNormalized}'`);

        // Allow status updates even for completed tasks, to let staff fix mistakes

        // Standardize status: lowercase with hyphens
        const finalStatus = requestedStatusNormalized.replace(/\s+/g, '-');
        console.log(`[DEBUG] Final status to save: '${finalStatus}'`);

        task.status = finalStatus;
        await task.save();

        console.log(`[DEBUG] Task ${taskId} updated successfully to ${finalStatus}`);
        res.json({ success: true, task });
    } catch (error) {
        console.error('[DEBUG] Update task status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add document to task
// @route   POST /api/staff/tasks/:id/documents
// @access  Private (Staff)
exports.addTaskDocument = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Basic file type validation
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
        const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExt)) {
            return res.status(400).json({ success: false, message: 'Invalid file type' });
        }

        // Verify task belongs to staff
        const task = await Task.findOne({ _id: taskId, assignedTo: req.user.id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Cannot add documents to completed tasks' });
        }

        // Construct fileUrl
        const fileUrl = `/uploads/${file.path.split('uploads')[1].replace(/\\/g, '/').replace(/^\//, '')}`;

        // Create Document
        const document = await Document.create({
            projectId: task.project,
            title: title || file.originalname,
            fileUrl: fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: req.user.id
        });

        res.status(201).json({ success: true, document });
    } catch (error) {
        console.error('Add document error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add minutes to task
// @route   POST /api/staff/tasks/:id/minutes
// @access  Private (Staff)
exports.addTaskMinutes = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }
        if (content.length > 5000) {
            return res.status(400).json({ success: false, message: 'Content is too long (max 5000 chars)' });
        }

        const task = await Task.findOne({ _id: taskId, assignedTo: req.user.id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Cannot add minutes to completed tasks' });
        }

        const minutes = await Minutes.create({
            content,
            projectId: task.project,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, minutes });
    } catch (error) {
        console.error('Add minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add report to task
// @route   POST /api/staff/tasks/:id/reports
// @access  Private (Staff)
exports.addTaskReport = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { summary, issuesOrBlockers } = req.body;
        const files = req.files || [];

        if (!summary) {
            return res.status(400).json({ success: false, message: 'Summary is required' });
        }
        if (summary.length > 2000) {
            return res.status(400).json({ success: false, message: 'Summary is too long (max 2000 chars)' });
        }
        if (!issuesOrBlockers) {
            return res.status(400).json({ success: false, message: 'Issues/Blockers are required' });
        }
        if (issuesOrBlockers.length > 2000) {
            return res.status(400).json({ success: false, message: 'Issues/Blockers description is too long (max 2000 chars)' });
        }
        if (files.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one work image is required' });
        }

        const task = await Task.findOne({ _id: taskId, assignedTo: req.user.id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const workImages = files.map(file => {
            const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
            return `/uploads${relativePath}`;
        });

        const report = await MonthlyReport.create({
            projectId: task.project,
            submittedBy: req.user.id,
            summary,
            workImages,
            issuesOrBlockers,
            createdAt: new Date()
        });

        res.status(201).json({ success: true, report });
    } catch (error) {
        console.error('Add monthly report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add work update to task
// @route   POST /api/staff/tasks/:id/work-update
// @access  Private (Staff)
exports.addWorkUpdate = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { description, type } = req.body;
        const files = req.files || (req.file ? [req.file] : []);

        if (!description) {
            return res.status(400).json({ success: false, message: 'Please provide a description' });
        }
        if (description.length > 2000) {
            return res.status(400).json({ success: false, message: 'Description is too long (max 2000 chars)' });
        }

        const task = await Task.findOne({ _id: taskId, assignedTo: req.user.id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const images = files.map(file => {
            const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
            return `/uploads${relativePath}`;
        });

        const update = await ProjectUpdate.create({
            projectId: task.project,
            taskId: taskId,
            staffId: req.user.id,
            title: `Update: ${type || 'general'}`,
            description,
            type: type || 'general',
            images
        });

        res.status(201).json({
            success: true,
            message: "Work update added successfully",
            update
        });
    } catch (error) {
        console.error('Add work update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add project-level update
// @route   POST /api/staff/projects/:projectId/updates
// @access  Private (Staff)
exports.addProjectUpdate = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { title, description, type, milestoneId } = req.body;
        const files = req.files || (req.file ? [req.file] : []);

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        // Verify staff access to project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const images = files.map(file => {
            const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
            return `/uploads${relativePath}`;
        });

        const update = await ProjectUpdate.create({
            projectId,
            staffId: req.user.id,
            title,
            description,
            type: type || 'general',
            milestoneId: milestoneId || undefined,
            images,
            approvalStatus: 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Project update submitted successfully",
            update
        });
    } catch (error) {
        console.error('Add project update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get task updates/history
// @route   GET /api/staff/tasks/:id/updates
// @access  Private (Staff)
exports.getTaskUpdates = async (req, res) => {
    try {
        const taskId = req.params.id;

        // Verify task
        const task = await Task.findOne({ _id: taskId, assignedTo: req.user.id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Fetch related items (excluding minutes - they have their own dedicated history modal)
        const reports = await MonthlyReport.find({ projectId: task.project, submittedBy: req.user.id }).sort({ createdAt: -1 });
        const documents = await Document.find({ task: taskId }).sort({ createdAt: -1 });
        const projectUpdates = await ProjectUpdate.find({ taskId: taskId }).sort({ createdAt: -1 });

        // Normalize data for frontend stream
        const updates = [
            ...documents.map(d => ({ type: 'document', date: d.createdAt, data: d })),
            ...reports.map(r => ({ type: 'report', date: r.createdAt, data: r })),
            ...projectUpdates.map(p => ({ type: 'work-update', date: p.createdAt, data: p }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ success: true, updates });
    } catch (error) {
        console.error('Get task updates error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// @desc    Get all minutes for a project (Read-only)
// @route   GET /api/staff/projects/:projectId/minutes
// @access  Private (Staff)
exports.getProjectMinutes = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Verify staff assignment using ProjectTeam collection
        const teamMember = await ProjectTeam.findOne({
            projectId,
            userId: req.user.id
        });

        if (!teamMember) {
            return res.status(403).json({ success: false, message: 'Not authorized or project not found' });
        }

        const minutes = await Minutes.find({ project: projectId })
            .populate('participants', 'fullName email')
            .populate('createdBy', 'fullName')
            .sort({ meetingDate: -1 });

        res.json({ success: true, minutes });
    } catch (error) {
        console.error('Get project minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get project milestones for staff
// @route   GET /api/staff/projects/:projectId/milestones
// @access  Private (Staff)
exports.getProjectMilestones = async (req, res) => {
    try {
        const { projectId } = req.params;

        // 1. Check if user is in the project team (Project model 'team' array or embedded objects)
        // Note: Project schema might vary, usually it's `team: [{ staff: ObjectId, role: String }]` or similar.
        // But here we also check the separate `ProjectTeam` collection or the Project model itself?
        // The original code checked Project model: $or: [{ team: req.user.id }, { 'team.staff': req.user.id }]

        let hasAccess = false;

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { team: req.user.id },
                { 'team.staff': req.user.id }
            ]
        });

        if (project) {
            hasAccess = true;
        } else {
            // 2. If not found in Project model team, check if they have any TASKS in this project
            const taskInProject = await Task.findOne({
                project: projectId,
                assignedTo: req.user.id
            });

            if (taskInProject) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            // 3. Last resort: Check ProjectTeam collection (explicit team assignment)
            const teamEntry = await ProjectTeam.findOne({
                projectId: projectId,
                userId: req.user.id
            });
            if (teamEntry) hasAccess = true;
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Not authorized to view milestones for this project' });
        }

        const milestones = await Milestone.find({ project: projectId }).sort({ startDate: 1 });

        res.json({ success: true, milestones });
    } catch (error) {
        console.error('Get project milestones error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get dashboard statistics for current staff
// @route   GET /api/staff/dashboard/stats
// @access  Private (Staff)
exports.getStaffDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Projects Count
        // Explicitly assigned via ProjectTeam
        const teamProjectIds = await ProjectTeam.find({ userId }).distinct('projectId');
        // Implicitly assigned via Tasks
        const taskProjectIds = await Task.find({ assignedTo: userId }).distinct('project');

        const allProjectIds = [...new Set([
            ...teamProjectIds.map(id => id.toString()),
            ...taskProjectIds.map(id => id.toString())
        ])];

        const totalProjects = allProjectIds.length;

        // 2. Tasks Stats
        const allTasks = await Task.find({ assignedTo: userId });

        const totalTasks = allTasks.length;

        const stats = {
            totalProjects,
            totalTasks,
            ongoingTasks: 0,
            statusDistribution: {
                inProgress: 0,
                pending: 0,
                completed: 0
            }
        };

        allTasks.forEach(task => {
            const status = task.status ? task.status.toLowerCase() : 'pending';

            if (status === 'completed') {
                stats.statusDistribution.completed++;
            } else if (status === 'in-progress') {
                stats.statusDistribution.inProgress++;
                stats.ongoingTasks++;
            } else {
                // Default to pending for anything else (pending, todo, etc)
                stats.statusDistribution.pending++;
                stats.ongoingTasks++;
            }
        });

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Get staff dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all projects assigned to the current staff
// @route   GET /api/staff/projects
// @access  Private (Staff)
exports.getMyProjects = async (req, res) => {
    try {
        // 1. projects from ProjectTeam (Explicit assignment)
        const teamEntries = await ProjectTeam.find({ userId: req.user.id }).distinct('projectId');

        // 2. projects from Tasks (Implicit assignment via task)
        const taskProjects = await Task.find({ assignedTo: req.user.id }).distinct('project');

        // Combine unique Project IDs
        // Note: distinct returns ObjectIds, we can merge them
        const allProjectIds = [...new Set([
            ...teamEntries.map(id => id.toString()),
            ...taskProjects.map(id => id.toString())
        ])];

        // Fetch actual Project documents
        const projects = await Project.find({
            _id: { $in: allProjectIds }
        }).select('name type location status budget')
            .lean(); // Use lean() to allow adding properties

        // Fetch milestones for all projects in one query
        const milestones = await Milestone.find({ project: { $in: allProjectIds } }).sort({ startDate: 1 });

        // Map milestones to their respective projects
        const projectsWithMilestones = projects.map(project => ({
            ...project,
            milestones: milestones.filter(m => m.project.toString() === project._id.toString())
        }));

        res.json({ success: true, projects: projectsWithMilestones });
    } catch (error) {
        console.error('Get my projects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Delete a project update
// @route   DELETE /api/task/update/:updateId
// @access  Private (Staff/Admin/Manager)
exports.deleteUpdate = async (req, res) => {
    try {
        const updateId = req.params.updateId;

        const update = await ProjectUpdate.findById(updateId);
        if (!update) {
            return res.status(404).json({ success: false, message: 'Update not found' });
        }

        // Optional: Check if the user is authorized (the one who created it or a manager)
        // For now, allowing the staff who is assigned to the task to delete it
        // Or if you want stricter: if (update.staffId.toString() !== req.user.id) ...

        await ProjectUpdate.findByIdAndDelete(updateId);

        res.json({ success: true, message: 'Update deleted successfully' });
    } catch (error) {
        console.error('Delete update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
