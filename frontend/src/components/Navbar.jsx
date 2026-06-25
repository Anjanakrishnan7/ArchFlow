import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine Dashboard Link by user role
  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "staff") return "/staff/dashboard";
    return "/client/dashboard"; // default
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">ArchFlow</Link> {/* Brand Name */}

      <div className="nav-links">
        <NavLink to="/" className="nav-link" end>Home</NavLink>
        <NavLink to="/services" className="nav-link">Services</NavLink>
        <NavLink to="/projects" className="nav-link">Projects</NavLink>
        <NavLink to="/about" className="nav-link">About</NavLink>
        <NavLink to="/contact" className="nav-link">Contact</NavLink>
      </div>

      <div className="nav-actions">
        {!isAuthenticated ? (
          <>
            <Link className="btn-auth-secondary" to="/register">Register</Link>
            <Link className="btn-auth" to="/login">Login</Link>
          </>
        ) : (
          <>
            <NavLink to={getDashboardPath()} className="nav-link">
              Dashboard
            </NavLink>




            <button className="btn-auth" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
