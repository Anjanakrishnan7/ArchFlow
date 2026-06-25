const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Project = require("../models/Project");
const Complaint = require("../models/Complaint");
const PaymentRequest = require("../models/PaymentRequest");

// Import Controller & Middleware
const {
  loginAdmin,
  createManager,
  getManagers,
  createStaff,
  createClient,
  assignManagerToProject,
  createProject,
  getMonthlyReports,
  toggleUserAvailability,
  updateProject,
  deleteProject
} = require('../controllers/adminController');

const { getAdminStats } = require('../controllers/adminDashboardController');

const { adminAuth } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// ------------------------------
// 1. PUBLIC ROUTES
// ------------------------------
router.post("/login", loginAdmin);

// ------------------------------
// 2. PROTECTED ROUTES (Apply Middleare)
// ------------------------------

// Dashboard Stats
router.get("/dashboard/stats", adminAuth, getAdminStats);

// User Management (Stubs for now, fully implemented in Section 2)
router.post('/create-manager', adminAuth, upload.single('photo'), createManager);
router.get('/managers', adminAuth, getManagers);
router.post('/create-staff', adminAuth, upload.single('photo'), createStaff);
router.post('/create-client', adminAuth, upload.single('photo'), createClient);

// Update Users via Admin
const { updateUser } = require('../controllers/userController');
router.put('/managers/:id', adminAuth, upload.single('photo'), updateUser);
router.put('/staff/:id', adminAuth, upload.single('photo'), updateUser);
router.put('/clients/:id', adminAuth, upload.single('photo'), updateUser);


// ------------------------------
// GET all projects (Admin view)
// ------------------------------
router.get("/projects", adminAuth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('assignedManager', 'fullName email')
      .populate('clientId', 'fullName email');
    res.json({
      success: true,
      projects: projects
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, message: "Error fetching projects." });
  }
});

// ------------------------------
// CREATE NEW PROJECT
// ------------------------------
// ------------------------------
// CREATE NEW PROJECT
// ------------------------------
router.post("/projects", adminAuth, createProject);

// ------------------------------
// ASSIGN MANAGER TO PROJECT
// ------------------------------
// ------------------------------
// ASSIGN MANAGER TO PROJECT
// ------------------------------
router.patch("/projects/:id/assign-manager", adminAuth, assignManagerToProject);
router.put("/projects/:id", adminAuth, updateProject);
router.delete("/projects/:id", adminAuth, deleteProject);

// ------------------------------
// TOGGLE USER AVAILABILITY
// ------------------------------
router.patch("/users/:id/availability", adminAuth, toggleUserAvailability);


// ------------------------------
// GET all complaints (Admin view)
// ------------------------------
router.get("/complaints", adminAuth, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('submittedBy', 'fullName email role')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      complaints: complaints
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Error fetching complaints." });
  }
});


// ------------------------------
// GET all pending (not approved) users
// ------------------------------
router.get("/pending", adminAuth, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).select("-password");

    res.json({
      success: true,
      users: pendingUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching pending users." });
  }
});

// ------------------------------
// APPROVE USER
// ------------------------------
router.post("/approve/:id", adminAuth, async (req, res) => {
  try {
    // Assuming 'status' is the field based on model exploration
    await User.findByIdAndUpdate(req.params.id, { status: 'active' });

    res.json({
      success: true,
      message: "User approved."
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving user." });
  }
});

// ------------------------------
// REJECT USER (delete user)
// ------------------------------
router.post("/reject/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User rejected and removed."
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting user." });
  }
});

// ------------------------------
// GET all payments (Global view)
// ------------------------------
router.get("/payments", adminAuth, async (req, res) => {
  try {
    const PaymentTransaction = require("../models/PaymentTransaction");
    const payments = await PaymentRequest.find()
      .populate('project', 'name')
      .populate('projectId', 'name')
      .populate('clientId', 'fullName email role')
      .sort({ createdAt: -1 })
      .lean();

    const paymentIds = payments.map(p => p._id);
    const transactions = await PaymentTransaction.find({ requestId: { $in: paymentIds } }).lean();

    const paymentsWithInfo = payments.map(p => {
      // Find transaction by requestId first, fallback to projectId+clientId+amount
      const tx = transactions.find(t =>
        (t.requestId && t.requestId.toString() === p._id.toString()) ||
        (!t.requestId &&
          t.projectId?.toString() === p.projectId?._id?.toString() &&
          t.clientId?.toString() === p.clientId?._id?.toString() &&
          t.amount === p.amount)
      );

      return {
        ...p,
        transactionId: tx ? tx.transactionId : null,
        paymentProof: tx ? tx.paymentProofUrl : null,
        paidAt: tx ? tx.paidAt : null
      };
    });

    res.json({
      success: true,
      payments: paymentsWithInfo
    });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ success: false, message: "Error fetching payments." });
  }
});

