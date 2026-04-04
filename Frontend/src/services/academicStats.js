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
 * @param {Object} filters - Filter object with optional fields
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Gender distribution data with total and filters_applied
 */
export const fetchGenderDistributionFiltered = async (filters, token) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'pwd' && typeof value === 'boolean') {
          params.append(key, value.toString());
        } else if (key === 'yearofadmission' && value === 'All') {
          params.append(key, 'All');
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

/**
 * Fetches student strength data grouped by program based on provided filters.
 * @param {Object} filters - Filter object
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Student strength data with total and filters_applied
 */
export const fetchStudentStrengthFiltered = async (filters, token) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'yearofadmission' && value === 'All') {
          params.append(key, 'All');
        } else {
          params.append(key, value);
        }
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/stats/student-strength?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // Log the response to see what data is coming back
    console.log('Student Strength API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error fetching student strength:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch student strength');
    }
    throw new Error('Network error. Please check if the backend server is running.');
  }
};

/**
 * Fetches gender distribution trends (grouped by year).
 * @param {Object} filters - Filter object
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Trend data
 */
export const fetchGenderTrends = async (filters, token) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '' && value !== 'All') {
        if (key === 'pwd' && typeof value === 'boolean') {
          params.append(key, value.toString());
        } else {
          params.append(key, value);
        }
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/stats/gender-trends?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching gender trends:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch gender trends');
    }
    throw new Error('Network error. Please check if the backend server is running.');
  }
};

/**
 * Fetches student strength by program trends (grouped by year).
 * @param {Object} filters - Filter object
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Trend data
 */
export const fetchProgramTrends = async (filters, token) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '' && value !== 'All') {
        params.append(key, value);
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/stats/program-trends?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching program trends:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch program trends');
    }
    throw new Error('Network error. Please check if the backend server is running.');
  }
};

/**
 * Fetches cumulative student summary for summary cards.
 * Groups programs into UG (B.Tech), PG (M.Tech + MSc), and Research (PhD)
 * @param {number|null} year - Year to filter by (null for all years)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Cumulative summary data with total_students, ug_total, pg_total, research_total
 */
export const fetchCumulativeStudentSummary = async (year, token) => {
  try {
    // Use existing student strength endpoint to get program-wise data
    let url = `${API_BASE_URL}/stats/student-strength`;
    const params = new URLSearchParams();
    
    if (year && year !== 'All' && year !== null) {
      params.append('yearofadmission', year);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log('Fetching cumulative summary from:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Raw response from student-strength API:', JSON.stringify(response.data, null, 2));
    
    // Check if the response has data
    if (!response.data) {
      console.warn('No data received from API');
      return {
        total_students: 0,
        ug_total: 0,
        pg_total: 0,
        research_total: 0
      };
    }
    
    // Handle different possible response formats
    let studentStrengthData = [];
    
    // Try to extract the data array from response
    if (response.data.data && Array.isArray(response.data.data)) {
      studentStrengthData = response.data.data;
      console.log('Data found in response.data.data');
    } else if (response.data.studentStrength && Array.isArray(response.data.studentStrength)) {
      studentStrengthData = response.data.studentStrength;
      console.log('Data found in response.data.studentStrength');
    } else if (response.data.students && Array.isArray(response.data.students)) {
      studentStrengthData = response.data.students;
      console.log('Data found in response.data.students');
    } else if (response.data.results && Array.isArray(response.data.results)) {
      studentStrengthData = response.data.results;
      console.log('Data found in response.data.results');
    } else if (Array.isArray(response.data)) {
      studentStrengthData = response.data;
      console.log('Data found directly in response.data');
    } else {
      console.warn('Could not find data array in response. Response structure:', Object.keys(response.data));
      // If the response itself is an object with program names as keys
      if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Convert object to array format
        studentStrengthData = Object.entries(response.data).map(([name, total]) => ({
          name: name,
          total: total,
          program: name,
          count: total
        }));
        console.log('Converted object to array:', studentStrengthData);
      } else {
        return {
          total_students: 0,
          ug_total: 0,
          pg_total: 0,
          research_total: 0
        };
      }
    }
    
    console.log('Parsed student strength data:', studentStrengthData);
    
    let ugTotal = 0;
    let pgTotal = 0;
    let researchTotal = 0;
    
    studentStrengthData.forEach(program => {
      // Try different possible field names for program name
      const programName = program.name || program.program || program.program_name || program.programme || program.category || '';
      // Try different possible field names for total count
      const total = program.total || program.count || program.student_count || program.students || program.value || 0;
      
      console.log(`Processing program: "${programName}", Total: ${total}`);
      
      // UG: B.Tech only
      if (programName === 'B.Tech' || programName === 'BTech' || programName === 'B.Tech.' || 
          programName === 'Bachelor of Technology' || (typeof programName === 'string' && programName.toLowerCase().includes('b.tech'))) {
        ugTotal += total;
        console.log(`Added to UG: +${total} = ${ugTotal}`);
      } 
      // PG: M.Tech and MSc
      else if (programName === 'M.Tech' || programName === 'MTech' || programName === 'M.Tech.' || 
               programName === 'Master of Technology' || (typeof programName === 'string' && programName.toLowerCase().includes('m.tech')) ||
               programName === 'MSc' || programName === 'M.Sc' || programName === 'M.Sc.' || 
               programName === 'Master of Science' || (typeof programName === 'string' && programName.toLowerCase().includes('msc'))) {
        pgTotal += total;
        console.log(`Added to PG: +${total} = ${pgTotal}`);
      } 
      // Research: PhD only
      else if (programName === 'PhD' || programName === 'Ph.D' || programName === 'Ph.D.' || 
               programName === 'Doctor of Philosophy' || (typeof programName === 'string' && programName.toLowerCase().includes('phd'))) {
        researchTotal += total;
        console.log(`Added to Research: +${total} = ${researchTotal}`);
      } else {
        console.log(`Unknown program type: "${programName}" - not categorized`);
      }
    });
    
    const totalStudents = ugTotal + pgTotal + researchTotal;
    
    console.log('Final calculated totals:', {
      total_students: totalStudents,
      ug_total: ugTotal,
      pg_total: pgTotal,
      research_total: researchTotal
    });
    
    return {
      total_students: totalStudents,
      ug_total: ugTotal,
      pg_total: pgTotal,
      research_total: researchTotal
    };
  } catch (error) {
    console.error('Error fetching cumulative student summary:', error);
    return {
      total_students: 0,
      ug_total: 0,
      pg_total: 0,
      research_total: 0
    };
  }
};