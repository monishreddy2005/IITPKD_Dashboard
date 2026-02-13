import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  fetchFilterOptions,
  fetchFacultyByDepartmentDesignation,
  fetchStaffCount,
  fetchGenderDistribution,
  fetchCategoryDistribution,
  fetchDepartmentBreakdown,
  fetchFacultyGenderLastFiveYears
} from '../services/administrativeStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];
const GENDER_COLORS = ['#667eea', '#764ba2', '#f093fb'];
const FACULTY_GENDER_COLORS = {
  Male: '#4f8ef7',
  Female: '#f5b400',
  Other: '#e85a4f',
  Transgender: '#5bbfad'
};

function AdministrativeSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('employee');
  const [filterOptions, setFilterOptions] = useState({
    department: [],
    designation: [],
    gender: [],
    category: [],
    cadre: [],
    category_type: []
  });

  const [filters, setFilters] = useState({
    department: null,
    designation: null,
    gender: null,
    category: null,
    isactive: true
  });

  const [employeeType, setEmployeeType] = useState('All'); // 'Faculty', 'Staff', or 'All'

  // Faculty by department/designation state
  const [facultyData, setFacultyData] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState(null);
  const [facultyTotal, setFacultyTotal] = useState(0);

  // Staff count state
  const [staffData, setStaffData] = useState({
    Technical: 0,
    Administrative: 0,
    Other: 0
  });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const [staffTotal, setStaffTotal] = useState(0);

  // Gender distribution state
  const [genderData, setGenderData] = useState({
    Male: 0,
    Female: 0,
    Other: 0
  });
  const [genderLoading, setGenderLoading] = useState(false);
  const [genderError, setGenderError] = useState(null);
  const [genderTotal, setGenderTotal] = useState(0);

  // Category distribution state
  const [categoryData, setCategoryData] = useState({});
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryTotal, setCategoryTotal] = useState(0);

  // Department breakdown state
  const [departmentData, setDepartmentData] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState(null);
  const [departmentTotal, setDepartmentTotal] = useState(0);

  // Faculty gender over last five years
  const [facultyGenderSeries, setFacultyGenderSeries] = useState([]);
  const [facultyGenderLoading, setFacultyGenderLoading] = useState(false);
  const [facultyGenderError, setFacultyGenderError] = useState(null);

  // UI state to control which chart block is visible
  const [activeChart, setActiveChart] = useState('facultyTrend'); // 'facultyTrend' | 'facultyDept' | 'staffCount' | 'genderDistribution' | 'categoryDistribution' | 'departmentBreakdown'

  // Get token from localStorage
  const token = localStorage.getItem('authToken');

  // Fetch filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) {
        setFacultyError('Authentication token not found. Please log in again.');
        return;
      }

      try {
        const options = await fetchFilterOptions(token);
        setFilterOptions(options);
      } catch (err) {
        console.error('Error loading filter options:', err);
        setFacultyError('Failed to load filter options. Please try again.');
      }
    };

    loadFilterOptions();
  }, [token]);

  // Fetch faculty data
  useEffect(() => {
    const loadFacultyData = async () => {
      if (!token) return;

      try {
        setFacultyLoading(true);
        setFacultyError(null);
        const result = await fetchFacultyByDepartmentDesignation(filters, employeeType, token);
        setFacultyData(result.data);
        setFacultyTotal(result.total);
      } catch (err) {
        console.error('Error loading faculty data:', err);
        setFacultyError('Failed to load faculty data. Please try again.');
      } finally {
        setFacultyLoading(false);
      }
    };

    loadFacultyData();
  }, [filters, employeeType, token]);

  // Fetch staff data
  useEffect(() => {
    const loadStaffData = async () => {
      if (!token) return;

      try {
        setStaffLoading(true);
        setStaffError(null);
        const result = await fetchStaffCount(filters, employeeType, token);
        setStaffData(result.data);
        setStaffTotal(result.total);
      } catch (err) {
        console.error('Error loading staff data:', err);
        setStaffError('Failed to load staff data. Please try again.');
      } finally {
        setStaffLoading(false);
      }
    };

    loadStaffData();
  }, [filters, employeeType, token]);

  // Fetch gender distribution
  useEffect(() => {
    const loadGenderData = async () => {
      if (!token) return;

      try {
        setGenderLoading(true);
        setGenderError(null);
        const result = await fetchGenderDistribution(filters, employeeType, token);
        setGenderData(result.data);
        setGenderTotal(result.total);
      } catch (err) {
        console.error('Error loading gender distribution:', err);
        setGenderError('Failed to load gender distribution. Please try again.');
      } finally {
        setGenderLoading(false);
      }
    };

    loadGenderData();
  }, [filters, employeeType, token]);

  // Fetch category distribution
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!token) return;

      try {
        setCategoryLoading(true);
        setCategoryError(null);
        const result = await fetchCategoryDistribution(filters, employeeType, token);
        setCategoryData(result.data);
        setCategoryTotal(result.total);
      } catch (err) {
        console.error('Error loading category distribution:', err);
        setCategoryError('Failed to load category distribution. Please try again.');
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategoryData();
  }, [filters, employeeType, token]);

  // Fetch department breakdown
  useEffect(() => {
    const loadDepartmentData = async () => {
      if (!token) return;

      try {
        setDepartmentLoading(true);
        setDepartmentError(null);
        const result = await fetchDepartmentBreakdown(filters, employeeType, token);
        setDepartmentData(result.data);
        setDepartmentTotal(result.total);
      } catch (err) {
        console.error('Error loading department breakdown:', err);
        setDepartmentError('Failed to load department breakdown. Please try again.');
      } finally {
        setDepartmentLoading(false);
      }
    };

    loadDepartmentData();
  }, [filters, employeeType, token]);

  // Fetch faculty gender trend (last five years)
  useEffect(() => {
    const loadFacultyGenderTrend = async () => {
      if (!token) return;
      try {
        setFacultyGenderLoading(true);
        setFacultyGenderError(null);
        const result = await fetchFacultyGenderLastFiveYears(token);
        setFacultyGenderSeries(result.data || []);
      } catch (err) {
        console.error('Error loading faculty gender trend:', err);
        setFacultyGenderError(err.message || 'Failed to load faculty gender trend.');
      } finally {
        setFacultyGenderLoading(false);
      }
    };

    loadFacultyGenderTrend();
  }, [token]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? null : value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: null,
      designation: null,
      gender: null,
      category: null,
      isactive: true
    });
    setEmployeeType('All');
  };

  // Prepare data for charts
  const facultyChartData = facultyData || [];

  const staffChartData = [
    { name: 'Technical', value: staffData.Technical || 0 },
    { name: 'Administrative', value: staffData.Administrative || 0 },
    { name: 'Other', value: staffData.Other || 0 }
  ].filter(item => item.value > 0);

  const genderChartData = [
    { name: 'Male', value: genderData.Male || 0 },
    { name: 'Female', value: genderData.Female || 0 },
    { name: 'Other', value: genderData.Other || 0 }
  ].filter(item => item.value > 0);

  const categoryChartData = Object.entries(categoryData || {}).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Custom Tooltip for Pie Chart
  const CustomTooltip = ({ active, payload, total }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${payload[0].name}: ${payload[0].value}`}</p>
          {total && (
            <p className="tooltip-percentage">
              {((payload[0].value / total) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Legend for Pie Chart
  // Custom Legend for Pie Chart
  const CustomLegend = ({ payload, data }) => {
    return (
      <div className="custom-legend" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
        {payload.map((entry, index) => (
          <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <span
              className="legend-color"
              style={{ backgroundColor: entry.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}
            ></span>
            <span className="legend-label" style={{ fontWeight: '600', color: '#495057', marginRight: '8px' }}>{entry.value}</span>
            <span className="legend-value" style={{ fontWeight: 'bold', color: '#212529' }}>{data[entry.value] || 0}</span>
          </div>
        ))}
      </div>
    );
  };

  // Get all unique designations for stacked bar chart
  const getAllDesignations = () => {
    const designations = new Set();
    facultyChartData.forEach(dept => {
      Object.keys(dept).forEach(key => {
        if (key !== 'name') {
          designations.add(key);
        }
      });
    });
    return Array.from(designations);
  };

  const designations = getAllDesignations();

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>Administrative Section - Faculty & Staff Demographics</h1>}

        {(facultyError || staffError || genderError || categoryError || departmentError) && (
          <div className="error-message">
            {facultyError || staffError || genderError || categoryError || departmentError}
          </div>
        )}

        {/* Chart selector tabs */}
        <div className="chart-tabs">
          <button
            type="button"
            className={`chart-tab ${activeChart === 'facultyTrend' ? 'active' : ''}`}
            onClick={() => setActiveChart('facultyTrend')}
          >
            Faculty Gender Trend
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'facultyDept' ? 'active' : ''}`}
            onClick={() => setActiveChart('facultyDept')}
          >
            Faculty by Department &amp; Designation
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'staffCount' ? 'active' : ''}`}
            onClick={() => setActiveChart('staffCount')}
          >
            Staff Count
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'genderDistribution' ? 'active' : ''}`}
            onClick={() => setActiveChart('genderDistribution')}
          >
            Gender Distribution
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'categoryDistribution' ? 'active' : ''}`}
            onClick={() => setActiveChart('categoryDistribution')}
          >
            Category Distribution
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'departmentBreakdown' ? 'active' : ''}`}
            onClick={() => setActiveChart('departmentBreakdown')}
          >
            Department Breakdown
          </button>
        </div>

        {/* Faculty Gender Trend (Last 5 Years) */}
        {activeChart === 'facultyTrend' && (
          <div className="chart-section">
          <div className="chart-header">
            <div>
              <h2>Faculty Gender Trend (Last 5 Years)</h2>
              <p className="chart-description">
                Stacked view of faculty counts by gender, based on employment history overlap with each year.
              </p>
            </div>
          </div>

          {facultyGenderLoading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading faculty gender trend...</p>
            </div>
          ) : facultyGenderError ? (
            <div className="error-message">{facultyGenderError}</div>
          ) : facultyGenderSeries.length === 0 ? (
            <div className="no-data">No faculty records available to display.</div>
          ) : (
            <div className="chart-container">
              <h3 className="chart-heading">Gender-wise Faculty Count</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={facultyGenderSeries} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="year_label"
                    angle={-12}
                    textAnchor="end"
                    height={70}
                    stroke="#000000"
                    tick={{ fill: '#000000', fontSize: 13, fontWeight: 'bold' }}
                    label={{ value: 'Year', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#000000', fontSize: 14, fontWeight: 'bold' } }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#000000"
                    tick={{ fill: '#000000', fontSize: 13, fontWeight: 'bold' }}
                    label={{ value: 'Faculty Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 14, fontWeight: 'bold' } }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="Male" stackId="gender" name="Male" fill={FACULTY_GENDER_COLORS.Male} />
                  <Bar dataKey="Female" stackId="gender" name="Female" fill={FACULTY_GENDER_COLORS.Female} />
                  <Bar dataKey="Other" stackId="gender" name="Other" fill={FACULTY_GENDER_COLORS.Other} />
                  <Bar dataKey="Transgender" stackId="gender" name="Transgender" fill={FACULTY_GENDER_COLORS.Transgender} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          </div>
        )}

        {/* Faculty by Department and Designation */}
        {activeChart === 'facultyDept' && (
          <div className="chart-section">
          {/* Filter Panel */}
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Filters</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Clear All Filters
                </button>
                {isPublicView ? null : (user && user.role_id === 3 && (
                  <>
                    <button
                      className="upload-data-btn"
                      onClick={() => { setActiveUploadTable('employee'); setIsUploadModalOpen(true); }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      Upload Employees
                    </button>
                    <button
                      className="upload-data-btn"
                      onClick={() => { setActiveUploadTable('employment_history'); setIsUploadModalOpen(true); }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      Upload Employment History
                    </button>
                  </>
                ))}
              </div>
            </div>

            <div className="filter-grid">
              {/* Employee Type */}
              <div className="filter-group">
                <label htmlFor="employee-type-filter">Employee Type</label>
                <select
                  id="employee-type-filter"
                  value={employeeType}
                  onChange={(e) => setEmployeeType(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
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

              {/* Designation */}
              <div className="filter-group">
                <label htmlFor="designation-filter">Designation</label>
                <select
                  id="designation-filter"
                  value={filters.designation || 'All'}
                  onChange={(e) => handleFilterChange('designation', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.designation.map(desig => (
                    <option key={desig} value={desig}>{desig}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="filter-group">
                <label htmlFor="gender-filter">Gender</label>
                <select
                  id="gender-filter"
                  value={filters.gender || 'All'}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.gender.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
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

              {/* Active Status */}
              <div className="filter-group">
                <label htmlFor="active-filter">Status</label>
                <select
                  id="active-filter"
                  value={filters.isactive === true ? 'true' : filters.isactive === false ? 'false' : 'All'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('isactive', value === 'true' ? true : value === 'false' ? false : null);
                  }}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          {facultyLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : (
            <>
              {facultyTotal > 0 ? (
                <>
<div className="bar-chart-container">
                    <h3 className="chart-heading">Faculty Count by Department and Designation</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#000000' }}>Department</span>
                      </div>
                      <ResponsiveContainer width="100%" height={450}>
                        <BarChart data={facultyChartData} margin={{ top: 20, right: 30, left: 60, bottom: 120 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={110}
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 13, fontWeight: 'bold' }}
                            interval={0}
                          />
                          <YAxis
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                            label={{ value: 'Number of Faculty', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                          />
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                          />
                          {designations.map((desig, index) => (
                            <Bar
                              key={desig}
                              dataKey={desig}
                              stackId="a"
                              fill={COLORS[index % COLORS.length]}
                              radius={index === designations.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '10px', padding: '0 20px' }}>
                        {designations.map((desig, index) => (
                          <div key={desig} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                            <span
                              style={{ backgroundColor: COLORS[index % COLORS.length], width: '16px', height: '16px', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }}
                            ></span>
                            <span style={{ fontWeight: '600', color: '#212529', fontSize: '14px' }}>{desig}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="chart-info">
                    <div className="total-count">
                      <strong>Total Faculty: {facultyTotal}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-data">
                  <p>No faculty data available for the selected filters.</p>
                </div>
              )}
            </>
          )}
          </div>
        )}

        {/* Staff Count */}
        {activeChart === 'staffCount' && (
          <div className="student-strength-section">
          <h2>Staff Count (Technical and Administrative)</h2>

          {staffError && (
            <div className="error-message">
              {staffError}
            </div>
          )}

          <div className="chart-section">
            {staffLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <>
                {staffTotal > 0 ? (
                  <>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={staffChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {staffChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip total={staffTotal} />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-info">
                      <CustomLegend payload={staffChartData.map((item, index) => ({
                        value: item.name,
                        color: COLORS[index % COLORS.length]
                      }))} data={staffData} />
                      <div className="total-count">
                        <strong>Total Staff: {staffTotal}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data">
                    <p>No staff data available for the selected filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        )}

        {/* Gender Distribution */}
        {activeChart === 'genderDistribution' && (
          <div className="student-strength-section">
          <h2>Gender Distribution</h2>

          {genderError && (
            <div className="error-message">
              {genderError}
            </div>
          )}

          <div className="chart-section">
            {genderLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <>
                {genderTotal > 0 ? (
                  <>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={genderChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {genderChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip total={genderTotal} />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-info">
                      <CustomLegend payload={genderChartData.map((item, index) => ({
                        value: item.name,
                        color: GENDER_COLORS[index % GENDER_COLORS.length]
                      }))} data={genderData} />
                      <div className="total-count">
                        <strong>Total Employees: {genderTotal}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data">
                    <p>No gender data available for the selected filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        )}

        {/* Category Distribution */}
        {activeChart === 'categoryDistribution' && (
          <div className="student-strength-section">
          <h2>Category Distribution</h2>

          {categoryError && (
            <div className="error-message">
              {categoryError}
            </div>
          )}

          <div className="chart-section">
            {categoryLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <>
                {categoryTotal > 0 ? (
                  <>
                    <div className="bar-chart-container">
                      <h3 className="chart-heading">Category Distribution</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={categoryChartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                            label={{ value: 'Category', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                          />
                          <YAxis
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                            label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                          />
                          <Tooltip
                            content={<CustomTooltip total={categoryTotal} />}
                            cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                          />
                          <Bar
                            dataKey="value"
                            fill="#667eea"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-info">
                      <div className="total-count">
                        <strong>Total Employees: {categoryTotal}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data">
                    <p>No category data available for the selected filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        )}

        {/* Department Breakdown */}
        {activeChart === 'departmentBreakdown' && (
          <div className="student-strength-section">
          <h2>Department Breakdown (Faculty & Staff by Gender)</h2>

          {departmentError && (
            <div className="error-message">
              {departmentError}
            </div>
          )}

          <div className="chart-section">
            {departmentLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <>
                {departmentTotal > 0 ? (
                  <>
                    <div className="bar-chart-container">
  <h3 className="chart-heading">Department Breakdown</h3>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
      <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#000000' }}>Department</span>
    </div>
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 60, bottom: 120 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={110}
          stroke="#000000"
          tick={{ fill: '#000000', fontSize: 13, fontWeight: 'bold' }}
          interval={0}
        />
        <YAxis
          stroke="#000000"
          tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
          label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
        />
        <Tooltip
          content={<CustomTooltip total={departmentTotal} />}
          cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
        />
        <Bar dataKey="Faculty_Male" stackId="faculty" fill="#667eea" name="Faculty Male" />
        <Bar dataKey="Faculty_Female" stackId="faculty" fill="#764ba2" name="Faculty Female" />
        <Bar dataKey="Faculty_Other" stackId="faculty" fill="#f093fb" name="Faculty Other" />
        <Bar dataKey="Staff_Male" stackId="staff" fill="#4facfe" name="Staff Male" />
        <Bar dataKey="Staff_Female" stackId="staff" fill="#00f2fe" name="Staff Female" />
        <Bar dataKey="Staff_Other" stackId="staff" fill="#43e97b" radius={[0, 0, 8, 8]} name="Staff Other" />
      </BarChart>
    </ResponsiveContainer>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '10px', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <span style={{ backgroundColor: '#667eea', width: '16px', height: '16px', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }}></span>
        <span style={{ fontWeight: '600', color: '#212529', fontSize: '14px' }}>Faculty Male</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <span style={{ backgroundColor: '#764ba2', width: '16px', height: '16px', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }}></span>
        <span style={{ fontWeight: '600', color: '#212529', fontSize: '14px' }}>Faculty Female</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <span style={{ backgroundColor: '#f093fb', width: '16px', height: '16px', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }}></span>
        <span style={{ fontWeight: '600', color: '#212529', fontSize: '14px' }}>Faculty Other</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <span style={{ backgroundColor: '#4facfe', width: '16px', height: '16px', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }}></span>
        <span style={{ fontWeight: '600', color: '#212529', fontSize: '14px' }}>Staff Male</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <span style={{ backgroundColor: '#00f2fe', width: '16px', height: '16px', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }}></span>
        <span style={{ fontWeight: '600', color: '#212529', fontSize: '14px' }}>Staff Female</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <span style={{ backgroundColor: '#43e97b', width: '16px', height: '16px', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }}></span>
        <span style={{ fontWeight: '600', color: '#212529', fontSize: '14px' }}>Staff Other</span>
      </div>
    </div>
  </div>
</div>
                    <div className="chart-info">
                      <div className="total-count">
                        <strong>Total Employees: {departmentTotal}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data">
                    <p>No department breakdown data available for the selected filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        )}

        {/* Upload Modal */}
        <DataUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tableName={activeUploadTable}
          token={token}
        />
      </div>
    </div>
  );
}

export default AdministrativeSection;

