/**
 * api.js – Thin wrapper around fetch for communicating with the DRF backend.
 */

const API_BASE = window.API_BASE_URL || '/api';

/**
 * Generic request helper.
 * @param {string} endpoint  - Path relative to API_BASE (e.g. '/auth/login/')
 * @param {string} method    - HTTP method
 * @param {object} [body]    - JSON-serialisable request body
 * @param {boolean} [auth]   - Whether to attach the JWT Bearer token
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function apiRequest(endpoint, method = 'GET', body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: { detail: 'Network error. Please try again.' } };
  }
}

/**
 * Auth helpers
 */
const Auth = {
  async login(username, password) {
    return apiRequest('/auth/login/', 'POST', { username, password });
  },

  async register(payload) {
    return apiRequest('/auth/register/', 'POST', payload);
  },

  async refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;
    return apiRequest('/auth/token/refresh/', 'POST', { refresh });
  },

  async getMe() {
    return apiRequest('/auth/me/', 'GET', null, true);
  },

  saveTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isLoggedIn() {
    return !!localStorage.getItem('access_token');
  },
};
