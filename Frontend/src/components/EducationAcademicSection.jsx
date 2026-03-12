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

const PROGRAM_COLORS = ['#6366f1', '#22d3ee', '#f97316', '#a855f7', '#14b8a6', '#f59e0b'];

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
  const [courseTrend, setCourseTrend] = useState([]);
  const [programmeBreakdown, setProgrammeBreakdown] = useState([]);
  const [courseList, setCourseList] = useState([]);

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

        const [summaryResp, trendResp, progBreakdownResp, courseResp] = await Promise.all([
          fetchSummary(filters, token),
          fetchCategoryBreakdown(filters, token),
          fetchProgrammeBreakdown(filters, token),
          fetchCourses(filters, '', 1, 1000, token)
        ]);

        setSummary(summaryResp?.data || summary);
        setCourseTrend(trendResp?.data || []);
        setProgrammeBreakdown(progBreakdownResp?.data || []);
        setCourseList(courseResp?.data || []);
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
      name: row.category,
      value: row.count || 0
    }));
  }, [courseTrend]);

  const programmeBreakdownChartData = useMemo(() => {
    if (!programmeBreakdown.length) return [];
    return programmeBreakdown.map((row) => ({
      name: row.programme,
      value: row.count || 0
    }));
  }, [programmeBreakdown]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'All',
      programme: 'All',
      status: 'All',
      proposal_type: 'All'
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
        {!isPublicView && <h1>Academic Section · Industry Collaboration Courses</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Explore specialised courses developed in collaboration with industry partners across various academic programmes at IIT Palakkad.
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
            {/* Modern Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {/* Industry-linked Courses Card */}
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>📚</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '500' }}>Industry Courses</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatNumber(summary.total_courses)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Active courses</span>
                  </div>
                </div>
              </div>

              {/* Categories Card */}
              <div style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 10px 20px rgba(34, 211, 238, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>🏢</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '500' }}>Categories</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatNumber(summary.distinct_categories)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Participating</span>
                  </div>
                </div>
              </div>

              {/* Programmes Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 10px 20px rgba(249, 115, 22, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>🎓</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '500' }}>Programmes</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatNumber(summary.distinct_programmes)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Identified</span>
                  </div>
                </div>
              </div>

              {/* Active Courses Card */}
              <div style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 10px 20px rgba(168, 85, 247, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>📊</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '500' }}>Active</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatNumber(summary.active_courses)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>In Delivery</span>
                  </div>
                </div>
              </div>

              {/* Inactive Courses Card */}
              <div style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 10px 20px rgba(20, 184, 166, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>👥</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '500' }}>Inactive</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatNumber(summary.inactive_courses)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#f87171', borderRadius: '50%' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Completed/Paused</span>
                  </div>
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
                      📈 Category Breakdown
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
                    {filterOptions.categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
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
                    {filterOptions.programmes.map((prog) => (
                      <option key={prog} value={prog}>{prog}</option>
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
                    {filterOptions.statuses.map((stat) => (
                      <option key={stat} value={stat}>{stat}</option>
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
                    <option value="All">All Types</option>
                    {filterOptions.proposal_types.map((type) => (
                      <option key={type} value={type}>{type}</option>
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
                {filters.programme !== 'All' && <span style={{ marginRight: '10px' }}>🎓 Prog: {filters.programme}</span>}
                {filters.status !== 'All' && <span style={{ marginRight: '10px' }}>✅ Status: {filters.status}</span>}
                {filters.proposal_type !== 'All' && <span style={{ marginRight: '10px' }}>📝 Type: {filters.proposal_type}</span>}
                {filters.category === 'All' && filters.programme === 'All' && filters.status === 'All' && filters.proposal_type === 'All' && 
                  <span>No filters applied (showing all industry courses)</span>
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
                      <span style={{ fontSize: '24px' }}>📊</span> Industry Course Categories
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Distribution of industry-linked courses across different categories.
                    </p>
                  </div>

                  {!courseTrendChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No category data available for the selected filters.</p>
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={courseTrendChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={140}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {courseTrendChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [value, 'Courses']}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Chart Statistics */}
                      <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '15px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseTrendChartData.reduce((sum, item) => sum + item.value, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Total Courses</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseTrendChartData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Categories</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseTrendChartData.length > 0 
                              ? courseTrendChartData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name
                              : 'N/A'}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Dominant Category</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Programme Breakdown Chart */}
              {viewType === 'programmeBreakdown' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🎓</span> Industry Courses by Programme
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Distribution of industry-linked courses across different academic programmes.
                    </p>
                  </div>

                  {!programmeBreakdownChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎓</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No programme data available for the selected filters.</p>
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={programmeBreakdownChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 10 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            formatter={(value) => [value, 'Courses']}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                          />
                          <Bar 
                            dataKey="value" 
                            name="Courses" 
                            fill="#f97316" 
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
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '15px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                            {programmeBreakdownChartData.reduce((sum, item) => sum + item.value, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Total Courses</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {programmeBreakdownChartData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Programmes</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '24px' }}>
                            {programmeBreakdownChartData.length > 0 
                              ? Math.max(...programmeBreakdownChartData.map(d => d.value))
                              : 0}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Max in Single Prog</div>
                        </div>
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
                      Complete registry of courses collaborating with industry partners.
                    </p>
                  </div>

                  {!courseList.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📚</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No industry courses found for the selected filters.</p>
                    </div>
                  ) : (
                    <div>
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
                              <th style={{ padding: '12px', textAlign: 'left' }}>Course Name</th>
                              <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                              <th style={{ padding: '12px', textAlign: 'left' }}>Programme</th>
                              <th style={{ padding: '12px', textAlign: 'left' }}>Industry Partner</th>
                              <th style={{ padding: '12px', textAlign: 'left' }}>Coordinator</th>
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
                                <td style={{ padding: '12px', fontWeight: '500' }}>{course.course_title}</td>
                                <td style={{ padding: '12px' }}>{course.category}</td>
                                <td style={{ padding: '12px' }}>{course.programme}</td>
                                <td style={{ padding: '12px' }}>{course.industry_partner || '—'}</td>
                                <td style={{ padding: '12px' }}>{course.industry_coordinator_name || '—'}</td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{ 
                                    backgroundColor: course.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                    color: course.status === 'Active' ? '#166534' : '#991b1b',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    {course.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Table Statistics */}
                      <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '15px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseList.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Total Courses</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                            {new Set(courseList.map(c => c.category)).size}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Categories</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {courseList.filter(c => c.status === 'Active').length}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Active Courses</div>
                        </div>
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