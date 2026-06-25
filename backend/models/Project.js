const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../config/constants');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a project name'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Residential', 'Commercial', 'Industrial', 'Infrastructure'],
        default: 'Residential'
    },
    client: {
        type: String,
        trim: true
        // Deprecated: Use clientId for relationships
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    budget: {
        type: Number,
        min: 0,
        default: 0
    },
    paid: {
        type: Number,
        min: 0,
        default: 0
    },
    // assignedStaff removed as per new database structure (using ProjectTeam collection)
    assignedManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // Deprecated: Use managerId
    },
    status: {
        type: String,
        enum: Object.values(PROJECT_STATUS),
        default: PROJECT_STATUS.PENDING
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    expectedEndDate: {
        type: Date,
        validate: {
            validator: function(v) {
                return !v || !this.startDate || v >= this.startDate;
            },
            message: 'Expected end date must be after start date'
        }
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual to calculate team count
// Virtual for team count - Deprecated/Placeholder as assignedStaff is removed.
ProjectSchema.virtual('teamCount').get(function () {
    return 0; // Actual count should be queried from ProjectTeam collection
});

// Ensure virtuals are included when converting to JSON
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

// --- INDEXES ---
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ managerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ assignedManager: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
