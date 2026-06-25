import React, { useEffect, useState, useCallback } from "react";
import { FaUser, FaPhone, FaEnvelope, FaStickyNote, FaFolderOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BASE_URL, getPhotoUrl } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import "../admin/AdminProjects.css"; // Reuse Admin styles
import "../../styles/dashboard.css"; // Reuse Dashboard styles for cards

const ManagerClients = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const fetchClients = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/manager/clients`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setClients(data.clients || data.data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    if (loading) return <div className="loading">Loading clients...</div>;

    return (
        <div className="admin-projects-container">
            <div className="page-header-section">
                <h1 className="page-title">My Clients</h1>
            </div>

            <div className="dashboard-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {clients.length > 0 ? (
                    clients.map((client) => (
                        <div key={client._id} className="dashboard-card" style={{ borderTop: '4px solid #6f42c1', display: 'block' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: '#e9ecef', color: '#495057',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '24px', marginRight: '15px', overflow: 'hidden'
                                }}>
                                    {client.photo ? (
                                        <img src={getPhotoUrl(client.photo)} alt={client.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FaUser />
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#343a40' }}>{client.fullName}</h3>
                                    <span className="status-badge" style={{ fontSize: '11px', marginTop: '5px', backgroundColor: '#6f42c1', color: 'white' }}>
                                        Client
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#6c757d' }}>
                                    <FaEnvelope style={{ marginRight: '10px' }} />
                                    <span>{client.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#6c757d' }}>
                                    <FaPhone style={{ marginRight: '10px' }} />
                                    <span>{client.phone || "N/A"}</span>
                                </div>
                                {client.project && (
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '13px' }}>
                                        <FaFolderOpen style={{ marginRight: '10px' }} />
                                        <span>Project: <strong>{client.project.name}</strong></span>
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    className="btn-action"
                                    style={{ backgroundColor: '#17a2b8', color: 'white', flex: 1, marginRight: '5px' }}
                                    onClick={() => navigate(`/manager/clients/${client._id}/notes`)} // Placeholder for notes
                                >
                                    <FaStickyNote style={{ marginRight: '5px' }} /> Notes
                                </button>
                                <button
                                    className="btn-action"
                                    style={{ backgroundColor: '#6c757d', color: 'white', flex: 1, marginLeft: '5px' }}
                                    onClick={() => navigate(`/manager/clients/${client._id}`)} // Placeholder for details
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                        No clients found for your projects.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerClients;
