import React, { useEffect, useState } from "react";
import { usersAPI } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import "./PendingApprovals.css";

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getPending();
      setPendingUsers(data.users || []);
    } catch (err) {
      showToast('Failed to load pending users', 'error');
      console.error('Error fetching pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    try {
      await usersAPI.approve(userId, action);
      showToast(`User ${action === "approve" ? "approved" : "removed"} successfully`, 'success');
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading pending approvals...</div>;
  }

  return (
    <div className="table-card">
      <div className="page-header">
        <h1>Pending Approvals</h1>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="empty-state">
          <p>No pending approvals at this time.</p>
        </div>
      ) : (
        <table className="modern-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Qualification</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName || user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role === 'staff' ? 'info' : 'neutral'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className="badge badge-warning">
                    Pending
                  </span>
                </td>
                <td>{user.qualification || "N/A"}</td>
                <td>{user.phone || "N/A"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleAction(user._id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleAction(user._id, "decline")}
                    >
                      Decline
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
