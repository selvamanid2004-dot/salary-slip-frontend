/**
 * @file authService.js
 * @description Authentication and Password Management client service.
 */

import { apiRequest } from './api';

const TOKEN_KEY = 'workpulse_admin_token';
const USER_KEY = 'workpulse_admin_user';

export const authService = {
  /**
   * Admin Login
   */
  async login(username, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password }
    });

    if (res?.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user || { username, name: 'Administrator' }));
    }

    return res;
  },

  /**
   * Verify token validity
   */
  async verifyToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await apiRequest('/auth/verify');
      if (res?.valid && res?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        return res.user;
      }
      return null;
    } catch (err) {
      this.logout();
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
   * Log out
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get cached user object
   */
  getCurrentUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if token is present
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
