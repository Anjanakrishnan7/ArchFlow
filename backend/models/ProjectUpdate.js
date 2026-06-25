const mongoose = require('mongoose');

const ProjectUpdateSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: false
    },
    milestoneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone',
        required: false
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: false,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true
    },
    images: [{
        type: String
    }],
    type: {
        type: String,
        enum: ["site-visit", "work-progress", "documents", "design", "material-check", "general"],
        default: "general"
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    feedback: {
        message: { type: String, default: "" },
        seen: { type: Boolean, default: false },
        seenAt: { type: Date, default: null }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProjectUpdate', ProjectUpdateSchema);
