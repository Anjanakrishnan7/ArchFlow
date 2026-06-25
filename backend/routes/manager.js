const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getManagerDashboard,
    getManagerClients,
    getManagerStaff,
    getManagerProjects,
    updateProjectStatus,
    assignStaffToProject,
    updateClient,
    // Project Workspace
    getProjectDetails,
    getProjectOverview,
    // Tasks
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    // Milestones
    createMilestone,
    getMilestones,
    updateMilestone,
    deleteMilestone,
    // Minutes
    createMinutes,
    getMinutes,
    updateMinutes,
    deleteMinutes,
    // Team
    getProjectTeam,
    // Monthly Reports
    getMonthlyReports,
    // Project Updates
    getProjectUpdates,
    approveProjectUpdate,
    rejectProjectUpdate
} = require('../controllers/managerController');

// All routes are protected and require 'manager' role
router.use(auth);
router.use(authorize('manager', 'staff', 'admin'));

// Dashboard
router.get('/dashboard', getManagerDashboard);

// Clients
router.get('/clients', getManagerClients);
router.patch('/clients/:id', updateClient);

// Staff
router.get('/staff', getManagerStaff);

// Projects (List)
router.get('/projects', getManagerProjects);
router.patch('/projects/:id/status', updateProjectStatus);
router.patch('/projects/:id/assign-staff', assignStaffToProject);

// Project Workspace
router.get('/projects/:id/details', getProjectDetails);
router.get('/projects/:id/overview', getProjectOverview);

// Tasks
router.post('/projects/:id/tasks', upload.array('attachments'), createTask);
router.get('/projects/:id/tasks', getTasks);
router.patch('/projects/:id/tasks/:taskId', upload.array('attachments'), updateTask);
router.delete('/projects/:id/tasks/:taskId', deleteTask);

// Milestones
router.post('/projects/:id/milestones', createMilestone);
router.get('/projects/:id/milestones', getMilestones);
router.patch('/projects/:id/milestones/:milestoneId', updateMilestone);
router.delete('/projects/:id/milestones/:milestoneId', deleteMilestone);


// Minutes
router.post('/projects/:id/minutes', createMinutes);
router.get('/projects/:id/minutes', getMinutes);
router.patch('/projects/:id/minutes/:minutesId', updateMinutes);
router.delete('/projects/:id/minutes/:minutesId', deleteMinutes);

// Team
router.get('/projects/:id/team', getProjectTeam);
router.delete('/projects/:id/team/:staffId', require('../controllers/managerController').removeStaffFromProject);

// Monthly Reports
router.get('/projects/:id/monthly-reports', getMonthlyReports);
router.post('/projects/:id/monthly-reports', upload.array('workImages'), require('../controllers/managerController').createMonthlyReport);

// Project Updates
router.get('/projects/:id/updates', getProjectUpdates);

// Complaints
router.get('/complaints', require('../controllers/managerController').getComplaints);
router.patch('/complaints/:id/status', require('../controllers/managerController').updateComplaintStatus);

module.exports = router;
