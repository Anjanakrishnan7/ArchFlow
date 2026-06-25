const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getMyTasks,
    updateTaskStatus,
    addTaskDocument,
    addWorkUpdate,
    addTaskMinutes,
    addTaskReport,
    getTaskUpdates,
    getProjectMinutes,
    getProjectMilestones,
    getMyProjects,
    getStaffDashboardStats,
    addProjectUpdate
} = require('../controllers/staffController');

// All routes require authentication and 'staff' role
router.use(auth);
router.use(authorize('staff'));

// Tasks List
router.get('/tasks', getMyTasks);

// Task Status
router.patch('/tasks/:id/status', updateTaskStatus);

// Task Actions
// Using upload.single('file') for document upload. Frontend must use key 'file'.
router.post('/tasks/:id/documents', upload.single('file'), addTaskDocument);
router.post('/tasks/:id/work-update', upload.array('images'), addWorkUpdate);
router.post('/tasks/:id/minutes', addTaskMinutes);
router.post('/tasks/:id/reports', upload.array('workImages'), addTaskReport);

// Task History
router.get('/tasks/:id/updates', getTaskUpdates);

// Project Minutes
router.get('/projects/:projectId/minutes', getProjectMinutes);

// Project Milestones
// Project Milestones
router.get('/projects/:projectId/milestones', getProjectMilestones);

// My Projects
router.get('/projects', getMyProjects);
router.post('/projects/:projectId/updates', upload.array('updateImage'), addProjectUpdate);

// Dashboard Stats
router.get('/dashboard/stats', getStaffDashboardStats);


module.exports = router;
