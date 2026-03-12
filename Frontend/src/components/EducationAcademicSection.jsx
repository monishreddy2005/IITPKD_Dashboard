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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  fetchFilterOptions,
  fetchSummary,
  fetchCategoryBreakdown,
  fetchProgrammeBreakdown,
  fetchCourses
} from '../services/academicModuleStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import DataUploadModal from './DataUploadModal';

const CATEGORY_COLORS = ['#6366f1', '#ec4899', '#f97316', '#14b8a6', '#facc15'];
const PROGRAM_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#84cc16', '#0ea5e9'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function EducationAcademicSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    programmes: [],
    statuses: [],
    proposal_types: [],
    disciplines: []
  });

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('categoryBreakdown'); // 'categoryBreakdown' | 'programmeBreakdown' | 'courseCatalogue'

  const [filters, setFilters] = useState({
    category: 'All',
    programme: 'All',
    status: 'All',
    proposal_type: 'All'
  });

  const [summary, setSummary] = useState({
    total_courses: 0,
    distinct_categories: 0,
    distinct_programmes: 0,
    distinct_disciplines: 0,
    active_courses: 0,
    inactive_courses: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [programmeData, setProgrammeData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  
  // Pagination and search for course catalogue
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, total_pages: 0 });

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
          categories: Array.isArray(options?.categories) ? options.categories : [],
          programmes: Array.isArray(options?.programmes) ? options.programmes : [],
          statuses: Array.isArray(options?.statuses) ? options.statuses : [],
          proposal_types: Array.isArray(options?.proposal_types) ? options.proposal_types : [],
          disciplines: Array.isArray(options?.disciplines) ? options.disciplines : []
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

        const [summaryResp, categoryResp, programmeResp, courseResp] = await Promise.all([
          fetchSummary(filters, token),
          fetchCategoryBreakdown(filters, token),
          fetchProgrammeBreakdown(filters, token),
          fetchCourses(filters, search, page, 20, token)
        ]);

        setSummary(summaryResp?.data || summary);
        setCategoryData(categoryResp?.data || []);
        setProgrammeData(programmeResp?.data || []);
        setCourseList(courseResp?.data || []);
        if (courseResp?.pagination) {
          setPagination(courseResp.pagination);
        }
      } catch (err) {
        console.error('Failed to load academic module data:', err);
        setError(err.message || 'Failed to load academic analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, search, page, token]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
    setPage(1); // Reset page on filter change
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'All',
      programme: 'All',
      status: 'All',
      proposal_type: 'All'
    });
    setSearch('');
    setPage(1);
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

        <div style={{ position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              <div className="loading-spinner" />
              <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#555' }}>Updating data...</p>
            </div>
          )}

          {/* Main content starts here, always mounted */}
          <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
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
                  Total Courses
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
                  Active Courses
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.active_courses)}
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
                  Categories
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.distinct_categories)}
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
                  Target Programmes
                </div>
                <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {formatNumber(summary.distinct_programmes)}
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
                        onClick={() => { setActiveUploadTable('courses_table'); setIsUploadModalOpen(true); }}
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
                    backgroundColor: viewType === 'categoryBreakdown' ? '#6366f1' : 'white',
                    color: viewType === 'categoryBreakdown' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'categoryBreakdown' ? '2px solid #6366f1' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="categoryBreakdown"
                      checked={viewType === 'categoryBreakdown'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#6366f1',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'categoryBreakdown' ? 'bold' : 'normal' }}>
                      📊 Category Breakdown
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'programmeBreakdown' ? '#f97316' : 'white',
                    color: viewType === 'programmeBreakdown' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'programmeBreakdown' ? '2px solid #f97316' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="programmeBreakdown"
                      checked={viewType === 'programmeBreakdown'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#f97316',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'programmeBreakdown' ? 'bold' : 'normal' }}>
                      🎓 Programme Breakdown
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
                </div>
              </div>

              <div className="filter-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Category
                  </label>
                  <select
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Categories</option>
                    {filterOptions.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Programme
                  </label>
                  <select
                    className="filter-select"
                    value={filters.programme}
                    onChange={(e) => handleFilterChange('programme', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Programmes</option>
                    {filterOptions.programmes.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Status
                  </label>
                  <select
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Statuses</option>
                    {filterOptions.statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Proposal Type
                  </label>
                  <select
                    className="filter-select"
                    value={filters.proposal_type}
                    onChange={(e) => handleFilterChange('proposal_type', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Proposal Types</option>
                    {filterOptions.proposal_types.map((pt) => (
                      <option key={pt} value={pt}>{pt}</option>
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
                {filters.category !== 'All' && <span style={{ marginRight: '10px' }}>📁 Category: {filters.category}</span>}
                {filters.programme !== 'All' && <span style={{ marginRight: '10px' }}>🎓 Programme: {filters.programme}</span>}
                {filters.status !== 'All' && <span style={{ marginRight: '10px' }}>🚦 Status: {filters.status}</span>}
                {filters.proposal_type !== 'All' && <span style={{ marginRight: '10px' }}>📄 Proposal Type: {filters.proposal_type}</span>}
                {filters.category === 'All' && filters.programme === 'All' && filters.status === 'All' && filters.proposal_type === 'All' && 
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
              {/* Category Breakdown Chart */}
              {viewType === 'categoryBreakdown' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span> Courses by Category
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Understand the distribution of courses across categories like CORE, ELECTIVE, and MOOC.
                    </p>
                  </div>

                  {!categoryData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No category data available for the selected filters.
                    </div>
                  ) : (
                    <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="category"
                            isAnimationActive={true}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Programme Breakdown Chart */}
              {viewType === 'programmeBreakdown' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🎓</span> Courses by Target Programme
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Visualise how many courses are targeted towards different programmes (BTECH, MTECH, etc.).
                    </p>
                  </div>

                  {!programmeData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No programme data available for the selected filters.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={programmeData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis 
                            type="number"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{ 
                              value: 'Number of Courses', 
                              position: 'insideBottom', 
                              offset: -10,
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                            allowDecimals={false}
                          />
                          <YAxis 
                            type="category"
                            dataKey="programme"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            width={120}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="count" 
                            name="Courses" 
                            fill="#f97316" 
                            radius={[0, 6, 6, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}


              {/* Course Catalogue Table */}
              {viewType === 'courseCatalogue' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📚</span> Course Catalogue
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Detailed view of all academic courses.</span>
                      
                      {/* Search Bar */}
                      <input 
                        type="text" 
                        placeholder="Search courses by code, name, or faculty..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ced4da',
                          width: '300px',
                          fontSize: '14px'
                        }}
                      />
                    </p>
                  </div>

                  {!courseList.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No courses found for the selected filters and search.
                    </div>
                  ) : (
                    <>
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
                              <th style={{ padding: '12px', textAlign: 'left' }}>Course Code</th>
                              <th style={{ padding: '12px', textAlign: 'left' }}>Course Name</th>
                              <th style={{ padding: '12px', textAlign: 'left', minWidth: '100px' }}>Category</th>
                              <th style={{ padding: '12px', textAlign: 'left', minWidth: '100px' }}>Programme</th>
                              <th style={{ padding: '12px', textAlign: 'left', minWidth: '150px' }}>Faculty</th>
                              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseList.map((course, index) => (
                              <tr 
                                key={course.course_code + index}
                                style={{ 
                                  backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                                  borderBottom: '1px solid #e0e0e0'
                                }}
                              >
                                <td style={{ padding: '12px', fontWeight: '500' }}>{course.course_code}</td>
                                <td style={{ padding: '12px' }}>
                                  <div style={{ fontWeight: '500' }}>{course.course_name}</div>
                                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    {course.credit_l_t_p_c} • {course.proposal_type}
                                  </div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{ 
                                    backgroundColor: '#e0e7ff',
                                    color: '#3730a3',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    {course.course_category || 'N/A'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px' }}>{course.target_programme || '—'}</td>
                                <td style={{ padding: '12px' }}>
                                  <div style={{ fontWeight: '500' }}>{course.proposing_faculty_name || '—'}</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>{course.faculty_affiliation}</div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{ 
                                    backgroundColor: course.offering_status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                                    color: course.offering_status === 'ACTIVE' ? '#166534' : '#991b1b',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    {course.offering_status || 'UNKNOWN'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {pagination.total_pages > 1 && (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          marginTop: '20px',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.total_pages}</strong> ({pagination.total} total courses)
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              disabled={pagination.page <= 1}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: pagination.page <= 1 ? '#e9ecef' : '#fff',
                                color: pagination.page <= 1 ? '#adb5bd' : '#4f46e5',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                            >
                              Previous
                            </button>
                            <button 
                              onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                              disabled={pagination.page >= pagination.total_pages}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: pagination.page >= pagination.total_pages ? '#e9ecef' : '#fff',
                                color: pagination.page >= pagination.total_pages ? '#adb5bd' : '#4f46e5',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                cursor: pagination.page >= pagination.total_pages ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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