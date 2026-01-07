import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api/outreach-extension';

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

// Open House endpoints
export const fetchOpenHouseSummary = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/open-house/summary`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch Open House summary');
  }
};

export const fetchOpenHouseList = async (token, page = 1, perPage = 10, search = '', year = null) => {
  try {
    const params = { page, per_page: perPage };
    if (search) params.search = search;
    if (year) params.year = year;
    const response = await axios.get(`${API_BASE_URL}/open-house/list`, {
      ...authHeaders(token),
      params
    });
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch Open House list');
  }
};

export const fetchOpenHouseTimeline = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/open-house/timeline`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch Open House timeline');
  }
};

// NPTEL endpoints
export const fetchNptelSummary = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nptel/summary`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch NPTEL summary');
  }
};

export const fetchNptelEnrollmentsOverTime = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nptel/enrollments-over-time`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch NPTEL enrollments over time');
  }
};

export const fetchNptelCourseCategories = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nptel/course-categories`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch NPTEL course categories');
  }
};

export const fetchNptelCertificationRatio = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nptel/certification-ratio`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch NPTEL certification ratio');
  }
};

// UBA endpoints
export const fetchUbaSummary = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/uba/summary`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch UBA summary');
  }
};

export const fetchUbaProjects = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/uba/projects`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch UBA projects');
  }
};

export const fetchUbaProjectEvents = async (token, projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/uba/events/${projectId}`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch UBA project events');
  }
};

