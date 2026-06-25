import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ClientRegister() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Fake login data (replace with API later)
    login({ name: formData.name, email: formData.email }, "fake-token");

    alert("Registration Successful!");
  };

  return (
    <div>
      <h1>Create Client Account</h1>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <div className="input-group" style={{ position: 'relative' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
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

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
