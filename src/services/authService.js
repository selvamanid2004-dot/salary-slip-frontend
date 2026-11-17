/**
 * @file authService.js
 * @description Authentication, Session, and Device Management client service.
 * Enforces session-only storage (mandatory password on reopening) and single-device integrity.
 */

import { apiRequest } from './api';

const SESSION_TOKEN_KEY = 'workpulse_session_token';
const SESSION_USER_KEY = 'workpulse_session_user';
const DEVICE_ID_KEY = 'workpulse_device_id';

// Clean up any legacy persistent localStorage tokens to enforce session-only auth
try {
  localStorage.removeItem('workpulse_admin_token');
  localStorage.removeItem('workpulse_admin_user');
} catch (e) {
  // Ignore storage errors
}

/**
 * Detects a human-readable device name based on User-Agent
 */
function detectDeviceName() {
  const ua = navigator.userAgent;
  let os = 'Unknown Device';
  if (ua.includes('Win')) os = 'Windows PC';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux PC';
  else if (ua.includes('Android')) os = 'Android Device';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Device';

  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';

  return `${os} (${browser})`;
}

export const authService = {
  /**
   * Retrieves or creates a persistent unique Device ID for this machine
   */
  getDeviceId() {
    try {
      let id = localStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
        localStorage.setItem(DEVICE_ID_KEY, id);
      }
      return id;
    } catch {
      return 'dev_default';
    }
  },

  /**
   * Retrieves the human-readable device name
   */
  getDeviceName() {
    return detectDeviceName();
  },

  /**
   * Admin Login with Single-Device Tracking
   * @param {string} username
   * @param {string} password
   * @param {boolean} [forceLogout=false]
   */
  async login(username, password, forceLogout = false) {
    const deviceId = this.getDeviceId();
    const deviceName = this.getDeviceName();

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        username,
        password,
        deviceId,
        deviceName,
        forceLogout
      }
    });

    if (res?.token) {
      // Store in sessionStorage so closing the browser/software wipes it automatically
      sessionStorage.setItem(SESSION_TOKEN_KEY, res.token);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user || { username, name: 'Administrator' }));
    }

    return res;
  },

  /**
   * Verify token and active session validity
   */
  async verifyToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await apiRequest('/auth/verify');
      if (res?.valid && res?.user) {
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
        return res.user;
      }
      return null;
    } catch (err) {
      this.clearSession();
      return null;
    }
  },

  /**
   * Change Password
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    const user = this.getCurrentUser();
    return await apiRequest('/auth/change-password', {
      method: 'POST',
      body: {
        username: user?.username || 'admin',
        currentPassword,
        newPassword,
        confirmPassword
      }
    });
  },

  /**
   * Log out from this device, invalidating the backend session immediately
   */
  async logout() {
    const deviceId = this.getDeviceId();
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: { deviceId }
      });
    } catch (err) {
      console.warn('[AuthService] Logout notification to server failed:', err);
    } finally {
      this.clearSession();
    }
  },

  /**
   * Clear local session storage
   */
  clearSession() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem('workpulse_admin_token');
    localStorage.removeItem('workpulse_admin_user');
  },

  /**
   * Get active session JWT token
   */
  getToken() {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  },

  /**
   * Get cached user object
   */
  getCurrentUser() {
    try {
      const u = sessionStorage.getItem(SESSION_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if active session token exists in sessionStorage
   */
  isAuthenticated() {
    return !!sessionStorage.getItem(SESSION_TOKEN_KEY);
  }
};
