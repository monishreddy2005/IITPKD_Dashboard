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
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p className="tooltip-label" style={{ margin: '0', fontWeight: 'bold' }}>{`${payload[0].name}: ${payload[0].value}`}</p>
          {total && (
            <p className="tooltip-percentage" style={{ margin: '0', color: '#666' }}>
              {((payload[0].value / total) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

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

  // Filter Panel Component
  const FilterPanel = () => (
    <div className="filter-panel" style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
      <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: '0', color: '#333' }}>Filters</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="clear-filters-btn" 
            onClick={handleClearFilters}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear All Filters
          </button>
          {!isPublicView && user && user.role_id === 3 && (
            <>
              <button
                className="upload-data-btn"
                onClick={() => { setActiveUploadTable('employee'); setIsUploadModalOpen(true); }}
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Upload Employees
              </button>
              <button
                className="upload-data-btn"
                onClick={() => { setActiveUploadTable('employment_history'); setIsUploadModalOpen(true); }}
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Upload Employment History
              </button>
            </>
          )}
        </div>
      </div>

      <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {/* Employee Type */}
        <div className="filter-group">
          <label htmlFor="employee-type-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Employee Type</label>
          <select
            id="employee-type-filter"
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
            className="filter-select"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            <option value="All">All Employees</option>
            <option value="Faculty">Faculty Only</option>
            <option value="Staff">Staff Only</option>
          </select>
        </div>

        {/* Department */}
        <div className="filter-group">
          <label htmlFor="department-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Department</label>
          <select
            id="department-filter"
            value={filters.department || 'All'}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="filter-select"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            <option value="All">All Departments</option>
            {filterOptions.department.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Designation */}
        <div className="filter-group">
          <label htmlFor="designation-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Designation</label>
          <select
            id="designation-filter"
            value={filters.designation || 'All'}
            onChange={(e) => handleFilterChange('designation', e.target.value)}
            className="filter-select"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            <option value="All">All Designations</option>
            {filterOptions.designation.map(desig => (
              <option key={desig} value={desig}>{desig}</option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="filter-group">
          <label htmlFor="gender-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Gender</label>
          <select
            id="gender-filter"
            value={filters.gender || 'All'}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="filter-select"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            <option value="All">All Genders</option>
            {filterOptions.gender.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="filter-group">
          <label htmlFor="category-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Category</label>
          <select
            id="category-filter"
            value={filters.category || 'All'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            <option value="All">All Categories</option>
            {filterOptions.category.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Active Status */}
        <div className="filter-group">
          <label htmlFor="active-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Employment Status</label>
          <select
            id="active-filter"
            value={filters.isactive === true ? 'true' : filters.isactive === false ? 'false' : 'All'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('isactive', value === 'true' ? true : value === 'false' ? false : null);
            }}
            className="filter-select"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            <option value="All">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>
      
      {/* Active Filters Summary */}
      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <strong>Active Filters:</strong>{' '}
        {employeeType !== 'All' && <span style={{ marginRight: '10px' }}>Type: {employeeType}</span>}
        {filters.department && <span style={{ marginRight: '10px' }}>Dept: {filters.department}</span>}
        {filters.designation && <span style={{ marginRight: '10px' }}>Designation: {filters.designation}</span>}
        {filters.gender && <span style={{ marginRight: '10px' }}>Gender: {filters.gender}</span>}
        {filters.category && <span style={{ marginRight: '10px' }}>Category: {filters.category}</span>}
        {filters.isactive !== null && <span style={{ marginRight: '10px' }}>Status: {filters.isactive ? 'Active' : 'Inactive'}</span>}
        {employeeType === 'All' && !filters.department && !filters.designation && !filters.gender && !filters.category && filters.isactive === true && 
          <span>No filters applied (showing all active employees)</span>
        }
      </div>
    </div>
  );

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>Administrative Section - Faculty & Staff Demographics</h1>}

        {/* Global Error Messages */}
        {(facultyError || staffError || genderError || categoryError || departmentError) && (
          <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
            {facultyError || staffError || genderError || categoryError || departmentError}
          </div>
        )}

        {/* Global Filter Panel - Now applied to ALL charts except Faculty Gender Trend */}
        <FilterPanel />

        {/* Chart selector tabs */}
        <div className="chart-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #dee2e6', paddingBottom: '10px' }}>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'facultyTrend' ? 'active' : ''}`}
            onClick={() => setActiveChart('facultyTrend')}
            style={{ padding: '10px 20px', backgroundColor: activeChart === 'facultyTrend' ? '#667eea' : '#f8f9fa', color: activeChart === 'facultyTrend' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Faculty Gender Trend
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'facultyDept' ? 'active' : ''}`}
            onClick={() => setActiveChart('facultyDept')}
            style={{ padding: '10px 20px', backgroundColor: activeChart === 'facultyDept' ? '#667eea' : '#f8f9fa', color: activeChart === 'facultyDept' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Faculty by Department & Designation
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'staffCount' ? 'active' : ''}`}
            onClick={() => setActiveChart('staffCount')}
            style={{ padding: '10px 20px', backgroundColor: activeChart === 'staffCount' ? '#667eea' : '#f8f9fa', color: activeChart === 'staffCount' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Staff Count
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'genderDistribution' ? 'active' : ''}`}
            onClick={() => setActiveChart('genderDistribution')}
            style={{ padding: '10px 20px', backgroundColor: activeChart === 'genderDistribution' ? '#667eea' : '#f8f9fa', color: activeChart === 'genderDistribution' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Gender Distribution
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'categoryDistribution' ? 'active' : ''}`}
            onClick={() => setActiveChart('categoryDistribution')}
            style={{ padding: '10px 20px', backgroundColor: activeChart === 'categoryDistribution' ? '#667eea' : '#f8f9fa', color: activeChart === 'categoryDistribution' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Category Distribution
          </button>
          <button
            type="button"
            className={`chart-tab ${activeChart === 'departmentBreakdown' ? 'active' : ''}`}
            onClick={() => setActiveChart('departmentBreakdown')}
            style={{ padding: '10px 20px', backgroundColor: activeChart === 'departmentBreakdown' ? '#667eea' : '#f8f9fa', color: activeChart === 'departmentBreakdown' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Department Breakdown
          </button>
        </div>

        {/* Faculty Gender Trend (Last 5 Years) - This chart doesn't use filters */}
        {activeChart === 'facultyTrend' && (
          <div className="chart-section">
            <div className="chart-header">
              <div>
                <h2>Faculty Gender Trend (Last 5 Years)</h2>
                <p className="chart-description" style={{ color: '#666', marginBottom: '20px' }}>
                  Stacked view of faculty counts by gender, based on employment history overlap with each year.
                </p>
              </div>
            </div>

            {facultyGenderLoading ? (
              <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="loading-spinner" />
                <p>Loading faculty gender trend...</p>
              </div>
            ) : facultyGenderError ? (
              <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{facultyGenderError}</div>
            ) : facultyGenderSeries.length === 0 ? (
              <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>No faculty records available to display.</div>
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
                    <Tooltip content={<CustomTooltip />} />
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
            {facultyLoading ? (
              <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <>
                {facultyTotal > 0 ? (
                  <>
                    <div className="bar-chart-container">
                      <h3 className="chart-heading">Faculty Count by Department and Designation</h3>
                      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                        Showing data for {employeeType === 'All' ? 'all employees' : employeeType.toLowerCase()} 
                        {filters.department && ` in ${filters.department} department`}
                        {filters.designation && ` with ${filters.designation} designation`}
                        {filters.gender && ` (${filters.gender})`}
                        {filters.category && ` from ${filters.category} category`}
                        {filters.isactive !== null && ` - ${filters.isactive ? 'Active' : 'Inactive'} only`}
                      </p>
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
                              content={<CustomTooltip total={facultyTotal} />}
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
                      <div className="total-count" style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px' }}>
                        <strong>Total Faculty: {facultyTotal}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
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
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Showing data for {employeeType === 'All' ? 'all employees' : employeeType.toLowerCase()} 
              {filters.department && ` in ${filters.department} department`}
              {filters.designation && ` with ${filters.designation} designation`}
              {filters.gender && ` (${filters.gender})`}
              {filters.category && ` from ${filters.category} category`}
              {filters.isactive !== null && ` - ${filters.isactive ? 'Active' : 'Inactive'} only`}
            </p>

            {staffError && (
              <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
                {staffError}
              </div>
            )}

            <div className="chart-section">
              {staffLoading ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
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
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
                        <div className="total-count" style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px' }}>
                          <strong>Total Staff: {staffTotal}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
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
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Showing gender distribution for {employeeType === 'All' ? 'all employees' : employeeType.toLowerCase()} 
              {filters.department && ` in ${filters.department} department`}
              {filters.designation && ` with ${filters.designation} designation`}
              {filters.category && ` from ${filters.category} category`}
              {filters.isactive !== null && ` - ${filters.isactive ? 'Active' : 'Inactive'} only`}
            </p>

            {genderError && (
              <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
                {genderError}
              </div>
            )}

            <div className="chart-section">
              {genderLoading ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
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
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
                        <div className="total-count" style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px' }}>
                          <strong>Total Employees: {genderTotal}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
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
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Showing category distribution for {employeeType === 'All' ? 'all employees' : employeeType.toLowerCase()} 
              {filters.department && ` in ${filters.department} department`}
              {filters.designation && ` with ${filters.designation} designation`}
              {filters.gender && ` (${filters.gender})`}
              {filters.isactive !== null && ` - ${filters.isactive ? 'Active' : 'Inactive'} only`}
            </p>

            {categoryError && (
              <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
                {categoryError}
              </div>
            )}

            <div className="chart-section">
              {categoryLoading ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
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
                              label={{ position: 'top', fill: '#000000', fontSize: 12 }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="chart-info">
                        <div className="total-count" style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px' }}>
                          <strong>Total Employees: {categoryTotal}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
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
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Showing department-wise breakdown for {employeeType === 'All' ? 'all employees' : employeeType.toLowerCase()} 
              {filters.designation && ` with ${filters.designation} designation`}
              {filters.gender && ` (${filters.gender})`}
              {filters.category && ` from ${filters.category} category`}
              {filters.isactive !== null && ` - ${filters.isactive ? 'Active' : 'Inactive'} only`}
            </p>

            {departmentError && (
              <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
                {departmentError}
              </div>
            )}

            <div className="chart-section">
              {departmentLoading ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
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
                        <div className="total-count" style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px' }}>
                          <strong>Total Employees: {departmentTotal}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
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