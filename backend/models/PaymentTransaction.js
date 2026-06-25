const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentRequest'
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        trim: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    paymentProofUrl: {
        type: String
    },
    paidAt: {
        type: Date,
        default: Date.now
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiptUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ["Paid", "Verified"], // Replaced Pending with Paid, removed redundant Paid
        default: "Paid"
    },
    paymentMethod: {
        type: String,
        enum: ["UPI", "Card", "Bank", "Bank Transfer"],
        default: "Bank Transfer"
    }
});

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
