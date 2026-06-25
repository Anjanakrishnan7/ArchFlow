const PaymentRequest = require('../models/PaymentRequest');
const PaymentTransaction = require('../models/PaymentTransaction');
const Project = require('../models/Project');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const path = require('path');
const fs = require('fs');
const { generateReceipt } = require('../utils/receiptGenerator');
const { isPositiveNumber } = require('../middleware/validation');

// @desc    Admin creates a payment request for a Client
// @route   POST /api/payment/request
// @access  Private (Admin)
exports.createPaymentRequest = async (req, res) => {
    try {
        const { projectId, clientId, amount, purpose, dueDate, invoiceUrl, notes } = req.body;

        // Validation - Ensure only Admin performs this (Middleware handles role check generally, but good to be semantic)
        // Also ensure clientId refers to a Client
        if (!projectId || !clientId || !amount || !purpose) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!isPositiveNumber(amount)) {
            return res.status(400).json({ success: false, message: "Payment amount must be a positive number" });
        }

        if (dueDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
            
            const dueDateStr = dueDate.split('T')[0];
            if (dueDateStr < todayStr) {
                return res.status(400).json({ success: false, message: "Due date cannot be in the past" });
            }
        }

        // Optional: Verify client exists and has role 'client'
        const clientUser = await User.findById(clientId);
        if (!clientUser || clientUser.role !== 'client') {
            return res.status(400).json({ success: false, message: "Invalid client ID" });
        }

        const paymentRequest = await PaymentRequest.create({
            projectId,
            clientId,
            amount,
            purpose,
            dueDate,
            invoiceUrl,
            notes,
            requestedBy: req.user.id,
            status: "Requested"
        });

        res.status(201).json({
            success: true,
            message: "Payment request created successfully",
            data: paymentRequest
        });
    } catch (error) {
        console.error("Create Payment Request Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Fetch all requests + history for a project
// @route   GET /api/payment/:projectId
// @access  Private (Client/Admin/Manager)
exports.getProjectPayments = async (req, res) => {
    try {
        const { projectId } = req.params;

        const requests = await PaymentRequest.find({ projectId })
            .populate('clientId', 'fullName email')
            .sort({ requestedAt: -1 });
        const history = await PaymentTransaction.find({ projectId }).sort({ paidAt: -1 });

        res.json({
            success: true,
            requests,
            history
        });
    } catch (error) {
        console.error("Get Project Payments Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Client submits payment + proof
// @route   POST /api/payment/pay
// @access  Private (Client)
exports.submitPayment = async (req, res) => {
    try {
        const { projectId, requestId, amount, purpose, transactionId, paymentMethod } = req.body;

        let paymentProofUrl = "";
        if (req.file) {
            const relativePath = req.file.path.split('uploads')[1].replace(/\\/g, '/').replace(/^\//, '');
            paymentProofUrl = `/uploads/${relativePath}`;
        }

        if (!projectId || !amount || !transactionId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!isPositiveNumber(amount)) {
            return res.status(400).json({ success: false, message: "Payment amount must be a positive number" });
        }

        // Create transaction
        const transaction = await PaymentTransaction.create({
            projectId,
            clientId: req.user.id,
            requestId,
            amount,
            purpose,
            transactionId,
            paymentProofUrl,
            paymentMethod,
            status: "Paid",
            paidAt: new Date()
        });

        // Update Request status if requestId exists
        if (requestId) {
            await PaymentRequest.findByIdAndUpdate(requestId, { status: "Paid" });
        }

        res.status(201).json({
            success: true,
            message: "Payment submitted successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Submit Payment Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Admin verifies payment
// @route   PATCH /api/payment/verify/:id
// @access  Private (Admin/Manager)
exports.verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await PaymentTransaction.findById(id).populate('projectId clientId');
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        transaction.status = "Verified";
        transaction.verifiedBy = req.user.id;

        // Realistic Receipt Generation
        try {
            const filename = await generateReceipt(transaction);
            const receiptUrl = `/uploads/payment-proofs/${filename}`;
            transaction.receiptUrl = receiptUrl;

            // Save to Receipt table
            await Receipt.create({
                transactionId: transaction._id,
                projectId: transaction.projectId._id || transaction.projectId,
                clientId: transaction.clientId._id || transaction.clientId,
                filename: filename,
                receiptUrl: receiptUrl,
                amount: transaction.amount
            });
        } catch (genError) {
            console.error("Receipt Generation Error:", genError);
            // Non-fatal error for the transaction update, but worth noting
        }

        await transaction.save();

        // Update Request status to Approved if linked
        if (transaction.requestId) {
            await PaymentRequest.findByIdAndUpdate(transaction.requestId, { status: "Approved" });
        }

        res.json({
            success: true,
            message: "Payment verified successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Fetch/download receipt PDF
// @route   GET /api/payment/receipt/:id
// @access  Private (Client/Admin)
exports.getReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await PaymentTransaction.findById(id).populate('projectId clientId');

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        // Lazy generation if verified but missing receipt (e.g. from older test data)
        if (!transaction.receiptUrl && (transaction.status === 'Verified' || transaction.status === 'Approved' || transaction.status === 'Paid')) {
            try {
                console.log(`[Receipt] Generating missing receipt for transaction ${id} (Status: ${transaction.status})`);
                const filename = await generateReceipt(transaction);
                const receiptUrl = `/uploads/payment-proofs/${filename}`;
                transaction.receiptUrl = receiptUrl;

                // Save to Receipt table
                await Receipt.create({
                    transactionId: transaction._id,
                    projectId: transaction.projectId._id || transaction.projectId,
                    clientId: transaction.clientId._id || transaction.clientId,
                    filename: filename,
                    receiptUrl: receiptUrl,
                    amount: transaction.amount
                });

                // Also update status to Verified if it was Paid, since we are generating a receipt
                if (transaction.status === 'Paid') {
                    transaction.status = 'Verified';
                }

                await transaction.save();
                console.log(`[Receipt] Successfully generated and linked: ${filename}`);
            } catch (genError) {
                console.error("[Receipt] Generation Failure:", genError);
                return res.status(500).json({
                    success: false,
                    message: "Internal error generating receipt: " + genError.message
                });
            }
        }

        if (!transaction.receiptUrl) {
            return res.status(404).json({ success: false, message: "Receipt file not generated yet" });
        }

        res.json({
            success: true,
            receiptUrl: transaction.receiptUrl
        });
    } catch (error) {
        console.error("Get Receipt Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
