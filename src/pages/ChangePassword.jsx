/**
 * @file ChangePassword.jsx
 * @description Dedicated security module inside the software for updating administrator password.
 */

import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Info,
  RotateCcw
} from 'lucide-react';
import { authService } from '../services/authService';

export default function ChangePassword({ currentUser, showToast }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password matching check
  const isMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isLengthValid = newPassword.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword, confirmPassword);
      if (res?.success) {
        setSuccessMessage('Password has been updated successfully! Your new password will be required on your next login.');
        if (showToast) {
          showToast('Administrator password updated successfully!', 'success');
        }
        // Reset inputs
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(res?.message || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating password. Please verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const username = currentUser?.username || 'admin';
  const displayName = currentUser?.name || 'Administrator';

  return (
    <div className="change-password-page">
      {/* Top Section Header */}
      <div className="page-header-card">
        <div className="header-icon-wrapper">
          <KeyRound size={26} />
        </div>
        <div>
          <h2>Security & Password Management</h2>
          <p>Update administrative access credentials and safeguard your enterprise payroll records</p>
        </div>
      </div>

      <div className="security-grid">
        {/* Left Column: Account Details & Security Best Practices */}
        <div className="security-info-col">
          <div className="card security-account-card">
            <div className="card-header">
              <UserCheck size={18} color="var(--color-primary)" />
              <h3>Current Administrator</h3>
            </div>
            <div className="card-body">
              <div className="admin-profile-badge">
                <div className="admin-avatar">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="admin-name">{displayName}</div>
                  <div className="admin-username">@{username}</div>
                </div>
              </div>

              <div className="admin-meta-list">
                <div className="meta-row">
                  <span className="meta-label">Access Level</span>
                  <span className="badge badge-success">Master Administrator</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Encryption</span>
                  <span className="badge badge-info">Bcrypt SHA-256</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Account Status</span>
                  <span className="badge badge-outline">Active & Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card security-tips-card">
            <div className="card-header">
              <ShieldAlert size={18} color="var(--color-warning)" />
              <h3>Password Guidelines</h3>
            </div>
            <div className="card-body">
              <ul className="guidelines-list">
                <li>
                  <CheckCircle2 size={15} color="var(--color-success)" />
                  <span>Use at least 6 characters (8+ recommended).</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="var(--color-success)" />
                  <span>Mix uppercase, lowercase, numbers, and symbols.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="var(--color-success)" />
                  <span>Avoid common words or sequences like <code>123456</code>.</span>
                </li>
                <li>
                  <Info size={15} color="var(--color-info)" />
                  <span>Changing your password takes effect immediately across all sessions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password Form */}
        <div className="security-form-col">
          <div className="card change-password-card">
            <div className="card-header">
              <Lock size={18} color="var(--color-primary)" />
              <h3>Change Password</h3>
            </div>
            <div className="card-body">
              {errorMessage && (
                <div className="alert-box error">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="alert-box success">
                  <CheckCircle2 size={18} />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="change-password-form">
                {/* 1. Current Password */}
                <div className="form-group">
                  <label className="form-label">
                    Current Password <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrent(!showCurrent)}
                      title={showCurrent ? 'Hide password' : 'Show password'}
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <span className="field-hint">
                    Enter the existing password used to log in to the software.
                  </span>
                </div>

                <div className="divider" style={{ margin: '16px 0', borderColor: 'var(--border-light)' }} />

                {/* 2. New Password */}
                <div className="form-group">
                  <label className="form-label">
                    New Password <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <KeyRound size={18} />
                    </span>
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter strong new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNew(!showNew)}
                      title={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {newPassword.length > 0 && (
                    <div className="password-feedback">
                      <div className="requirement-pill">
                        {isLengthValid ? (
                          <span className="valid">
                            <CheckCircle2 size={13} /> At least 6 characters
                          </span>
                        ) : (
                          <span className="invalid">
                            <AlertCircle size={13} /> Min 6 characters ({newPassword.length}/6)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Confirm New Password */}
                <div className="form-group">
                  <label className="form-label">
                    Confirm New Password <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <ShieldCheck size={18} />
                    </span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className={`form-control ${confirmPassword && !isMatch ? 'input-error' : ''}`}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirm(!showConfirm)}
                      title={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <div className="password-feedback">
                      <div className="requirement-pill">
                        {isMatch ? (
                          <span className="valid">
                            <CheckCircle2 size={13} /> Passwords match
                          </span>
                        ) : (
                          <span className="invalid">
                            <AlertCircle size={13} /> Passwords do not match
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="form-actions-row">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleReset}
                    disabled={loading || (!currentPassword && !newPassword && !confirmPassword)}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !currentPassword || !isLengthValid || !isMatch}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
