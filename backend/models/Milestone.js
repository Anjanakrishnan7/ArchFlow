const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a milestone title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Milestone must belong to a project']
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide a start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide an end date']
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'on-hold'],
        default: 'pending'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
MilestoneSchema.index({ project: 1 });

module.exports = mongoose.model('Milestone', MilestoneSchema);
