const Minutes = require('../models/Minutes');
const Task = require('../models/Task');

// @desc    Add minutes to project
// @route   POST /api/minutes
// @access  Private (Staff/Admin/Manager)
exports.createMinutes = async (req, res) => {
    try {
        const { projectId, content } = req.body;

        if (!content || !projectId) {
            return res.status(400).json({ success: false, message: 'Content and Project ID are required' });
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

// @desc    Get minutes for a project
// @route   GET /api/minutes/:projectId
// @access  Private
// @desc    Delete minutes
// @route   DELETE /api/minutes/:id
// @access  Private (Staff/Admin/Manager)
exports.deleteMinutes = async (req, res) => {
    try {
        const minutes = await Minutes.findById(req.params.id);

        if (!minutes) {
            return res.status(404).json({ success: false, message: 'Minutes not found' });
        }

        // Optional: Check ownership or permissions here if needed
        // For now, assuming auth middleware handles basic access

        await minutes.deleteOne();

        res.json({ success: true, message: 'Minutes removed' });
    } catch (error) {
        console.error('Delete minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProjectMinutes = async (req, res) => {
    try {
        const { projectId } = req.params;
        const minutes = await Minutes.find({ projectId }).sort({ createdAt: -1 }).populate('createdBy', 'fullName');
        res.json({ success: true, minutes });
    } catch (error) {
        console.error('Get project minutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
