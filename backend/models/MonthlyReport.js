const mongoose = require('mongoose');

const MonthlyReportSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    workImages: [{
        type: String,
        required: true
    }],
    issuesOrBlockers: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MonthlyReport', MonthlyReportSchema);
