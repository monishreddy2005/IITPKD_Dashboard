import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

import {
  fetchFilterOptions,
  fetchSummary,
  fetchIndustryCourseTrend,
  fetchIndustryCourses,
  fetchProgramLaunchStats,
  fetchProgramList
} from '../services/academicModuleStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import DataUploadModal from './DataUploadModal';

const PROGRAM_COLORS = ['#6366f1', '#22d3ee', '#f97316', '#a855f7', '#14b8a6', '#f59e0b'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function EducationAcademicSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    course_years: [],
    program_types: [],
    program_years: []
  });

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('courseTrend'); // 'courseTrend' | 'programLaunch' | 'courseCatalogue' | 'programCatalogue'

  const [filters, setFilters] = useState({
    department: 'All',
    course_year: 'All',
    program_type: 'All',
    program_year: 'All'
  });

  const [summary, setSummary] = useState({
    total_courses: 0,
    distinct_departments: 0,
    total_programs: 0,
    distinct_program_types: 0,
    total_oelp_students: 0
  });
  const [courseTrend, setCourseTrend] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [programStats, setProgramStats] = useState([]);
  const [programList, setProgramList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      try {
        const options = await fetchFilterOptions(token);
        setFilterOptions({
          departments: Array.isArray(options?.departments) ? options.departments : [],
          course_years: Array.isArray(options?.course_years) ? options.course_years : [],
          program_types: Array.isArray(options?.program_types) ? options.program_types : [],
          program_years: Array.isArray(options?.program_years) ? options.program_years : []
        });
      } catch (err) {
        console.error('Failed to load academic module filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const [summaryResp, trendResp, courseResp, programStatsResp, programListResp] = await Promise.all([
          fetchSummary(filters, token),
          fetchIndustryCourseTrend(filters, token),
          fetchIndustryCourses(filters, token),
          fetchProgramLaunchStats(filters, token),
          fetchProgramList(filters, token)
        ]);

        setSummary(summaryResp?.data || summary);
        setCourseTrend(trendResp?.data || []);
        setCourseList(courseResp?.data || []);
        setProgramStats(programStatsResp?.data || []);
        setProgramList(programListResp?.data || []);
      } catch (err) {
        console.error('Failed to load academic module data:', err);
        setError(err.message || 'Failed to load academic analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const courseTrendChartData = useMemo(() => {
    if (!courseTrend.length) return [];
    return courseTrend.map((row) => ({
      year: row.year,
      course_count: row.course_count || 0
    }));
  }, [courseTrend]);

  const programStatsChartData = useMemo(() => {
    if (!programStats.length) return [];
    return programStats.map((row) => {
      const entry = { year: row.year, total: row.total || 0 };
      filterOptions.program_types.forEach((type, idx) => {
        entry[type] = row[type] || 0;
      });
      return entry;
    });
  }, [programStats, filterOptions.program_types]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      course_year: 'All',
      program_type: 'All',
      program_year: 'All'
    });
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '0', color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>Academic Section · Industry Collaboration & Program Launches</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Review how departments collaborate with industry to offer specialised courses and track the launch of new
          academic programmes across IIT Palakkad.
        </p>

        {error && <div className="error-message" style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading academic insights...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="summary-cards" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              <div className="summary-card" style={{ 
                padding: '20px', 
                backgroundColor: '#6366f1', 
                color: 'white', 
                borderRadius: '10px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
              }}>
                <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
                  Industry-linked Courses
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.total_courses)}
                </div>
              </div>
              <div className="summary-card" style={{ 
                padding: '20px', 
                backgroundColor: '#22d3ee', 
                color: 'white', 
                borderRadius: '10px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(34, 211, 238, 0.2)'
              }}>
                <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
                  Departments Involved
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.distinct_departments)}
                </div>
              </div>
              <div className="summary-card" style={{ 
                padding: '20px', 
                backgroundColor: '#f97316', 
                color: 'white', 
                borderRadius: '10px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)'
              }}>
                <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
                  Programmes Launched
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.total_programs)}
                </div>
              </div>
              <div className="summary-card" style={{ 
                padding: '20px', 
                backgroundColor: '#a855f7', 
                color: 'white', 
                borderRadius: '10px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(168, 85, 247, 0.2)'
              }}>
                <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
                  Programme Types
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.distinct_program_types)}
                </div>
              </div>
              <div className="summary-card" style={{ 
                padding: '20px', 
                backgroundColor: '#14b8a6', 
                color: 'white', 
                borderRadius: '10px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(20, 184, 166, 0.2)'
              }}>
                <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
                  OELP Students
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.total_oelp_students)}
                </div>
              </div>
            </div>

            {/* Filter Panel with Radio Buttons for View Selection */}
            <div className="filter-panel" style={{ 
              marginBottom: '20px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px', 
              border: '1px solid #e9ecef' 
            }}>
              <div className="filter-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '15px' 
              }}>
                <h3 style={{ margin: '0', color: '#333' }}>Filters & Visualization Options</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    className="clear-filters-btn" 
                    onClick={handleClearFilters}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#dc3545', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Clear Filters
                  </button>
                  {!isPublicView && user && user.role_id === 3 && (
                    <>
                      <button
                        className="upload-data-btn"
                        onClick={() => { setActiveUploadTable('industry_courses'); setIsUploadModalOpen(true); }}
                        style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#28a745', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Upload Courses
                      </button>
                      <button
                        className="upload-data-btn"
                        onClick={() => { setActiveUploadTable('academic_program_launch'); setIsUploadModalOpen(true); }}
                        style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#28a745', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Upload Programs
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* View Type Selection - Radio Buttons */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '6px',
                border: '1px solid #dee2e6'
              }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Select View Type:
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'courseTrend' ? '#6366f1' : 'white',
                    color: viewType === 'courseTrend' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'courseTrend' ? '2px solid #6366f1' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="courseTrend"
                      checked={viewType === 'courseTrend'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#6366f1',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'courseTrend' ? 'bold' : 'normal' }}>
                      📈 Course Trend
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'programLaunch' ? '#f97316' : 'white',
                    color: viewType === 'programLaunch' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'programLaunch' ? '2px solid #f97316' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="programLaunch"
                      checked={viewType === 'programLaunch'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#f97316',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'programLaunch' ? 'bold' : 'normal' }}>
                      🎓 Program Launch
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'courseCatalogue' ? '#22d3ee' : 'white',
                    color: viewType === 'courseCatalogue' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'courseCatalogue' ? '2px solid #22d3ee' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="courseCatalogue"
                      checked={viewType === 'courseCatalogue'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#22d3ee',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'courseCatalogue' ? 'bold' : 'normal' }}>
                      📚 Course Catalogue
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'programCatalogue' ? '#14b8a6' : 'white',
                    color: viewType === 'programCatalogue' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'programCatalogue' ? '2px solid #14b8a6' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="programCatalogue"
                      checked={viewType === 'programCatalogue'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#14b8a6',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'programCatalogue' ? 'bold' : 'normal' }}>
                      📋 Program Catalogue
                    </span>
                  </label>
                </div>
              </div>

              <div className="filter-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Department
                  </label>
                  <select
                    className="filter-select"
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Departments</option>
                    {filterOptions.departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Course Year
                  </label>
                  <select
                    className="filter-select"
                    value={filters.course_year}
                    onChange={(e) => handleFilterChange('course_year', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Years</option>
                    {filterOptions.course_years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Program Type
                  </label>
                  <select
                    className="filter-select"
                    value={filters.program_type}
                    onChange={(e) => handleFilterChange('program_type', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Types</option>
                    {filterOptions.program_types.map((ptype) => (
                      <option key={ptype} value={ptype}>{ptype}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Program Launch Year
                  </label>
                  <select
                    className="filter-select"
                    value={filters.program_year}
                    onChange={(e) => handleFilterChange('program_year', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Years</option>
                    {filterOptions.program_years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Summary */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <strong>Active Filters:</strong>{' '}
                {filters.department !== 'All' && <span style={{ marginRight: '10px' }}>🏢 Dept: {filters.department}</span>}
                {filters.course_year !== 'All' && <span style={{ marginRight: '10px' }}>📅 Course Year: {filters.course_year}</span>}
                {filters.program_type !== 'All' && <span style={{ marginRight: '10px' }}>🎓 Program Type: {filters.program_type}</span>}
                {filters.program_year !== 'All' && <span style={{ marginRight: '10px' }}>📅 Launch Year: {filters.program_year}</span>}
                {filters.department === 'All' && filters.course_year === 'All' && filters.program_type === 'All' && filters.program_year === 'All' && 
                  <span>No filters applied (showing all data)</span>
                }
              </div>
            </div>

            {/* Single View Section based on radio selection */}
            <div className="chart-section" style={{ 
              marginBottom: '30px', 
              padding: '20px', 
              backgroundColor: '#fff', 
              borderRadius: '10px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              {/* Course Trend Chart */}
              {viewType === 'courseTrend' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📈</span> Industry-linked Courses · Yearly Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Track how many courses were offered with industry collaboration across academic years.
                    </p>
                  </div>

                  {!courseTrendChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No industry course data available for the selected filters.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={courseTrendChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis 
                            dataKey="year" 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{ 
                              value: 'Year', 
                              position: 'insideBottom', 
                              offset: -10,
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{ 
                              value: 'Number of Courses', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="plainline" />
                          <Line 
                            type="monotone" 
                            dataKey="course_count" 
                            name="Industry Courses" 
                            stroke="#6366f1" 
                            strokeWidth={3} 
                            dot={{ r: 6, fill: '#6366f1' }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>

                      {/* Chart Statistics */}
                      <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '15px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseTrendChartData.reduce((sum, item) => sum + item.course_count, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Courses</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseTrendChartData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseTrendChartData.length > 0 
                              ? Math.max(...courseTrendChartData.map(item => item.course_count)) 
                              : 0}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Peak Year Count</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Program Launch Chart */}
              {viewType === 'programLaunch' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🎓</span> New Academic Programmes Introduced
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Visualise programme launches by year and type to understand growth in offerings.
                    </p>
                  </div>

                  {!programStatsChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No programme launch data available for the selected filters.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={programStatsChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis 
                            dataKey="year" 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{ 
                              value: 'Year', 
                              position: 'insideBottom', 
                              offset: -10,
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{ 
                              value: 'Number of Programmes', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                          {filterOptions.program_types.map((ptype, idx) => (
                            <Bar 
                              key={ptype} 
                              dataKey={ptype} 
                              name={ptype} 
                              stackId="a" 
                              fill={PROGRAM_COLORS[idx % PROGRAM_COLORS.length]} 
                              radius={idx === filterOptions.program_types.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                            />
                          ))}
                          <Bar 
                            dataKey="total" 
                            name="Total" 
                            fill="#22c55e" 
                            radius={[6, 6, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Chart Statistics */}
                      <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '15px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                            {programStatsChartData.reduce((sum, item) => sum + item.total, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Programmes</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {programStatsChartData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Years Active</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '24px' }}>
                            {filterOptions.program_types.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Program Types</div>
                        </div>
                      </div>

                      {/* Type Summary Cards */}
                      <div style={{ 
                        marginTop: '15px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '10px'
                      }}>
                        {filterOptions.program_types.map((ptype, index) => {
                          const total = programStatsChartData.reduce((sum, item) => sum + (item[ptype] || 0), 0);
                          return (
                            <div key={ptype} style={{
                              padding: '10px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '6px',
                              border: `1px solid ${PROGRAM_COLORS[index % PROGRAM_COLORS.length]}`,
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '12px', color: '#666' }}>{ptype}</div>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: PROGRAM_COLORS[index % PROGRAM_COLORS.length] }}>
                                {formatNumber(total)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Course Catalogue Table */}
              {viewType === 'courseCatalogue' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📚</span> Industry Collaboration Course Catalogue
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Detailed view of active industry-partnered courses across departments and years.
                    </p>
                  </div>

                  {!courseList.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No industry courses found for the selected filters.
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                      <table className="grievance-table" style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#22d3ee', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Year</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Course Title</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Industry Partner</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseList.map((course, index) => (
                            <tr 
                              key={course.course_id}
                              style={{ 
                                backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                                borderBottom: '1px solid #e0e0e0'
                              }}
                            >
                              <td style={{ padding: '12px', fontWeight: '500' }}>{course.year_offered}</td>
                              <td style={{ padding: '12px' }}>{course.course_title}</td>
                              <td style={{ padding: '12px' }}>{course.department}</td>
                              <td style={{ padding: '12px' }}>{course.industry_partner || '—'}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ 
                                  backgroundColor: course.is_active ? '#dcfce7' : '#fee2e2',
                                  color: course.is_active ? '#166534' : '#991b1b',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {course.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Table Statistics */}
                  {courseList.length > 0 && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '15px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '15px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '24px' }}>
                          {courseList.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Courses</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                          {new Set(courseList.map(c => c.department)).size}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Departments</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {courseList.filter(c => c.is_active).length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Active Courses</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Program Catalogue Table */}
              {viewType === 'programCatalogue' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📋</span> Academic Programme Launches
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Catalogue of newly introduced programmes with launch year, type, and OELP details.
                    </p>
                  </div>

                  {!programList.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No programme launch records found for the selected filters.
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                      <table className="grievance-table" style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#14b8a6', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Launch Year</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Programme</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>OELP Students</th>
                          </tr>
                        </thead>
                        <tbody>
                          {programList.map((program, index) => (
                            <tr 
                              key={program.program_code}
                              style={{ 
                                backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                                borderBottom: '1px solid #e0e0e0'
                              }}
                            >
                              <td style={{ padding: '12px', fontWeight: '500' }}>{program.launch_year}</td>
                              <td style={{ padding: '12px' }}>{program.program_name}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ 
                                  backgroundColor: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {program.program_type}
                                </span>
                              </td>
                              <td style={{ padding: '12px' }}>{program.department || '—'}</td>
                              <td style={{ padding: '12px', fontWeight: '500', color: '#14b8a6' }}>
                                {formatNumber(program.oelp_students)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Table Statistics */}
                  {programList.length > 0 && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '15px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '15px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#14b8a6', fontWeight: 'bold', fontSize: '24px' }}>
                          {programList.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Programmes</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                          {new Set(programList.map(p => p.program_type)).size}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Program Types</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {programList.reduce((sum, p) => sum + (p.oelp_students || 0), 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total OELP Students</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName={activeUploadTable}
        token={token}
      />
    </div>
  );
}

export default EducationAcademicSection;