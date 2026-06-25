const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getProjectMinutes } = require('../controllers/clientController');
const upload = require('../middleware/upload');

// All routes require authentication and 'client' role
router.use(auth);
router.use(authorize('client'));

// Dashboard Stats
router.get('/dashboard', require('../controllers/clientController').getDashboardStats);

// Project Minutes
router.get('/projects/:projectId/minutes', getProjectMinutes);

// Centralized Payments
router.get('/payments', require('../controllers/clientController').getClientPayments);

// Monthly Reports
router.get('/projects/:projectId/monthly-reports', require('../controllers/clientController').getMonthlyReports);

// Get Client Projects
router.get('/projects', require('../controllers/clientController').getProjects);

// Get Complete Project Details (info, tasks, milestones)
router.get('/projects/:projectId/details', require('../controllers/clientController').getProjectDetails);


// Get Project Team Members
router.get('/projects/:projectId/team', require('../controllers/clientController').getProjectTeam);

// Get Project Updates
router.get('/projects/:projectId/updates', require('../controllers/clientController').getProjectUpdates);

// Complaints
router.get('/complaints', require('../controllers/clientController').getComplaints);
router.post('/complaints', upload.array('complaintAttachments', 5), require('../controllers/clientController').submitComplaint);
router.delete('/complaints/:id', require('../controllers/clientController').deleteComplaint);

module.exports = router;
