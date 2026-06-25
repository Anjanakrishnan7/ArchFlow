import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import "./AdminProjects.css"; // Reusing table styles

const AdminReports = () => {
    const { token } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(`${BASE_URL}/admin/reports`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (data.success) {
                    setReports(data.reports);
                } else {
                    setError(data.message || "Failed to fetch reports");
                }
            } catch (err) {
                setError("Error connecting to server");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [token]);

    if (loading) return <div className="loading">Loading reports...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-projects-container">
            <h2>Reports</h2>
            <div className="projects-table-wrapper">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Content</th>
                            <th>Type</th>
                            <th>Submitted By</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <tr key={report._id}>
                                    <td>{report.title}</td>
                                    <td>{report.content}</td>
                                    <td>
                                        <span className="status-badge active">
                                            {report.type}
                                        </span>
                                    </td>
                                    <td>
                                        {report.submittedBy
                                            ? `${report.submittedBy.fullName} (${report.submittedBy.role})`
                                            : "Unknown"}
                                    </td>
                                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    No reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReports;
