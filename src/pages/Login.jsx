/**
 * @file Login.jsx
 * @description Secure administrative login portal protecting the entire software.
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { authService } from '../services/authService';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(username.trim(), password);
      if (res?.success) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-icon">
            <Briefcase size={28} />
          </div>
          <h1 className="login-brand-title">
            Work<span>Pulse</span>
          </h1>
          <p className="login-brand-subtitle">
            Enterprise Payroll & Employee Management System
          </p>
        </div>

        {/* Security Shield Badge */}
        <div className="login-badge">
          <ShieldCheck size={16} />
          <span>Secure Administrator Access</span>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <User size={18} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              <>
                <span>Sign In to WorkPulse</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="login-footer">
          <span>Protected by AES-256 & Bcrypt Password Encryption</span>
          <span className="login-version">WorkPulse Enterprise v1.0 • Ready for Deployment</span>
        </div>
      </div>
    </div>
  );
}
