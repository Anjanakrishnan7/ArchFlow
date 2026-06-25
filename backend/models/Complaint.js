const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [{
        type: String
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Please select a project']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
