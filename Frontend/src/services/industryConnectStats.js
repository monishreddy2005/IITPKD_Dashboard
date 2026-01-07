import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api/industry-connect';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  if (error?.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(defaultMessage);
};

// ICSR Section APIs
export const fetchIcsrSummary = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/icsr/summary`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch ICSR summary');
  }
};

export const fetchIcsrYearlyDistribution = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/icsr/yearly-distribution`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch ICSR yearly distribution');
  }
};

export const fetchIcsrEventTypes = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/icsr/event-types`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch ICSR event types');
  }
};

export const fetchIcsrEvents = async (filters, page = 1, perPage = 50, token) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        params.append(key, value);
      }
    });
    params.append('page', page);
    params.append('per_page', perPage);
    
    const response = await axios.get(
      `${API_BASE_URL}/icsr/events?${params.toString()}`,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch ICSR events list');
  }
};

export const fetchIcsrFilterOptions = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/icsr/filter-options`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch ICSR filter options');
  }
};

// Industry-Academia Conclave APIs
export const fetchConclaveSummary = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/conclave/summary`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch conclave summary');
  }
};

export const fetchConclaveList = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/conclave/list`, authHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch conclave list');
  }
};

