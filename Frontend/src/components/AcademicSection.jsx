import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchFilterOptions, fetchGenderDistributionFiltered, fetchStudentStrengthFiltered, fetchGenderTrends, fetchProgramTrends } from '../services/academicStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb'];
const TREND_COLORS = ['#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#ff9a9e', '#fbc2eb', '#a18cd1', '#fad0c4', '#ffd1ff', '#a6c1ee'];

const BAR_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 700,
  animationEasing: 'ease-out',
  animationBegin: 80
};

function AcademicSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    yearofadmission: [],
    program: [],
    batch: [],
    branch: [],
    department: [],
    category: [],
    state: [],
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

  // Student Strength state
  const [studentStrengthData, setStudentStrengthData] = useState([]);
  const [strengthFilters, setStrengthFilters] = useState({
    yearofadmission: null,
    category: null,
    state: null
  });
  const [strengthLoading, setStrengthLoading] = useState(false);
  const [strengthError, setStrengthError] = useState(null);
  const [strengthTotal, setStrengthTotal] = useState(0);

  // Gender Trend Data State
  const [selectedGender, setSelectedGender] = useState('All');
  const [trendYears, setTrendYears] = useState(5);
  const [genderTrendData, setGenderTrendData] = useState([]);
  const [genderTrendLoading, setGenderTrendLoading] = useState(true);
  const [genderTrendFilters, setGenderTrendFilters] = useState({
    program: null,
    batch: null,
    branch: null,
    department: null,
    category: null,
    pwd: null
  });

  // Program Trend Data State
  const [programTrendData, setProgramTrendData] = useState([]);
  const [programTrendPrograms, setProgramTrendPrograms] = useState([]);
  const [programTrendLoading, setProgramTrendLoading] = useState(true);
  const [programTrendFilters, setProgramTrendFilters] = useState({
    category: null,
    state: null
  });

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
          setStrengthFilters(prev => ({
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

  const handleTrendYearChange = (value) => {
    setTrendYears(parseInt(value, 10));
  };

  const handleGenderSelection = (value) => {
    setSelectedGender(value);
  };

  const displayGenderTrendData = useMemo(() => {
    if (!genderTrendData || genderTrendData.length === 0) return [];
    return genderTrendData.slice(-trendYears);
  }, [genderTrendData, trendYears]);

  const hasTrendData = displayGenderTrendData.some(
    d =>
      (d.Male || 0) > 0 ||
      (d.Female || 0) > 0 ||
      (d.Transgender || 0) > 0
  );

  // Check if pie chart has data
  const hasPieData = total > 0;

  // Check if program trend has data
  const hasProgramTrendData = programTrendData.length > 0 && programTrendData.slice(-5).some(
    d => programTrendPrograms.some(program => (d[program] || 0) > 0)
  );

  // Check if student strength has data
  const hasStrengthData = strengthTotal > 0 && studentStrengthData.some(
    d => (d.Male || 0) > 0 || (d.Female || 0) > 0 || (d.Transgender || 0) > 0
  );

  // Fetch gender distribution when filters change
  useEffect(() => {
    const loadGenderData = async () => {
      if (!token) {
        return;
      }

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

  // Fetch student strength when strength filters change
  useEffect(() => {
    const loadStudentStrength = async () => {
      if (!token) {
        return;
      }

      if (strengthFilters.yearofadmission === null) {
        return;
      }

      try {
        setStrengthLoading(true);
        setStrengthError(null);
        const result = await fetchStudentStrengthFiltered(strengthFilters, token);
        setStudentStrengthData(result.data);
        setStrengthTotal(result.total);
      } catch (err) {
        console.error('Error loading student strength:', err);
        setStrengthError('Failed to load student strength data. Please try again.');
      } finally {
        setStrengthLoading(false);
      }
    };

    loadStudentStrength();
  }, [strengthFilters, token]);

  // Fetch gender trend data when filters change
  useEffect(() => {
    const loadGenderTrends = async () => {
      if (!token) return;

      try {
        setGenderTrendLoading(true);
        const genderTrends = await fetchGenderTrends(genderTrendFilters, token);
        setGenderTrendData(genderTrends.data);
      } catch (err) {
        console.error('Error loading gender trends:', err);
      } finally {
        setGenderTrendLoading(false);
      }
    };

    loadGenderTrends();
  }, [genderTrendFilters, token]);

  // Fetch program trend data when filters change
  useEffect(() => {
    const loadProgramTrends = async () => {
      if (!token) return;

      try {
        setProgramTrendLoading(true);
        const programTrends = await fetchProgramTrends(programTrendFilters, token);
        setProgramTrendData(programTrends.data);
        setProgramTrendPrograms(programTrends.programs);
      } catch (err) {
        console.error('Error loading program trends:', err);
      } finally {
        setProgramTrendLoading(false);
      }
    };

    loadProgramTrends();
  }, [programTrendFilters, token]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? (filterName === 'yearofadmission' ? 'All' : null) : value
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

  const handleStrengthFilterChange = (filterName, value) => {
    setStrengthFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? (filterName === 'yearofadmission' ? 'All' : null) : value
    }));
  };

  const handleClearStrengthFilters = () => {
    setStrengthFilters({
      yearofadmission: filterOptions.latest_year || null,
      category: null,
      state: null
    });
  };

  const handleGenderTrendFilterChange = (filterName, value) => {
    setGenderTrendFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? null : value
    }));
  };

  const handleClearGenderTrendFilters = () => {
    setGenderTrendFilters({
      program: null,
      batch: null,
      branch: null,
      department: null,
      category: null,
      pwd: null
    });
    setTrendYears(5);
    setSelectedGender('All');
  };

  const handleProgramTrendFilterChange = (filterName, value) => {
    setProgramTrendFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? null : value
    }));
  };

  const handleClearProgramTrendFilters = () => {
    setProgramTrendFilters({
      category: null,
      state: null
    });
  };

  // Prepare data for pie chart
  const chartData = [
    { name: 'Male', value: genderData.Male || 0 },
    { name: 'Female', value: genderData.Female || 0 },
    { name: 'Transgender', value: genderData.Transgender || 0 }
  ].filter(item => item.value > 0);

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
      <div className="custom-legend" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
        {payload.map((entry, index) => (
          <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <span
              className="legend-color"
              style={{ backgroundColor: entry.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}
            ></span>
            <span className="legend-label" style={{ fontWeight: '600', color: '#495057', marginRight: '8px' }}>{entry.value}</span>
            <span className="legend-value" style={{ fontWeight: 'bold', color: '#212529' }}>{genderData[entry.value] || 0}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {!isPublicView && <h1>Academic Section - Gender & Strength</h1>}
          {isPublicView ? null : (user && (user.role_id === 3 || user.role_id === 4) && (
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              Upload Data
            </button>
          ))}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 1. Year vs Gender Distribution Trend */}
        <div className="student-strength-section" style={{ marginBottom: '3rem' }}>
          <h2>Year vs Gender Distribution (Trend)</h2>
          <div className="chart-section">
            <div className="chart-header">
              <p className="chart-description">Gender distribution trends over the last 5 years.</p>
            </div>

            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="clear-filters-btn" onClick={handleClearGenderTrendFilters}>
                  Clear All Filters
                </button>
              </div>

              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="gender-trend-program-filter">Program</label>
                  <select
                    id="gender-trend-program-filter"
                    value={genderTrendFilters.program || 'All'}
                    onChange={(e) => handleGenderTrendFilterChange('program', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.program.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="gender-trend-gender-filter">Gender</label>
                  <select
                    id="gender-trend-gender-filter"
                    value={selectedGender}
                    onChange={(e) => handleGenderSelection(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="gender-trend-batch-filter">Batch</label>
                  <select
                    id="gender-trend-batch-filter"
                    value={genderTrendFilters.batch || 'All'}
                    onChange={(e) => handleGenderTrendFilterChange('batch', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.batch.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="gender-trend-branch-filter">Branch</label>
                  <select
                    id="gender-trend-branch-filter"
                    value={genderTrendFilters.branch || 'All'}
                    onChange={(e) => handleGenderTrendFilterChange('branch', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.branch.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="gender-trend-department-filter">Department</label>
                  <select
                    id="gender-trend-department-filter"
                    value={genderTrendFilters.department || 'All'}
                    onChange={(e) => handleGenderTrendFilterChange('department', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.department.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="gender-trend-category-filter">Category</label>
                  <select
                    id="gender-trend-category-filter"
                    value={genderTrendFilters.category || 'All'}
                    onChange={(e) => handleGenderTrendFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.category.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="gender-trend-years-filter">No. of Years</label>
                  <select
                    id="gender-trend-years-filter"
                    value={trendYears}
                    onChange={(e) => handleTrendYearChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value={1}>Last 1 Year</option>
                    <option value={2}>Last 2 Years</option>
                    <option value={3}>Last 3 Years</option>
                    <option value={5}>Last 5 Years</option>
                    <option value={10}>Last 10 Years</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="gender-trend-pwd-filter">PWD</label>
                  <select
                    id="gender-trend-pwd-filter"
                    value={genderTrendFilters.pwd === true ? 'true' : genderTrendFilters.pwd === false ? 'false' : 'All'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleGenderTrendFilterChange('pwd', value === 'true' ? true : value === 'false' ? false : null);
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

            <div className={`bar-chart-container trend-chart ${hasTrendData ? '' : 'has-empty'}`}>
              <h3 className="chart-heading">Year vs Gender Distribution (Trend)</h3>

              <div className={`trend-empty-state ${hasTrendData ? 'hidden' : ''}`}>
                <p>No information available for the selected filter</p>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={displayGenderTrendData}
                  margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />

                  <XAxis
                    dataKey="year"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="#000"
                    tick={{ fill: '#000', fontSize: 14, fontWeight: 'bold' }}
                  />

                  <YAxis
                    domain={[0, 'dataMax + 5']}
                    allowDecimals={false}
                    stroke="#000"
                    tick={{ fill: '#000', fontSize: 14, fontWeight: 'bold' }}
                  />

                  <Tooltip />
                  <Legend />

                  {(selectedGender === 'All' || selectedGender === 'Male') && (
                    <Bar dataKey="Male" fill={COLORS[0]} {...BAR_ANIMATION} />
                  )}

                  {(selectedGender === 'All' || selectedGender === 'Female') && (
                    <Bar dataKey="Female" fill={COLORS[1]} {...BAR_ANIMATION} />
                  )}

                  {(selectedGender === 'All' || selectedGender === 'Transgender') && (
                    <Bar dataKey="Transgender" fill={COLORS[2]} {...BAR_ANIMATION} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. Gender Distribution Pie Chart */}
        <div className="student-strength-section" style={{ marginBottom: '3rem' }}>
          <h2>Gender Distribution (Pie Chart)</h2>
          
          <div className="chart-section">
            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Clear All Filters
                </button>
              </div>

              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="year-filter">Year of Admission</label>
                  <select
                    id="year-filter"
                    value={filters.yearofadmission === 'All' ? 'All' : filters.yearofadmission || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'All') {
                        handleFilterChange('yearofadmission', 'All');
                      } else if (value === '') {
                        handleFilterChange('yearofadmission', null);
                      } else {
                        handleFilterChange('yearofadmission', parseInt(value));
                      }
                    }}
                    className="filter-select"
                  >
                    <option value="">Select Year</option>
                    <option value="All">All</option>
                    {filterOptions.yearofadmission.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

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

            <div className={`chart-container pie-chart ${hasPieData ? '' : 'has-empty'}`}>
              <h3 className="chart-heading">Gender Distribution</h3>

              <div className={`trend-empty-state ${hasPieData ? 'hidden' : ''}`}>
                <p>No information available for the selected filter</p>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    isAnimationActive
                    animationDuration={700}
                    animationEasing="ease-out"
                    animationBegin={80}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {hasPieData && (
                <div className="chart-info">
                  <CustomLegend payload={chartData.map((item, index) => ({
                    value: item.name,
                    color: COLORS[index % COLORS.length]
                  }))} />
                  <div className="total-count">
                    <strong>Total Students: {total}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Student Strength by Program Trend */}
        <div className="student-strength-section" style={{ marginBottom: '3rem' }}>
          <h2>Student Strength by Program (Trend)</h2>
          <div className="chart-section">
            <div className="chart-header">
              <p className="chart-description">Student strength trends by program over the last 5 years.</p>
            </div>

            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="clear-filters-btn" onClick={handleClearProgramTrendFilters}>
                  Clear All Filters
                </button>
              </div>

              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="program-trend-category-filter">Category</label>
                  <select
                    id="program-trend-category-filter"
                    value={programTrendFilters.category || 'All'}
                    onChange={(e) => handleProgramTrendFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.category.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="program-trend-state-filter">State</label>
                  <select
                    id="program-trend-state-filter"
                    value={programTrendFilters.state || 'All'}
                    onChange={(e) => handleProgramTrendFilterChange('state', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.state.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={`bar-chart-container trend-chart ${hasProgramTrendData ? '' : 'has-empty'}`}>
              <h3 className="chart-heading">Student Strength by Program (Trend)</h3>

              <div className={`trend-empty-state ${hasProgramTrendData ? 'hidden' : ''}`}>
                <p>No information available for the selected filter</p>
              </div>

              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={programTrendData.slice(-5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" angle={-45} height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {programTrendPrograms.map((program, index) => (
                    <Bar
                      key={program}
                      dataKey={program}
                      stackId="a"
                      fill={TREND_COLORS[index % TREND_COLORS.length]}
                      {...BAR_ANIMATION}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4. Student Strength by Program */}
        <div className="student-strength-section">
          <h2>Student Strength by Program</h2>

          {strengthError && (
            <div className="error-message">
              {strengthError}
            </div>
          )}

          <div className="chart-section">
            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="clear-filters-btn" onClick={handleClearStrengthFilters}>
                  Clear All Filters
                </button>
              </div>

              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="strength-year-filter">Year of Admission</label>
                  <select
                    id="strength-year-filter"
                    value={strengthFilters.yearofadmission === 'All' ? 'All' : strengthFilters.yearofadmission || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'All') {
                        handleStrengthFilterChange('yearofadmission', 'All');
                      } else if (value === '') {
                        handleStrengthFilterChange('yearofadmission', null);
                      } else {
                        handleStrengthFilterChange('yearofadmission', parseInt(value));
                      }
                    }}
                    className="filter-select"
                  >
                    <option value="">Select Year</option>
                    <option value="All">All</option>
                    {filterOptions.yearofadmission.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="strength-category-filter">Category</label>
                  <select
                    id="strength-category-filter"
                    value={strengthFilters.category || 'All'}
                    onChange={(e) => handleStrengthFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.category.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="strength-state-filter">State</label>
                  <select
                    id="strength-state-filter"
                    value={strengthFilters.state || 'All'}
                    onChange={(e) => handleStrengthFilterChange('state', e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    {filterOptions.state.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={`bar-chart-container trend-chart ${hasStrengthData ? '' : 'has-empty'}`}>
              <h3 className="chart-heading">Student Strength by Program</h3>

              <div className={`trend-empty-state ${hasStrengthData ? 'hidden' : ''}`}>
                <p>No information available for the selected filter</p>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={studentStrengthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} />
                  <YAxis />
                  <Tooltip content={<StackedBarTooltip total={strengthTotal} />} />
                  <Legend />
                  <Bar dataKey="Male" stackId="a" fill="#667eea" {...BAR_ANIMATION} />
                  <Bar dataKey="Female" stackId="a" fill="#764ba2" {...BAR_ANIMATION} />
                  <Bar dataKey="Transgender" stackId="a" fill="#f093fb" {...BAR_ANIMATION} />
                </BarChart>
              </ResponsiveContainer>

              {hasStrengthData && (
                <div className="chart-info">
                  <strong>Total Students: {strengthTotal}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <DataUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tableName="student"
          token={token}
        />
      </div>
    </div>
  );
}

const StackedBarTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const programTotal = (data.Male || 0) + (data.Female || 0) + (data.Transgender || 0);
    const percentage = total > 0 ? ((programTotal / total) * 100).toFixed(1) : 0;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`${data.name}: ${programTotal}`}</p>
        <p className="tooltip-percentage">{percentage}% of total</p>
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #555' }}>
          <p style={{ color: '#667eea', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Male: {data.Male || 0}
          </p>
          <p style={{ color: '#764ba2', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Female: {data.Female || 0}
          </p>
          <p style={{ color: '#f093fb', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Transgender: {data.Transgender || 0}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default AcademicSection;