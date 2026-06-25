const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Task must belong to a project']
    },
    // Adding projectId as requested alias
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task must be assigned to a staff member']
    },
    status: {
        type: String,
        // Standardized to lowercase
        enum: ['pending', 'in-progress', 'completed', 'todo'],
        default: 'pending',
        lowercase: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a task category'],
        trim: true
    },
    dueDate: {
        type: Date,
        validate: {
            validator: function(v) {
                // Only validate for new tasks
                if (!this.isNew) return true;
                return !v || v >= new Date().setHours(0,0,0,0);
            },
            message: 'Due date cannot be in the past'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachments: [{
        type: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Task', TaskSchema);
