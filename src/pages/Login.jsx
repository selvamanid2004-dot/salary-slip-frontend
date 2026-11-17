/**
 * @file Login.jsx
 * @description Secure administrative login portal protecting the entire software.
 * Enforces single-device restrictions and mandatory authentication.
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
  AlertTriangle,
  ArrowRight,
  LogOut,
  Smartphone
} from 'lucide-react';
import { authService } from '../services/authService';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [conflictData, setConflictData] = useState(null);

  const handleSubmit = async (e, forceLogout = false) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!forceLogout) setConflictData(null);

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(username.trim(), password, forceLogout);
      if (res?.success) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.code === 'DEVICE_CONFLICT' || err.status === 409) {
        setConflictData({
          message: err.message || 'This account is currently active on another device.',
          activeDevice: err.data?.activeDevice || 'Another Device',
          canForceLogout: true
        });
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogoutAndLogin = () => {
    handleSubmit(null, true);
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
          <span>Single-Device Secure Access</span>
        </div>

        {/* Device Conflict Alert */}
        {conflictData && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '18px',
              color: '#92400e'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                  Account Active on Another Device
                </div>
                <div style={{ fontSize: '12px', lineHeight: 1.4, marginBottom: '10px', color: '#78350f' }}>
                  This account is currently logged into: <strong>{conflictData.activeDevice}</strong>.
                  Multiple simultaneous device logins are prohibited for security.
                </div>
                <button
                  type="button"
                  onClick={handleForceLogoutAndLogin}
                  disabled={loading}
                  style={{
                    background: '#b45309',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={14} />
                  <span>Log Out Other Device & Sign In Here</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standard Error Message Alert */}
        {errorMessage && !conflictData && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="login-form">
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (conflictData) setConflictData(null);
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (conflictData) setConflictData(null);
                }}
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
          <span>Protected by Hardware Device Binding & Session Token Encryption</span>
          <span className="login-version">WorkPulse Enterprise v1.0 • Ready for Deployment</span>
        </div>
      </div>
    </div>
  );
}
