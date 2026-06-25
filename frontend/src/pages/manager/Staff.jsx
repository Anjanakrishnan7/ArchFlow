import React, { useEffect, useState, useCallback } from "react";
import { FaUserTie, FaPhone, FaEnvelope, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import "../admin/AdminProjects.css"; // Reuse Admin styles
import "../../styles/dashboard.css"; // Reuse Dashboard styles for cards

const ManagerStaff = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const fetchStaff = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/manager/staff`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setStaffList(data.staff || data.data);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    if (loading) return <div className="loading">Loading staff...</div>;

    return (
        <div className="admin-projects-container">
            <div className="page-header-section">
                <h1 className="page-title">My Staff</h1>
            </div>

            <div className="dashboard-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {staffList.length > 0 ? (
                    staffList.map((staff) => (
                        <div key={staff._id} className="dashboard-card" style={{ borderTop: '4px solid #007bff', display: 'block' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: '#e9ecef', color: '#495057',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '24px', marginRight: '15px'
                                }}>
                                    <FaUserTie />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#343a40' }}>{staff.fullName}</h3>
                                    <span className="status-badge ongoing" style={{ fontSize: '11px', marginTop: '5px' }}>
                                        {staff.role || 'Staff'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#6c757d' }}>
                                    <FaEnvelope style={{ marginRight: '10px' }} />
                                    <span>{staff.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                                    <FaPhone style={{ marginRight: '10px' }} />
                                    <span>{staff.phone || "N/A"}</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    className="btn-action"
                                    style={{ backgroundColor: '#6c757d', color: 'white', flex: 1, marginRight: '5px' }}
                                    onClick={() => navigate(`/manager/staff/${staff._id}`)} // Placeholder for profile view
                                >
                                    View Profile
                                </button>
                                <button
                                    className="btn-action"
                                    style={{ backgroundColor: '#007bff', color: 'white', flex: 1, marginLeft: '5px' }}
                                    onClick={() => navigate(`/manager/tasks?assignTo=${staff._id}`)}
                                >
                                    <FaTasks style={{ marginRight: '5px' }} /> Assign Task
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                        No staff assigned to your projects.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerStaff;
