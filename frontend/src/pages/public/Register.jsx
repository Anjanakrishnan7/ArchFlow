import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaUserTie,
  FaIdBadge,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import "./Register.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
    phone: "",
    qualification: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // If switching away from staff → clear qualification
    if (name === "role" && value !== "staff") {
      setFormData((prev) => ({ ...prev, qualification: "" }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError("Please enter a valid email address.");
    }

    // Phone validation (exactly 10 digits as requested)
    if (formData.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        return setError("Phone number must be exactly 10 digits.");
      }
    }

    // Password strength validation (min 8 chars, 1 letter, 1 number)
    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }
    if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      return setError("Password must contain both letters and numbers.");
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setIsLoading(false);
        return setError(data.message || "Registration failed.");
      }

      setSuccess(data.message);
      setIsLoading(false);

      // Reset form fields to initial empty values
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "client",
        phone: "",
        qualification: "",
      });

      // ⭐ Redirect ONLY clients
      if (formData.role === "client") {
        setTimeout(() => navigate("/login"), 2000);
      }

      // ⭐ Staff stays here — waits for approval

    } catch (err) {
      console.error("Registration error", err);
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="dynamic-register-wrapper">
      <div className="dynamic-register-card">

        <div className="register-header">
          <h1 className="register-title">Create an Account</h1>
          <p className="register-subtitle">
            Join us to manage your projects efficiently.
          </p>
        </div>

        {error && <div className="register-error-box">{error}</div>}
        {success && (
          <div className="form-success-message" style={{ marginBottom: "20px" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>

          <div className="input-group">
            <FaUserTie className="input-icon" />
            <label htmlFor="role-select" className="sr-only">Account Type</label>
            <select
              id="role-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="client">I am a Client</option>
              <option value="staff">I am a Staff Member</option>
            </select>
          </div>

          <div className="input-group">
            <FaUser className="input-icon" />
            <label htmlFor="fullName" className="sr-only">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <label htmlFor="email" className="sr-only">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaPhone className="input-icon" />
            <label htmlFor="phone" className="sr-only">Phone Number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* STAFF ONLY FIELD - QUALIFICATION */}
          {formData.role === "staff" && (
            <div className="input-group">
              <FaIdBadge className="input-icon" />
              <label htmlFor="qualification" className="sr-only">Qualification</label>
              <input
                id="qualification"
                type="text"
                name="qualification"
                placeholder="Qualification"
                value={formData.qualification}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="input-group">
            <FaLock className="input-icon" />
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
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

          <div className="input-group">
            <FaLock className="input-icon" />
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* BUTTON */}
          <button type="submit" className="register-btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-footer-text">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
