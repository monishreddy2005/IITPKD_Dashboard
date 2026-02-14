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
  fetchResearchFilterOptions,
  fetchPublicationSummary,
  fetchPublicationTrend,
  fetchPublicationDepartmentBreakdown,
  fetchPublicationTypeDistribution,
  fetchPublicationList
} from '../services/researchStats';

import DataUploadModal from './DataUploadModal';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './ResearchSection.css';

const TYPE_COLORS = ['#6366f1', '#22d3ee', '#f97316', '#a855f7', '#14b8a6', '#facc15'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const formatDateYear = (year) => {
  if (!year || Number.isNaN(Number(year))) return '—';
  return year;
};

function ResearchLibrarySection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    publication_departments: [],
    publication_years: [],
    publication_types: []
  });

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('trend'); // 'trend' | 'department' | 'type' | 'publicationsTable'

  const [filters, setFilters] = useState({
    department: 'All',
    publication_year: 'All',
    publication_type: 'All'
  });

  const [summary, setSummary] = useState({
    total: 0,
    by_type: {},
    latest_year: null
  });

  const [trendData, setTrendData] = useState([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);
  const [publicationList, setPublicationList] = useState([]);

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
        const options = await fetchResearchFilterOptions(token);
        setFilterOptions({
          publication_departments: Array.isArray(options?.publication_departments)
            ? options.publication_departments
            : [],
          publication_years: Array.isArray(options?.publication_years)
            ? [...options.publication_years].sort((a, b) => b - a)
            : [],
          publication_types: Array.isArray(options?.publication_types)
            ? options.publication_types
            : []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch publication filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadLibraryData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const [summaryResp, trendResp, deptResp, typeResp, listResp] = await Promise.all([
          fetchPublicationSummary(filters, token),
          fetchPublicationTrend(filters, token),
          fetchPublicationDepartmentBreakdown(filters, token),
          fetchPublicationTypeDistribution(filters, token),
          fetchPublicationList(filters, token)
        ]);

        setSummary({
          total: summaryResp?.total || 0,
          by_type: summaryResp?.by_type || {},
          latest_year: summaryResp?.latest_year || null
        });
        setTrendData(trendResp?.data || []);
        setDepartmentBreakdown(deptResp?.data || []);
        setTypeDistribution(typeResp?.data || []);
        setPublicationList(listResp?.data || []);
      } catch (err) {
        console.error('Failed to load library analytics:', err);
        setError(err.message || 'Failed to load library analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadLibraryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const trendChartData = useMemo(() => {
    if (!trendData.length) return [];
    return trendData.map((row) => ({
      year: row.year,
      publications: Number(row.total) || 0
    }));
  }, [trendData]);

  const departmentChartData = useMemo(() => {
    if (!departmentBreakdown.length) return [];
    return departmentBreakdown.map((row) => ({
      department: row.department || 'Unspecified',
      total: Number(row.total) || 0
    }));
  }, [departmentBreakdown]);

  const typePieData = useMemo(() => {
    if (!typeDistribution.length) return [];
    return typeDistribution.map((row) => ({
      name: row.publication_type,
      value: Number(row.total) || 0
    }));
  }, [typeDistribution]);

  const participatingDepartments = useMemo(
    () => departmentBreakdown.filter((row) => (row.total || 0) > 0).length,
    [departmentBreakdown]
  );

  const journalVsConference = useMemo(() => {
    const journal = summary.by_type?.Journal || 0;
    const conference = summary.by_type?.Conference || 0;
    return `${formatNumber(journal)} / ${formatNumber(conference)}`;
  }, [summary.by_type]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      publication_year: 'All',
      publication_type: 'All'
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
        {!isPublicView && <h1>Research · Library & Scholarly Outputs</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Explore the institute&apos;s research publications across journals, conferences, and scholarly formats with
          granular filters by department and year.
        </p>

        {error && <div className="error-message" style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>{error}</div>}

        {/* Summary Cards */}
        <div className="summary-cards" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
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
              Total Publications
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {formatNumber(summary.total)}
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
              Journal / Conference
            </div>
            <div className="summary-card-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {journalVsConference}
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
              Participating Departments
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {participatingDepartments}
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
              Publication Types
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {typeDistribution.length}
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
                <button
                  className="upload-data-btn"
                  onClick={() => setIsUploadModalOpen(true)}
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
                  Upload Publications
                </button>
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
              display: 'flex', 
              gap: '20px', 
              flexWrap: 'wrap'
            }}>
              {/* Chart Options */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'trend' ? '#6366f1' : 'white',
                color: viewType === 'trend' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'trend' ? '2px solid #6366f1' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="trend"
                  checked={viewType === 'trend'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#6366f1',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'trend' ? 'bold' : 'normal' }}>
                  📈 Publication Trend
                </span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'department' ? '#22c55e' : 'white',
                color: viewType === 'department' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'department' ? '2px solid #22c55e' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="department"
                  checked={viewType === 'department'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#22c55e',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'department' ? 'bold' : 'normal' }}>
                  🏢 Department-wise
                </span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'type' ? '#f97316' : 'white',
                color: viewType === 'type' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'type' ? '2px solid #f97316' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="type"
                  checked={viewType === 'type'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#f97316',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'type' ? 'bold' : 'normal' }}>
                  📊 Type Distribution
                </span>
              </label>

              {/* Table Option */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'publicationsTable' ? '#a855f7' : 'white',
                color: viewType === 'publicationsTable' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'publicationsTable' ? '2px solid #a855f7' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="publicationsTable"
                  checked={viewType === 'publicationsTable'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#a855f7',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'publicationsTable' ? 'bold' : 'normal' }}>
                  📋 Publications Directory
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
                {filterOptions.publication_departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Publication Year
              </label>
              <select
                className="filter-select"
                value={filters.publication_year}
                onChange={(e) => handleFilterChange('publication_year', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Years</option>
                {filterOptions.publication_years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Publication Type
              </label>
              <select
                className="filter-select"
                value={filters.publication_type}
                onChange={(e) => handleFilterChange('publication_type', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Types</option>
                {filterOptions.publication_types.map((type) => (
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
            {filters.department !== 'All' && <span style={{ marginRight: '10px' }}>🏢 Dept: {filters.department}</span>}
            {filters.publication_year !== 'All' && <span style={{ marginRight: '10px' }}>📅 Year: {filters.publication_year}</span>}
            {filters.publication_type !== 'All' && <span style={{ marginRight: '10px' }}>📋 Type: {filters.publication_type}</span>}
            {filters.department === 'All' && filters.publication_year === 'All' && filters.publication_type === 'All' && 
              <span>No filters applied (showing all publications)</span>
            }
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading publication analytics…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Single View Section based on radio selection */}
            <section className="chart-section" style={{ 
              marginBottom: '30px', 
              padding: '20px', 
              backgroundColor: '#fff', 
              borderRadius: '10px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              {/* Publication Trend Chart */}
              {viewType === 'trend' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📈</span> Year-wise Publication Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Longitudinal view of publications produced across the selected department and type filters.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={trendChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
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
                            value: 'Number of Publications', 
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
                          dataKey="publications" 
                          name="Publications"
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
                          {trendChartData.reduce((sum, item) => sum + item.publications, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Publications</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {trendChartData.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {trendChartData.length > 0 
                            ? Math.max(...trendChartData.map(item => item.publications)) 
                            : 0}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Peak Year Count</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Department-wise Publications Chart */}
              {viewType === 'department' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🏢</span> Department-wise Publications
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Departments ranked by number of publications under current filters.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={departmentChartData} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="department" 
                          stroke="#666"
                          tick={{ fill: '#666', fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          label={{ 
                            value: 'Department', 
                            position: 'insideBottom', 
                            offset: -20,
                            style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                          }}
                        />
                        <YAxis 
                          stroke="#666"
                          tick={{ fill: '#666', fontSize: 12 }}
                          label={{ 
                            value: 'Number of Publications', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                          }}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                        <Bar 
                          dataKey="total" 
                          name="Publications"
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
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {departmentChartData.reduce((sum, item) => sum + item.total, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Publications</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                          {departmentChartData.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Departments</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {departmentChartData.length > 0 
                            ? Math.max(...departmentChartData.map(item => item.total)) 
                            : 0}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Top Department Count</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Publication Type Distribution Chart */}
              {viewType === 'type' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span> Publication Type Distribution
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Snapshot of publication formats (journal, conference, monographs, etc.) for the current selection.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={450}>
                      <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                        <Pie
                          data={typePieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          labelLine={{ stroke: '#666', strokeWidth: 1 }}
                        >
                          {typePieData.map((entry, index) => (
                            <Cell 
                              key={entry.name} 
                              fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatNumber(value)}
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #ccc', 
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Legend 
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          wrapperStyle={{
                            paddingLeft: '20px',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                          iconType="circle"
                        />
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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '15px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                          {typePieData.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Publication Types</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {typePieData.reduce((sum, item) => sum + item.value, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Publications</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {typePieData.length > 0 
                            ? Math.max(...typePieData.map(item => item.value)) 
                            : 0}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Most Common Type</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Publications Directory Table */}
              {viewType === 'publicationsTable' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📋</span> Publication Catalogue
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Detailed list of publications satisfying the selected filters, including faculty and publication venue.
                    </p>
                  </div>
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
                        <tr style={{ backgroundColor: '#a855f7', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Faculty</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Year</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Journal / Venue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {publicationList.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                              No publications found for the selected filters.
                            </td>
                          </tr>
                        )}
                        {publicationList.map((item, index) => (
                          <tr 
                            key={item.publication_id}
                            style={{ 
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            <td style={{ padding: '12px', fontWeight: '500' }}>{item.publication_title}</td>
                            <td style={{ padding: '12px' }}>{item.faculty_name || '—'}</td>
                            <td style={{ padding: '12px' }}>{item.department || '—'}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ 
                                backgroundColor: '#e0e7ff',
                                color: '#3730a3',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {item.publication_type}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{formatDateYear(item.publication_year)}</td>
                            <td style={{ padding: '12px' }}>{item.journal_name || '—'}</td>
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '24px' }}>
                        {publicationList.length}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Total Publications</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                        {new Set(publicationList.map(p => p.department).filter(Boolean)).size}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Departments</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                        {new Set(publicationList.map(p => p.publication_type)).size}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Publication Types</div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName="research_publications"
        token={token}
      />
    </div>
  );
}

export default ResearchLibrarySection;