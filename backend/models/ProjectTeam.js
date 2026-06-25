const mongoose = require('mongoose');

const ProjectTeamSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Please provide a project ID']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user ID']
    },
    roleInProject: {
        type: String,
        default: 'Staff',
        trim: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Prevent duplicate assignments of the same user to the same project
ProjectTeamSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectTeam', ProjectTeamSchema);
