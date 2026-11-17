/**
 * @file api.js
 * @description Centralized HTTP request client with standard error extraction
 * and active device session header propagation.
 */

const API_ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const BASE_URL = `${API_ORIGIN}/api`;

/**
 * Helper to get device ID without circular dependency
 */
function getClientDeviceId() {
  try {
    return localStorage.getItem('workpulse_device_id') || '';
  } catch {
    return '';
  }
}

/**
 * Helper to get session token from sessionStorage
 */
export function getSessionToken() {
  try {
    return sessionStorage.getItem('workpulse_session_token') || localStorage.getItem('workpulse_admin_token') || '';
  } catch {
    return '';
  }
}

/**
 * Executes an HTTP fetch request with standardized JSON handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const token = getSessionToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const deviceId = getClientDeviceId();
  if (deviceId) {
    defaultHeaders['X-Device-Id'] = deviceId;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data?.code || '';
      error.data = data;
      error.errors = data?.errors || [];

      // If session was terminated because another device logged in
      if (response.status === 401 && (data?.code === 'SESSION_TERMINATED' || data?.code === 'SESSION_INVALIDATED')) {
        window.dispatchEvent(new CustomEvent('workpulse:session_terminated', {
          detail: { message: data?.message || 'Your session has ended because another device logged in.' }
        }));
      }

      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Request Error] ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Health check helper
 */
export async function checkServerHealth() {
  return await apiRequest('/health');
}
