/**
 * Mercy's Blog – Shared API helper
 * Base URL points to the Express backend
 */

// Always include /api — no trailing slash
const API_BASE = 'https://mercys-blog-api.onrender.com/api';

function getToken() {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
}

function setToken(token, remember) {
  if (remember) {
    localStorage.setItem('adminToken', token);
  } else {
    sessionStorage.setItem('adminToken', token);
  }
}

function clearToken() {
  localStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminLoggedIn');
}

function apiHeaders(isFormData) {
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
 * @param {string} method
 * @param {string} path - must start with / e.g. '/admin/login' or '/posts'
 * @param {object|FormData|null} body
 * @param {boolean} isFormData
 */
function apiRequest(method, path, body, isFormData) {
  isFormData = !!isFormData;
  if (!path) path = '/';
  if (path.charAt(0) !== '/') path = '/' + path;

  // Guard against double /api/api if someone passes full path
  var url = API_BASE + path;
  url = url.replace(/\/api\/api\//, '/api/');

  console.log('[API]', method, url);

  return $.ajax({
    url: url,
    method: method,
    headers: apiHeaders(isFormData),
    data: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    processData: isFormData ? false : false,
    contentType: isFormData ? false : 'application/json',
    dataType: 'json'
  });
}

var api = {
  get: function (path) { return apiRequest('GET', path); },
  post: function (path, body, isFormData) { return apiRequest('POST', path, body, isFormData); },
  put: function (path, body, isFormData) { return apiRequest('PUT', path, body, isFormData); },
  delete: function (path) { return apiRequest('DELETE', path); }
};
