/**
 * Mercy's Blog – Shared API helper
 * Base URL points to the Express backend
 */

const API_BASE = 'https://mercys-blog-api.onrender.com';

/** Get stored JWT */
function getToken() {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
}

/** Save JWT */
function setToken(token, remember) {
  if (remember) {
    localStorage.setItem('adminToken', token);
  } else {
    sessionStorage.setItem('adminToken', token);
  }
}

/** Clear JWT (logout) */
function clearToken() {
  localStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminLoggedIn');
}

/** Build headers (adds Authorization when token exists) */
function apiHeaders(isFormData = false) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
}

/**
 * Generic request helper
 * @param {string} method
 * @param {string} path - e.g. '/posts' or '/admin/login'
 * @param {object|FormData|null} body
 * @param {boolean} isFormData
 */
function apiRequest(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: apiHeaders(isFormData)
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  return $.ajax({
    url: API_BASE + path,
    method: options.method,
    headers: options.headers,
    data: options.body,
    processData: isFormData ? false : undefined,
    contentType: isFormData ? false : undefined,
    dataType: 'json'
  });
}

// Convenience methods
const api = {
  get: (path) => apiRequest('GET', path),
  post: (path, body, isFormData = false) => apiRequest('POST', path, body, isFormData),
  put: (path, body, isFormData = false) => apiRequest('PUT', path, body, isFormData),
  delete: (path) => apiRequest('DELETE', path)
};
