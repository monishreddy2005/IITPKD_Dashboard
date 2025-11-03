import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { fetchFilterOptions, fetchGenderDistributionFiltered } from '../services/academicStats';
import './Page.css';
import './AcademicSection.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb'];

function AcademicSection() {
  const [filterOptions, setFilterOptions] = useState({
    yearofadmission: [],
    program: [],
    batch: [],
    branch: [],
    department: [],
    category: [],
    latest_year: null
  });
  
  const [filters, setFilters] = useState({
    yearofadmission: null,
    program: null,
    batch: null,
    branch: null,
    department: null,
    category: null,
    pwd: null
  });
  
  const [genderData, setGenderData] = useState({
    Male: 0,
    Female: 0,
    Transgender: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // Get token from localStorage
  const token = localStorage.getItem('authToken');

  // Fetch filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const options = await fetchFilterOptions(token);
        setFilterOptions(options);
        
        // Set default year to latest year
        if (options.latest_year) {
          setFilters(prev => ({
            ...prev,
            yearofadmission: options.latest_year
          }));
        }
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Failed to load filter options. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, [token]);

  // Fetch gender distribution when filters change
  useEffect(() => {
    const loadGenderData = async () => {
      if (!token) {
        return;
      }

      // Don't fetch if yearofadmission is not set yet
      if (filters.yearofadmission === null) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchGenderDistributionFiltered(filters, token);
        setGenderData(result.data);
        setTotal(result.total);
      } catch (err) {
        console.error('Error loading gender distribution:', err);
        setError('Failed to load gender distribution data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadGenderData();
  }, [filters, token]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? null : value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      yearofadmission: filterOptions.latest_year || null,
      program: null,
      batch: null,
      branch: null,
      department: null,
      category: null,
      pwd: null
    });
  };

  // Prepare data for pie chart
  const chartData = [
    { name: 'Male', value: genderData.Male || 0 },
    { name: 'Female', value: genderData.Female || 0 },
    { name: 'Transgender', value: genderData.Transgender || 0 }
  ].filter(item => item.value > 0); // Filter out zero values for cleaner chart

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="tooltip-percentage">
            {((payload[0].value / total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="custom-legend">
        {payload.map((entry, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="legend-label">{entry.value}</span>
            <span className="legend-value">{genderData[entry.value] || 0}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Academic Section - Gender Distribution</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Filter Panel */}
        <div className="filter-panel">
          <div className="filter-header">
            <h2>Filters</h2>
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear All Filters
            </button>
          </div>
          
          <div className="filter-grid">
            {/* Year of Admission */}
            <div className="filter-group">
              <label htmlFor="year-filter">Year of Admission</label>
              <select
                id="year-filter"
                value={filters.yearofadmission || ''}
                onChange={(e) => handleFilterChange('yearofadmission', e.target.value ? parseInt(e.target.value) : null)}
                className="filter-select"
              >
                <option value="">Select Year</option>
                {filterOptions.yearofadmission.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Program */}
            <div className="filter-group">
              <label htmlFor="program-filter">Program</label>
              <select
                id="program-filter"
                value={filters.program || 'All'}
                onChange={(e) => handleFilterChange('program', e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                {filterOptions.program.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div className="filter-group">
              <label htmlFor="batch-filter">Batch</label>
              <select
                id="batch-filter"
                value={filters.batch || 'All'}
                onChange={(e) => handleFilterChange('batch', e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                {filterOptions.batch.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div className="filter-group">
              <label htmlFor="branch-filter">Branch</label>
              <select
                id="branch-filter"
                value={filters.branch || 'All'}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                {filterOptions.branch.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="filter-group">
              <label htmlFor="department-filter">Department</label>
              <select
                id="department-filter"
                value={filters.department || 'All'}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                {filterOptions.department.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="filter-group">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={filters.category || 'All'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                {filterOptions.category.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* PWD */}
            <div className="filter-group">
              <label htmlFor="pwd-filter">PWD</label>
              <select
                id="pwd-filter"
                value={filters.pwd === true ? 'true' : filters.pwd === false ? 'false' : 'All'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('pwd', value === 'true' ? true : value === 'false' ? false : null);
                }}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : (
            <>
              {total > 0 ? (
                <>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-info">
                    <CustomLegend payload={chartData.map((item, index) => ({
                      value: item.name,
                      color: COLORS[index % COLORS.length]
                    }))} />
                    <div className="total-count">
                      <strong>Total Students: {total}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-data">
                  <p>No data available for the selected filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcademicSection;