// ------------------------------
// GET payments for a project
// ------------------------------
router.get("/projects/:id/payments", adminAuth, async (req, res) => {
  try {
    const PaymentTransaction = require("../models/PaymentTransaction");
    const payments = await PaymentRequest.find({ project: req.params.id })
      .populate('project', 'name')
      .populate('projectId', 'name')
      .populate('clientId', 'fullName email role')
      .sort({ createdAt: -1 })
      .lean();

    const paymentIds = payments.map(p => p._id);
    const transactions = await PaymentTransaction.find({ requestId: { $in: paymentIds } }).lean();

    const paymentsWithInfo = payments.map(p => {
      // Find transaction by requestId first, fallback to projectId+clientId+amount
      const tx = transactions.find(t =>
        (t.requestId && t.requestId.toString() === p._id.toString()) ||
        (!t.requestId &&
          t.projectId?.toString() === p.projectId?._id?.toString() &&
          t.clientId?.toString() === p.clientId?._id?.toString() &&
          t.amount === p.amount)
      );

      return {
        ...p,
        transactionId: tx ? tx.transactionId : null,
        paymentProof: tx ? tx.paymentProofUrl : null,
        paidAt: tx ? tx.paidAt : null
      };
    });

    res.json({
      success: true,
      payments: paymentsWithInfo
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Error fetching payments." });
  }
});

// ------------------------------
// GET monthly reports for a project
// ------------------------------
router.get("/projects/:id/reports", adminAuth, getMonthlyReports);

// ------------------------------
// CREATE Payment (Pay Manager / Request Client)
// ------------------------------
router.post("/payments/create", adminAuth, async (req, res) => {
  try {
    const { projectId, amount, paymentType, description, payerId, receiverId, paymentMethod, dueDate } = req.body;

    if (!projectId || !amount || !paymentType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newPayment = await PaymentRequest.create({
      project: projectId,
      amount,
      paymentType,
      description,
      requestedBy: req.user.id, // Admin created it
      payer: payerId,
      receiver: receiverId,
      status: 'Paid', // Always starts as paid
      paymentMethod,
      dueDate
    });

    res.json({
      success: true,
      message: "Payment record created successfully",
      payment: newPayment
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ success: false, message: "Error creating payment." });
  }
});

// ------------------------------
// APPROVE Payment Request
// ------------------------------
router.put("/payments/:id/approve", adminAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const PaymentTransaction = require("../models/PaymentTransaction");
    const { generateReceipt } = require("../utils/receiptGenerator");

    const payment = await PaymentRequest.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment request not found" });
    }

    if (payment.status === 'Approved') {
      return res.json({ success: true, message: "Payment already approved", payment });
    }

    // Update payment request status
    payment.status = 'Approved';
    payment.approvedAt = Date.now();
    payment.approvedBy = req.user.id;
    await payment.save();

    // Find associated transaction (if a client has paid)
    // Fix: Remove non-existent 'project' field from populate
    let transaction = await PaymentTransaction.findOne({ requestId: paymentId }).populate('projectId clientId');

    // Fallback search if requestId isn't set (unlikely for new flow but safe)
    if (!transaction) {
      transaction = await PaymentTransaction.findOne({
        projectId: payment.projectId || payment.project,
        clientId: payment.clientId,
        amount: payment.amount,
        status: "Paid"
      }).populate('projectId clientId');
    }

    if (transaction) {
      transaction.status = "Verified";
      transaction.verifiedBy = req.user.id;

      // Update transaction with requestId if not already set (fallback case)
      if (!transaction.requestId) {
        transaction.requestId = paymentId;
      }

      // Generate Receipt
      try {
        const filename = await generateReceipt(transaction);
        const receiptUrl = `/uploads/documents/${filename}`;
        transaction.receiptUrl = receiptUrl;

        // Save to Receipt table
        const Receipt = require("../models/Receipt");
        await Receipt.create({
          transactionId: transaction._id,
          projectId: transaction.projectId?._id || transaction.projectId,
          clientId: transaction.clientId?._id || transaction.clientId,
          filename: filename,
          receiptUrl: receiptUrl,
          amount: transaction.amount
        });
      } catch (genError) {
        console.error("Manual Receipt Generation Error:", genError);
      }
      await transaction.save();
    }

    // Update project paid amount logic (Only if Client -> Admin payment, i.e., income)
    if (payment.paymentType === 'client_payment' || payment.clientId) {
      const project = await Project.findById(payment.projectId || payment.project);
      if (project) {
        project.paid = (project.paid || 0) + payment.amount;
        await project.save();
      }
    }

    res.json({
      success: true,
      message: "Payment approved and receipt generated",
      payment: payment,
      receiptUrl: transaction ? transaction.receiptUrl : null
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({ success: false, message: "Error approving payment." });
  }
});

// ------------------------------
// REJECT Payment Request
// ------------------------------
router.put("/payments/:id/reject", adminAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await PaymentRequest.findByIdAndUpdate(
      paymentId,
      { status: 'Rejected', approvedBy: req.user.id },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment request not found" });
    }

    res.json({
      success: true,
      message: "Payment rejected",
      payment
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ success: false, message: "Error rejecting payment." });
  }
});

// ------------------------------
// SIMULATE Payment Request (For Testing)
// ------------------------------
router.post("/projects/:id/simulate-payment", adminAuth, async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Simulate Manager Request (Admin -> Manager flow, restricted until approved)
    // Payer: Admin (System), Receiver: Manager (Simulated)
    // Actually, if Manager requests, requestedBy = Manager.
    // Since this is Admin simulating, `requestedBy` = Admin allows it.
    // But let's set `requestedBy` to Admin for now as per Auth.

    const payment = await PaymentRequest.create({
      project: projectId,
      amount: Math.floor(Math.random() * 50000) + 10000,
      status: 'Requested',
      paymentType: 'manager_payment', // Default for simulation is Manager Requesting money
      requestedBy: req.user.id,
      payer: req.user.id, // Admin is payer (technically Project Budget)
      receiver: project.assignedManager || req.user.id, // Manager
      description: "Simulated payment request for materials"
    });

    res.json({
      success: true,
      message: "Simulated payment request created",
      payment: payment
    });
  } catch (error) {
    console.error("Error simulating payment:", error);
    res.status(500).json({ success: false, message: "Error simulating payment." });
  }
});

module.exports = router;
