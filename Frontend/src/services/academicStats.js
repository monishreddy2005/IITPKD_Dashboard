import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api/academic';

/**
 * Fetches filter options including distinct values for each filter field
 * and the latest year of admission.
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Filter options object
 */
export const fetchFilterOptions = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/filter-options`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching filter options:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch filter options');
    }
    throw new Error('Network error. Please check if the backend server is running.');
  }
};

/**
 * Fetches gender distribution data based on provided filters.
 * @param {Object} filters - Filter object with optional fields:
 *   - yearofadmission: number
 *   - program: string
 *   - batch: string ('Jan' or 'Jul')
 *   - branch: string
 *   - department: string
 *   - category: string
 *   - pwd: boolean | null
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Gender distribution data with total and filters_applied
 */
export const fetchGenderDistributionFiltered = async (filters, token) => {
  try {
    // Build query parameters, excluding null/undefined values
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'pwd' && typeof value === 'boolean') {
          params.append(key, value.toString());
        } else {
          params.append(key, value);
        }
      }
    });
    
    const response = await axios.get(
      `${API_BASE_URL}/stats/gender-distribution-filtered?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching gender distribution:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch gender distribution');
    }
    throw new Error('Network error. Please check if the backend server is running.');
  }
};

