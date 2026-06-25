const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const documentController = require('../controllers/documentController');

// All document routes require authentication
router.use(auth);

// POST /api/documents/upload
// Accepts multipart/form-data: projectId, title, description, report
router.post('/upload', upload.single('report'), documentController.uploadDocument);

// GET /api/documents/:projectId
router.get('/:projectId', documentController.getProjectDocuments);

// DELETE /api/documents/:id
// Only admin and manager can delete
// Permission logic moved to controller (allows clients to delete own pending docs)
router.delete('/:id', authorize('admin', 'manager', 'client'), documentController.deleteDocument);

module.exports = router;
