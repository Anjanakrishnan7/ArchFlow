import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';
import { paymentAPI } from '../../../utils/api';
import { useToast } from '../../../context/ToastContext';
import './PayNowModal.css';

const PayNowModal = ({ request, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        paymentMethod: 'Bank Transfer',
        transactionId: '',
        file: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.transactionId) {
            showToast("Please enter Transaction ID", "error");
            return;
        }

        if (formData.paymentMethod === 'Bank Transfer' && !formData.file) {
            showToast("Please upload payment proof for manual payment", "error");
            return;
        }

        try {
            setLoading(true);
            const payload = new FormData();
            payload.append('projectId', request.projectId?._id || request.projectId);
            payload.append('requestId', request._id);
            payload.append('amount', request.amount);
            payload.append('purpose', request.purpose);
            payload.append('transactionId', formData.transactionId);
            payload.append('paymentMethod', formData.paymentMethod);
            if (formData.file) {
                payload.append('report', formData.file); // Use 'report' to match upload middleware
            }

            const data = await paymentAPI.pay(payload);
            if (data.success) {
                showToast("Payment submitted successfully", "success");
                onSuccess();
            }
        } catch (error) {
            console.error("Payment Submission Error:", error);
            showToast(error.message || "Failed to submit payment", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pay-now-overlay">
            <div className="pay-now-modal" onClick={e => e.stopPropagation()}>
                <div className="pay-now-header">
                    <h3>Make Payment</h3>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="pay-now-form">
                    <div className="prefilled-section">
                        <div className="form-group readonly">
                            <label>Amount (₹)</label>
                            <input type="text" value={request.amount.toLocaleString('en-IN')} readOnly />
                        </div>
                        <div className="form-group readonly">
                            <label>Milestone / Purpose</label>
                            <input type="text" value={request.purpose} readOnly />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Transaction ID / Reference Number *</label>
                        <input
                            type="text"
                            placeholder="Enter Transaction ID"
                            value={formData.transactionId}
                            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Payment Proof (Screenshot/Receipt) *</label>
                        <div className="file-upload-zone">
                            <input
                                type="file"
                                id="payment-proof"
                                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                hidden
                                required
                            />
                            <label htmlFor="payment-proof" className="file-label">
                                <FaCloudUploadAlt className="upload-icon" />
                                <span>{formData.file ? formData.file.name : "Choose Proof File"}</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="confirm-btn" disabled={loading}>
                            {loading ? "Processing..." : "Submit Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayNowModal;
