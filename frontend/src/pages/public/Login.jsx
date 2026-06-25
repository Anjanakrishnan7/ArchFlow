import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaEnvelope, FaLock, FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const loginUrl = "/api/auth/login";

      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // <-- VERY IMPORTANT
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!data.success) {
        return setError(data.message || "Login failed");
      }

      // FIX: backend sends "id" but UI uses "_id"
      const userData = {
        ...data.user,
        _id: data.user.id,
      };

      await login(userData, data.accessToken);
      // Redirect based on role
      const redirectPath = data.user.role === "admin" ? "/admin/dashboard"
        : data.user.role === "manager" ? "/manager/dashboard"
          : data.user.role === "staff" ? "/staff/dashboard"
            : "/client/dashboard";

      navigate(redirectPath);

    } catch (err) {
      console.error("Login error", err);
      setError("Network error, please try again.");
    }
  };

  return (
    <div className="dynamic-register-wrapper">
      <div className="dynamic-register-card">
        <div className="register-header">
          <h1 className="register-title">Welcome Back</h1>
          <p className="register-subtitle">Please sign in to your account.</p>
        </div>

        {error && <div className="register-error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <fieldset className="form-section">
            <legend>Account Details</legend>

            {/* Role Selection */}
            <div className="input-group">
              <FaUserShield className="input-icon" />
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="" disabled>Select role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="client">Client</option>
              </select>
            </div>

            {/* Email */}
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </fieldset>

          <button type="submit" className="register-btn">
            Login
          </button>
        </form>

        <p className="register-footer-text">
          Don&apos;t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
