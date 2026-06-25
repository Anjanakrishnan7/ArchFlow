import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmRemoveModal = ({ memberName, onConfirm, onCancel, isDeleting }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-icon">
                    <FaExclamationTriangle />
                </div>
                <h3>Remove Team Member?</h3>
                <p>
                    Are you sure you want to remove <strong>{memberName}</strong> from this project?
                    This action cannot be undone immediately.
                </p>
                <div className="modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-confirm-delete"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Removing...' : 'Remove Member'}
                    </button>
                </div>
            </div>
            <style>{`
                .confirm-modal {
                    max-width: 400px;
                    text-align: center;
                    padding: 30px;
                }
                .confirm-icon {
                    width: 60px;
                    height: 60px;
                    background: #fef2f2;
                    color: #ef4444;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    margin: 0 auto 20px;
                }
                .confirm-modal h3 {
                    margin-bottom: 10px;
                    color: #1e293b;
                }
                .confirm-modal p {
                    color: #64748b;
                    margin-bottom: 25px;
                    line-height: 1.5;
                }
                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .btn-cancel {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #334155;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cancel:hover {
                    background: #f8fafc;
                }
                .btn-confirm-delete {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: none;
                    background: #ef4444;
                    color: white;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-confirm-delete:hover {
                    background: #dc2626;
                }
                .btn-confirm-delete:disabled,
                .btn-cancel:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ConfirmRemoveModal;
