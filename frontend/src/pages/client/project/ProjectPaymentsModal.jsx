import React, { useState, useEffect } from 'react';
import { FaTimes, FaHistory, FaClock, FaCheckCircle, FaFileInvoice, FaDownload } from 'react-icons/fa';
import { paymentAPI, BASE_URL } from '../../../utils/api';
import { useToast } from '../../../context/ToastContext';
import PayNowModal from './PayNowModal';
import './ProjectPaymentsModal.css';

const ProjectPaymentsModal = ({ project, onClose }) => {
    const { showToast } = useToast();
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, [project._id]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await paymentAPI.getByProject(project._id);
            if (data.success) {
                setRequests(data.requests);
                setHistory(data.history);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            showToast("Failed to load payment data", "error");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getStatusTag = (req) => {
        const s = req.status.toLowerCase();
        if (s === 'requested') return <span className="status-tag requested">Requested</span>;
        if (s === 'pending' && !req.paymentProofUrl) return <span className="status-tag requested">Requested</span>;
        if (s === 'pending' || s === 'paid') return <span className="status-tag pending">Pending</span>;
        if (s === 'verified') return <span className="status-tag verified">Verified</span>;
        if (s === 'cancelled') return <span className="status-tag cancelled">Cancelled</span>;
        return <span className="status-tag">{req.status}</span>;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content payment-system-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-left">
                        <h2>Project Payment System</h2>
                        <p className="project-subtitle">{project.name}</p>
                    </div>
                    <button className="close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body custom-scrollbar">
                    {loading ? (
                        <div className="loading-state">Loading payment information...</div>
                    ) : (
                        <div className="payment-content-grid">
                            {/* Section A: Pending Payment Requests */}
                            <section className="payment-section">
                                <div className="section-header">
                                    <h3><FaClock className="section-icon" /> Pending Payment Requests</h3>
                                </div>
                                <div className="table-wrapper">
                                    {requests.filter(r => r.status === 'Requested' || (r.status === 'Pending' && !r.paymentProofUrl)).length > 0 ? (
                                        <table className="payment-table">
                                            <thead>
                                                <tr>
                                                    <th>Amount</th>
                                                    <th>Purpose</th>
                                                    <th>Requested</th>
                                                    <th>Due Date</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {requests.filter(r => r.status === 'Requested' || (r.status === 'Pending' && !r.paymentProofUrl)).map(req => (
                                                    <tr key={req._id}>
                                                        <td className="amount-cell">₹{req.amount.toLocaleString('en-IN')}</td>
                                                        <td>{req.purpose}</td>
                                                        <td>{formatDate(req.requestedAt)}</td>
                                                        <td>{req.dueDate ? formatDate(req.dueDate) : '-'}</td>
                                                        <td>{getStatusTag(req)}</td>
                                                        <td>
                                                            <button
                                                                className="pay-now-btn-small"
                                                                onClick={() => setSelectedRequest(req)}
                                                            >
                                                                Pay Now
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="empty-state">No pending payment requests.</div>
                                    )}
                                </div>
                            </section>

                            {/* Section B: Payment History */}
                            <section className="payment-section">
                                <div className="section-header">
                                    <h3><FaHistory className="section-icon" /> Payment History</h3>
                                </div>
                                <div className="table-wrapper">
                                    {history.length > 0 ? (
                                        <table className="payment-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Purpose</th>
                                                    <th>Status</th>
                                                    <th>Receipt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map(item => (
                                                    <tr key={item._id}>
                                                        <td>{formatDate(item.paidAt)}</td>
                                                        <td className="amount-cell">₹{item.amount.toLocaleString('en-IN')}</td>
                                                        <td>{item.purpose || 'Project Payment'}</td>
                                                        <td>
                                                            <span className={`history-status-pill ${item.status.toLowerCase()}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {item.receiptUrl ? (
                                                                <a
                                                                    href={`${BASE_URL}${item.receiptUrl}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="receipt-link-small"
                                                                    title="View/Download Receipt"
                                                                >
                                                                    <FaFileInvoice /> Receipt
                                                                </a>
                                                            ) : (
                                                                <span className="no-receipt">Pending...</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="empty-history">No payment history found.</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div >

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
        </div >
    );
};

export default ProjectPaymentsModal;
