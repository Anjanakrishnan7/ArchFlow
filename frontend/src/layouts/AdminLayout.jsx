import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaHourglassHalf,
  FaUsers,
  FaProjectDiagram,
  FaCommentDots,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: <FaChartLine /> },
  { path: "/admin/projects", label: "Projects", icon: <FaProjectDiagram /> },
  { path: "/admin/pending-approvals", label: "Registration Requests", icon: <FaHourglassHalf /> },
  { path: "/admin/payment-requests", label: "Request Payment", icon: <FaHourglassHalf /> },
  {
    label: "User Management",
    icon: <FaUsers />,
    subItems: [
      { path: "/admin/managers", label: "Managers" },
      { path: "/admin/staff-list", label: "Staff" },
      { path: "/admin/client-list", label: "Clients" },
    ],
  },
  { path: "/admin/complaints", label: "Complaints", icon: <FaCommentDots /> },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    navigate(path);
  };

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <nav className="sidebar-links">
          {menuItems.map((item, index) => {
            if (item.subItems) {
              const isExpanded = expandedMenus[item.label];
              return (
                <div key={index}>
                  <button
                    type="button"
                    className={`sidebar-menu-header ${isExpanded ? "expanded" : ""}`}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span className="icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="expand-icon">{isExpanded ? "▲" : "▼"}</span>
                  </button>
                  {isExpanded && (
                    <div className="sidebar-submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          type="button"
                          className={`sidebar-sublink ${location.pathname === subItem.path ? "active" : ""}`}
                          onClick={() => handleNavigate(subItem.path)}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="sidebar-link logout-link sidebar-link-spacer"
            onClick={handleLogout}
          >
            <span className="icon"><FaSignOutAlt /></span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
