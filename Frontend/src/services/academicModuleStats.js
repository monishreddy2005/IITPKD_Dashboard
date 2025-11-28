import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api/academic-module';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  if (error?.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error?.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw new Error(defaultMessage);
};

export const fetchFilterOptions = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/filter-options`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch academic module filter options');
  }
};

export const fetchSummary = async (filters, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/summary${buildQuery(filters)}`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch academic summary');
  }
};

export const fetchIndustryCourseTrend = async (filters, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/industry-course-trend${buildQuery(filters)}`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch industry course trend');
  }
};

export const fetchIndustryCourses = async (filters, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/industry-courses${buildQuery(filters)}`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch industry course list');
  }
};

export const fetchProgramLaunchStats = async (filters, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/program-launch-stats${buildQuery(filters)}`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch program launch statistics');
  }
};

export const fetchProgramList = async (filters, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/program-list${buildQuery(filters)}`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch program list');
  }
};
