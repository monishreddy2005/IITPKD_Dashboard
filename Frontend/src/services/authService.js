import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/auth';

const authHeaders = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  if (error.response) {
    throw new Error(error.response.data.message || defaultMessage);
  }
  throw new Error('Network error. Please check if the backend server is running.');
};

/**
 * Fetches current user information including role
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User object with role information
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/me`, authHeaders(token));
    return response.data.user;
  } catch (error) {
    handleError(error, 'Failed to fetch user information');
  }
};

/**
 * Checks if user has required role
 * @param {Object} user - User object with role_name
 * @param {string|Array} requiredRoles - Single role or array of roles
 * @returns {boolean} True if user has required role
 */
export const hasRole = (user, requiredRoles) => {
  if (!user || !user.role_name) {
    return false;
  }
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role_name);
};

/**
 * Checks if user is admin
 * @param {Object} user - User object with role_name
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, ['admin', 'administration']);
};

