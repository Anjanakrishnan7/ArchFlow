const mongoose = require('mongoose');

const PaymentRequestSchema = new mongoose.Schema({
    projectId: { // User requested field
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    project: { // Compatibility with old code
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    clientId: { // User requested field
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: { // User requested field
        type: String,
        required: true,
        trim: true
    },
    description: { // Compatibility
        type: String
    },
    dueDate: {
        type: Date
    },
    invoiceUrl: { // User requested
        type: String
    },
    status: {
        type: String,
        enum: ["Requested", "Paid", "Approved", "Rejected"], // Removed Cancelled, replaced Pending with Paid
        default: "Requested"
    },
    requestedAt: { // User requested
        type: Date,
        default: Date.now
    },
    createdAt: { // Compatibility
        type: Date,
        default: Date.now
    },
    notes: { // New field
        type: String
    },
    requestedBy: { // Admin who made the request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Middleware to keep fields in sync
PaymentRequestSchema.pre('save', function (next) {
    if (this.projectId && !this.project) this.project = this.projectId;
    if (this.project && !this.projectId) this.projectId = this.project;
    if (this.purpose && !this.description) this.description = this.purpose;
    if (this.description && !this.purpose) this.purpose = this.description;
    if (this.requestedAt && !this.createdAt) this.createdAt = this.requestedAt;
    if (this.createdAt && !this.requestedAt) this.requestedAt = this.createdAt;
    next();
});

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
