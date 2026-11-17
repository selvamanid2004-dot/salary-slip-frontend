/**
 * @file api.js
 * @description Centralized HTTP request client with standard error extraction,
 * smart environment & Render origin resolution, and active device session propagation.
 */

/**
 * Resolves the backend API base origin cleanly.
 * Handles trailing slashes, trailing '/api', Render pair detection, and local dev.
 */
export function getApiOrigin() {
  try {
    const custom = localStorage.getItem('workpulse_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '').replace(/\/api$/, '');
    }
  } catch {}

  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }

  // Auto-detect Render deployment pair if VITE_API_URL was omitted on Render
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    // e.g. salary-slip-frontend.onrender.com -> https://salary-slip-backend.onrender.com
    if (hostname.includes('-frontend.onrender.com')) {
      return `https://${hostname.replace('-frontend.onrender.com', '-backend.onrender.com')}`;
    }
    if (hostname.includes('frontend') && hostname.endsWith('.onrender.com')) {
      return `https://${hostname.replace('frontend', 'backend')}`;
    }
  }

  return '';
}

/**
 * Resolves the full base URL for API endpoints (e.g. "https://backend.onrender.com/api" or "/api")
 */
export function getApiBaseUrl() {
  const origin = getApiOrigin();
  return origin ? `${origin}/api` : '/api';
}

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
 * Executes an HTTP fetch request with standardized JSON handling and network error resolution
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
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

    // Provide friendly, actionable context if the browser encounters a network or CORS drop
    if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      const friendlyError = new Error(
        'Unable to connect to the backend server. If running on Render Free Tier, the backend service may be spinning up from sleep (takes ~30-40 seconds). Please wait a moment and try again.'
      );
      friendlyError.isNetworkError = true;
      friendlyError.originalError = error;
      throw friendlyError;
    }

    throw error;
  }
}

/**
 * Health check helper
 */
export async function checkServerHealth() {
  return await apiRequest('/health');
}
