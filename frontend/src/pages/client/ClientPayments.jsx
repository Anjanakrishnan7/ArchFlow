import React, { useState, useEffect, useCallback } from 'react';
import { clientAPI, paymentAPI, getPhotoUrl } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import PayNowModal from './project/PayNowModal';
import './ClientPayments.css';

const ClientPayments = () => {
    const { showToast } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);



    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await clientAPI.getPayments();
            if (data.success) {
                setPayments(data.payments);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            showToast("Failed to load payment data", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleViewReceipt = async (payment) => {
        // 1. If we already have a receiptUrl, just open it
        if (payment.receiptUrl) {
            window.open(getPhotoUrl(payment.receiptUrl), '_blank');
            return;
        }

        // 2. If no receiptUrl but we have a transactionId, try to fetch/generate it
        if (payment.transactionId) {
            // Open blank window immediately to avoid popup blocker
            const receiptWindow = window.open('', '_blank');
            if (receiptWindow) {
                receiptWindow.document.write('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h3>Generating your receipt, please wait...</h3></body></html>');
            }

            try {
                showToast("Fetching receipt...", "info");
                const res = await paymentAPI.getReceipt(payment.transactionId);

                if (res.success && res.receiptUrl) {
                    const fullUrl = getPhotoUrl(res.receiptUrl);
                    if (receiptWindow) {
                        receiptWindow.location.assign(fullUrl);
                    } else {
                        window.open(fullUrl, '_blank');
                    }

                    // Update local state
                    setPayments(prev => prev.map(p =>
                        p._id === payment._id ? { ...p, receiptUrl: res.receiptUrl } : p
                    ));
                } else {
                    if (receiptWindow) receiptWindow.close();
                    showToast("Receipt not available yet", "warning");
                }
            } catch (error) {
                if (receiptWindow) receiptWindow.close();
                console.error("View Receipt Error:", error);

                // Show actual error from backend if available
                const errorMsg = error.response?.data?.message || error.message || "Failed to generate receipt";
                showToast(errorMsg, "error");
            }
        } else {
            showToast("No transaction record found for this approved payment", "error");
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getStatusDisplay = (payment) => {
        const status = payment.status || 'Requested';
        const dueDate = payment.dueDate;
        const s = status.toLowerCase();

        // Handle Overdue logic if Requested and dueDate past
        if (s === 'requested' && dueDate && new Date(dueDate) < new Date()) {
            return {
                label: 'Overdue',
                className: 'status-overdue'
            };
        }

        switch (s) {
            case 'requested':
                return { label: 'Requested', className: 'status-requested' };
            case 'pending':
            case 'paid':
                // Show 'Paid' for both 'Pending' and 'Paid' backend statuses
                // but only if a proof actually exists (fallback to Requested if not submitted)
                if (!payment.receiptUrl && !payment.paymentProofUrl && !payment.transactionId) {
                    return { label: 'Requested', className: 'status-requested' };
                }
                return { label: 'Paid', className: 'status-paid' };
            case 'approved':
            case 'verified':
                return { label: 'Approved', className: 'status-approved' };
            case 'rejected':
                return { label: 'Rejected', className: 'status-rejected' };
            default:
                return { label: status, className: `status-${s}` };
        }
    };

    const formatCurrency = (val) => `₹${val?.toLocaleString('en-IN') || 0}`;

    if (loading) return <div className="client-payments-container">Loading payments...</div>;

    return (
        <div className="client-payments-container">
            <div className="page-header">
                <h1>Payments</h1>
            </div>

            <div className="payments-table-wrapper">
                {payments.length > 0 ? (
                    <table className="modern-payments-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Project</th>
                                <th>Milestone</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => {
                                const statusInfo = getStatusDisplay(p);
                                return (
                                    <tr key={p._id}>
                                        <td>{formatDate(p.requestedAt || p.createdAt)}</td>
                                        <td>{p.projectId?.name || 'N/A'}</td>
                                        <td>{p.purpose}</td>
                                        <td className="amount-cell">{formatCurrency(p.amount)}</td>
                                        <td>{p.dueDate ? formatDate(p.dueDate) : '-'}</td>
                                        <td>
                                            <span className={`status-pill ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td>
                                            {p.status === 'Requested' ? (
                                                <button
                                                    className="btn-pay-now"
                                                    onClick={() => setSelectedRequest(p)}
                                                >
                                                    Submit Payment
                                                </button>
                                            ) : p.status === 'Approved' ? (
                                                <button
                                                    className="view-receipt-btn"
                                                    onClick={() => handleViewReceipt(p)}
                                                >
                                                    View Receipt
                                                </button>
                                            ) : (
                                                <button className="btn-view-only" disabled>
                                                    Submitted
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-payments-state">
                        <h3>No Payment Requests</h3>
                        <p>You don't have any payment requests at the moment.</p>
                    </div>
                )}
            </div>

            {selectedRequest && (
                <PayNowModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onSuccess={() => {
                        setSelectedRequest(null);
                        fetchPayments();
                    }}
                />
            )}
        </div>
    );
};

export default ClientPayments;
