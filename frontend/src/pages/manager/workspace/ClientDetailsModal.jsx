import React from 'react';
import { FaTimes, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaUser } from 'react-icons/fa';
import { getPhotoUrl } from '../../../utils/api';

const ClientDetailsModal = ({ client, onClose }) => {
    if (!client) return null;

    const handleCall = () => {
        if (client.phone) window.open(`tel:${client.phone}`);
    };

    const handleWhatsapp = () => {
        if (client.phone) window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`, '_blank');
    };

    const handleEmail = () => {
        if (client.email) window.open(`mailto:${client.email}`);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content client-details-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: '16px', padding: '0' }}>
                <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>Client Contact</h2>
                    <button className="close-modal" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '24px' }}>
                    <div style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        background: '#fff'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '4px solid white',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                                {client.photo ? (
                                    <img src={getPhotoUrl(client.photo)} alt={client.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <FaUser size={48} color="#cbd5e1" />
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Name</span>
                                <span style={{ fontSize: '1rem', color: '#334155', fontWeight: '500' }}>: {client.fullName}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Email</span>
                                <span style={{ fontSize: '1rem', color: '#334155', fontWeight: '500' }}>: {client.email || 'N/A'}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Phone</span>
                                <span style={{ fontSize: '1rem', color: '#334155', fontWeight: '500' }}>: {client.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <button
                            onClick={handleCall}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#dcfce7',
                                color: '#16a34a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            title="Call"
                        >
                            <FaPhoneAlt size={20} />
                        </button>

                        <button
                            onClick={handleWhatsapp}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#dcfce7',
                                color: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            title="WhatsApp"
                        >
                            <FaWhatsapp size={24} />
                        </button>

                        <button
                            onClick={handleEmail}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#fee2e2',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            title="Email"
                        >
                            <FaEnvelope size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ClientDetailsModal;
