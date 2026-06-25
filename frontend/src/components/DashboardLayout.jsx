import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPhotoUrl } from "../utils/api";
import { FaUser } from "react-icons/fa";
import "./DashboardLayout.css";

export default function DashboardLayout({ sidebarLinks = [], title = "Menu", showProfileHeader = false, children }) {
  const { user } = useAuth();
  const [imageError, setImageError] = React.useState(false);

  // Reset image error when photo changes
  React.useEffect(() => {
    setImageError(false);
  }, [user?.photo]);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        {showProfileHeader && user ? (
          <div className="sidebar-profile-header">
            <div className="profile-avatar-container">
              {user.photo && !imageError ? (
                <img
                  src={`${getPhotoUrl(user.photo)}?t=${new Date().getTime()}`}
                  alt={user.fullName || user.name}
                  className="sidebar-avatar"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="sidebar-avatar-placeholder">
                  <FaUser />
                </div>
              )}
            </div>
            <div className="profile-details">
              <span className="profile-name">{user.fullName || user.name}</span>
              <span className="profile-role">{user.role?.toUpperCase()}</span>
            </div>
          </div>
        ) : (
          <h2 className="sidebar-title">{title}</h2>
        )}

        <nav className="sidebar-links">
          {sidebarLinks.map((link, index) => (
            <NavLink
              key={link.path || index}
              to={link.path || "/"}
              className={({ isActive }) =>
                `${isActive ? "active" : ""} ${link.className || ""}`
              }
              onClick={(e) => {
                if (link.action) {
                  e.preventDefault();
                  link.action(e);
                }
              }}
            >
              {link.icon && <span className="icon">{link.icon}</span>}
              <span>{link.name || "Link"}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
