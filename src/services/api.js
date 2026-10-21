/**
 * @file api.js
 * @description Centralized HTTP request client with standard error extraction.
 */

const API_ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const BASE_URL = `${API_ORIGIN}/api`;

/**
 * Executes an HTTP fetch request with standardized JSON handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const token = localStorage.getItem('workpulse_admin_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
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
      error.errors = data?.errors || [];
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
