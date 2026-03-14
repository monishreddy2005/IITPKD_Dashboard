import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  fetchFilterOptions,
  fetchSummary,
  fetchStateDistribution,
  fetchCountryDistribution,
  fetchOutcomeBreakdown
} from '../services/iarStats';

import DataUploadModal from './DataUploadModal';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './IarSection.css';

const PIE_COLORS = ['#667eea', '#764ba2', '#f093fb', '#43e97b', '#fa709a', '#00f2fe', '#f59e0b', '#a78bfa'];
const STATE_BAR_COLOR = '#67e8f9';
const HIGHER_BAR_COLOR = '#43e97b';
const CORPORATE_BAR_COLOR = '#fa709a';
const TREND_TOTAL_COLOR = '#667eea';
const TREND_HIGHER_COLOR = '#22d3ee';
const TREND_CORPORATE_COLOR = '#f97316';

function IarSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    departments: [],
    genders: [],
    programs: [],
    categories: []
  });

  const [filters, setFilters] = useState({
    year: 'All',
    department: 'All',
    gender: 'All',
    program: 'All',
    category: 'All'
  });

  const [summary, setSummary] = useState({
    total_alumni: 0,
    higher_studies: 0,
    corporate: 0,
    trend: []
  });
  const [stateDistribution, setStateDistribution] = useState([]);
  const [countryDistribution, setCountryDistribution] = useState([]);
  const [outcomeBreakdown, setOutcomeBreakdown] = useState([]);

  // Sort outcome breakdown by total alumni in descending order
  const sortedOutcomeBreakdown = useMemo(() => {
    return [...outcomeBreakdown].sort((a, b) => (b.total || 0) - (a.total || 0));
  }, [outcomeBreakdown]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state to control which visualization block is visible
  const [activeView, setActiveView] = useState('trend'); // 'trend' | 'state' | 'country' | 'outcome'

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
          years: Array.isArray(options?.years) ? options.years : [],
          departments: Array.isArray(options?.departments) ? options.departments : [],
          genders: Array.isArray(options?.genders) ? options.genders : [],
          programs: Array.isArray(options?.programs) ? options.programs : [],
          categories: Array.isArray(options?.categories) ? options.categories : []
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };
    loadFilterOptions();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const [summaryResp, stateResp, countryResp, outcomeResp] = await Promise.all([
        fetchSummary(filters, token),
        fetchStateDistribution(filters, token),
        fetchCountryDistribution(filters, token),
        fetchOutcomeBreakdown(filters, token)
      ]);
      setSummary(summaryResp?.data || { total_alumni: 0, higher_studies: 0, corporate: 0, trend: [] });
      setStateDistribution(stateResp?.data || []);
      setCountryDistribution(countryResp?.data || []);
      setOutcomeBreakdown(outcomeResp?.data || []);
    } catch (err) {
      console.error('Failed to load IAR data:', err);
      setError(err.message || 'Failed to load alumni statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      year: 'All',
      department: 'All',
      gender: 'All',
      program: 'All',
      category: 'All'
    });
  };

  const trendData = useMemo(() => summary.trend || [], [summary.trend]);

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
              {entry.name}: {entry.value}
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
        {!isPublicView && <h1>International and Alumni Relations</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Explore global alumni reach, outcome trends, and state-wise engagement insights with comprehensive filtering by
          year, department, program, gender, and category.
        </p>

        {isPublicView ? null : user && user.role_id === 3 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(40, 167, 69, 0.3)'
              }}
            >
              <span>📤</span> Upload Data
            </button>
          </div>
        )}

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
            <p>Fetching alumni insights...</p>
          </div>
        ) : (
          <>
            {/* Filter Panel */}
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
                <h3 style={{ margin: '0', color: '#333' }}>Filters</h3>
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
              </div>

              <div className="filter-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Year of Admission
                  </label>
                  <select
                    id="yearFilter"
                    className="filter-select"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Years</option>
                    {filterOptions.years?.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Department
                  </label>
                  <select
                    id="departmentFilter"
                    className="filter-select"
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Departments</option>
                    {filterOptions.departments?.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Program
                  </label>
                  <select
                    id="programFilter"
                    className="filter-select"
                    value={filters.program}
                    onChange={(e) => handleFilterChange('program', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Programs</option>
                    {filterOptions.programs?.map((program) => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Gender
                  </label>
                  <select
                    id="genderFilter"
                    className="filter-select"
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Genders</option>
                    {filterOptions.genders?.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Category
                  </label>
                  <select
                    id="categoryFilter"
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Categories</option>
                    {filterOptions.categories?.map((category) => (
                      <option key={category} value={category}>{category}</option>
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
                {filters.year !== 'All' && <span style={{ marginRight: '10px' }}>📅 Year: {filters.year}</span>}
                {filters.department !== 'All' && <span style={{ marginRight: '10px' }}>🏢 Dept: {filters.department}</span>}
                {filters.program !== 'All' && <span style={{ marginRight: '10px' }}>🎓 Program: {filters.program}</span>}
                {filters.gender !== 'All' && <span style={{ marginRight: '10px' }}>👤 Gender: {filters.gender}</span>}
                {filters.category !== 'All' && <span style={{ marginRight: '10px' }}>📋 Category: {filters.category}</span>}
                {filters.year === 'All' && filters.department === 'All' && filters.program === 'All' && 
                 filters.gender === 'All' && filters.category === 'All' && 
                  <span>No filters applied (showing all data)</span>
                }
              </div>
            </div>

            {/* Modern Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Total Alumni Card */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 20px rgba(102, 126, 234, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>👥</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Total Alumni</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.total_alumni}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Alumni matched with filters</span>
                  </div>
                </div>
              </div>

              {/* Higher Studies Card */}
              <div style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 20px rgba(34, 211, 238, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>🎓</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Higher Studies</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.higher_studies}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Pursuing research/education</span>
                  </div>
                </div>
              </div>

              {/* Corporate Careers Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 20px rgba(249, 115, 22, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>💼</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Corporate Careers</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.corporate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Working in industry</span>
                  </div>
                </div>
              </div>
            </div>

            {/* View selector for different IAR charts */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => setActiveView('trend')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeView === 'trend' ? '#667eea' : '#f8f9fa',
                  color: activeView === 'trend' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeView === 'trend' ? '600' : '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📈</span> Outcome Trend
              </button>
              <button
                type="button"
                onClick={() => setActiveView('state')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeView === 'state' ? '#67e8f9' : '#f8f9fa',
                  color: activeView === 'state' ? '#333' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeView === 'state' ? '600' : '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🗺️</span> State Distribution
              </button>
              <button
                type="button"
                onClick={() => setActiveView('country')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeView === 'country' ? '#764ba2' : '#f8f9fa',
                  color: activeView === 'country' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeView === 'country' ? '600' : '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🌍</span> Country Distribution
              </button>
              <button
                type="button"
                onClick={() => setActiveView('outcome')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeView === 'outcome' ? '#43e97b' : '#f8f9fa',
                  color: activeView === 'outcome' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeView === 'outcome' ? '600' : '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📊</span> Department Outcome
              </button>
            </div>

            <div className="chart-section" style={{ 
              marginBottom: '30px', 
              padding: '20px', 
              backgroundColor: '#fff', 
              borderRadius: '10px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              {activeView === 'trend' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📈</span> Outcome Trend Over Years
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Track the proportion of alumni opting for higher studies versus corporate roles across admission years.
                    </p>
                  </div>

                  {trendData.length === 0 ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📈</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No trend data available for the selected filters.</p>
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={trendData} margin={{ top: 10, right: 20, left: 40, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Line type="monotone" dataKey="total" name="Total alumni" stroke={TREND_TOTAL_COLOR} strokeWidth={2.5} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="higher" name="Higher studies" stroke={TREND_HIGHER_COLOR} strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="corporate" name="Corporate" stroke={TREND_CORPORATE_COLOR} strokeWidth={2} dot={{ r: 3 }} />
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
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '10px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '20px' }}>
                            {trendData.reduce((sum, item) => sum + item.total, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Total Alumni</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '20px' }}>
                            {trendData.reduce((sum, item) => sum + item.higher, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Higher Studies</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>
                            {trendData.reduce((sum, item) => sum + item.corporate, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Corporate</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '20px' }}>
                            {trendData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Years Covered</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'state' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🗺️</span> State-wise Alumni Distribution
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Alumni counts mapped to Indian states based on their registered home state.
                    </p>
                  </div>

                  {stateDistribution.length === 0 ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🗺️</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No state distribution data to display.</p>
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stateDistribution} margin={{ top: 10, right: 20, left: 40, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="state" angle={-30} textAnchor="end" height={70} tick={{ fontSize: 10 }} interval={0} />
                          <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" name="Alumni count" fill={STATE_BAR_COLOR} radius={[4, 4, 0, 0]} barSize={20} />
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
                        gap: '10px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#67e8f9', fontWeight: 'bold', fontSize: '20px' }}>
                            {stateDistribution.reduce((sum, item) => sum + item.count, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Total Alumni</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '20px' }}>
                            {stateDistribution.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>States Represented</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>
                            {stateDistribution.length > 0 ? Math.max(...stateDistribution.map(item => item.count)) : 0}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Highest Count</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'country' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🌍</span> Global Alumni Reach
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Breakdown of alumni locations across countries to understand international presence.
                    </p>
                  </div>

                  {countryDistribution.length === 0 ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🌍</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No country distribution data to display.</p>
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={countryDistribution}
                            dataKey="count"
                            nameKey="country"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {countryDistribution.map((entry, index) => (
                              <Cell key={entry.country} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} alumni`, 'Count']} />
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
                        gap: '10px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '20px' }}>
                            {countryDistribution.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Countries</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '20px' }}>
                            {countryDistribution.reduce((sum, item) => sum + item.count, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Total Alumni</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>
                            {countryDistribution.length > 0 ? Math.max(...countryDistribution.map(item => item.count)) : 0}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>Highest Count</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'outcome' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span> Outcome by Department
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Compare higher studies versus corporate career paths chosen by alumni from each department.
                    </p>
                  </div>

                  {outcomeBreakdown.length === 0 ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No departmental breakdown to display.</p>
                    </div>
                  ) : (
                    <>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={sortedOutcomeBreakdown} margin={{ top: 10, right: 20, left: 40, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="department" angle={-30} textAnchor="end" height={70} tick={{ fontSize: 10 }} interval={0} />
                            <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="higher" name="Higher studies" stackId="a" fill={HIGHER_BAR_COLOR} radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="corporate" name="Corporate" stackId="a" fill={CORPORATE_BAR_COLOR} radius={[4, 4, 0, 0]} barSize={20} />
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
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '10px'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '20px' }}>
                              {outcomeBreakdown.reduce((sum, item) => sum + item.total, 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px' }}>Total Alumni</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#43e97b', fontWeight: 'bold', fontSize: '20px' }}>
                              {outcomeBreakdown.reduce((sum, item) => sum + (item.higher || 0), 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px' }}>Higher Studies</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#fa709a', fontWeight: 'bold', fontSize: '20px' }}>
                              {outcomeBreakdown.reduce((sum, item) => sum + (item.corporate || 0), 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px' }}>Corporate</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>
                              {outcomeBreakdown.length}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px' }}>Departments</div>
                          </div>
                        </div>
                      </div>

                      {/* Departmental Outcome Summary Table */}
                      <div className="grievance-table-wrapper" style={{ marginTop: '20px' }}>
                        <div className="chart-header" style={{ marginBottom: '15px' }}>
                          <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '18px' }}>Departmental Outcome Summary</h3>
                          <p className="chart-description" style={{ color: '#666', fontSize: '12px', margin: 0 }}>
                            Tabular view listing counts per department.
                          </p>
                        </div>

                        <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            fontSize: '13px'
                          }}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#43e97b', color: 'white' }}>
                              <tr>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Department</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Total Alumni</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Higher Studies</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Corporate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedOutcomeBreakdown.map((row, index) => (
                                <tr key={row.department} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                                  <td style={{ padding: '8px' }}>{row.department}</td>
                                  <td style={{ padding: '8px' }}>{row.total}</td>
                                  <td style={{ padding: '8px', color: '#43e97b', fontWeight: '500' }}>{row.higher}</td>
                                  <td style={{ padding: '8px', color: '#fa709a', fontWeight: '500' }}>{row.corporate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName="alumni"
        token={token}
      />
    </div>
  );
}

export default IarSection;