import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

import {
  fetchResearchFilterOptions,
  fetchExternshipSummary,
  fetchExternshipList
} from '../services/researchStats';

import DataUploadModal from './DataUploadModal';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './ResearchSection.css';

const TYPE_COLORS = ['#6366f1', '#22c55e', '#f97316', '#a855f7', '#14b8a6', '#0ea5e9', '#facc15'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return '–';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '–';
  }
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short'
  });
};

const formatDuration = (days) => {
  const numeric = Number(days);
  if (!Number.isFinite(numeric)) {
    return '—';
  }
  if (numeric <= 0) return `${numeric} days`;
  const months = numeric / 30;
  if (months >= 1) {
    return `${(months).toFixed(1)} months`;
  }
  return `${numeric} days`;
};

function ResearchAdministrativeSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    externship_departments: [],
    externship_years: []
  });

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('yearly'); // 'yearly' | 'department' | 'externshipTable'

  const [filters, setFilters] = useState({
    department: 'All',
    externship_year: 'All'
  });

  const [summary, setSummary] = useState({
    total: 0,
    yearly: [],
    department: []
  });
  const [externshipList, setExternshipList] = useState([]);

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
          externship_departments: Array.isArray(options?.externship_departments)
            ? options.externship_departments
            : [],
          externship_years: Array.isArray(options?.externship_years)
            ? [...options.externship_years].sort((a, b) => b - a)
            : []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch externship filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadExternshipData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const [summaryResp, listResp] = await Promise.all([
          fetchExternshipSummary(filters, token),
          fetchExternshipList(filters, token)
        ]);

        setSummary({
          total: summaryResp?.total || 0,
          yearly: Array.isArray(summaryResp?.yearly) ? summaryResp.yearly : [],
          department: Array.isArray(summaryResp?.department) ? summaryResp.department : []
        });
        setExternshipList(listResp?.data || []);
      } catch (err) {
        console.error('Failed to load externship analytics:', err);
        setError(err.message || 'Failed to load externship analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadExternshipData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const externshipTypeKeys = useMemo(() => {
    const keys = new Set();
    summary.yearly.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key !== 'year' && key !== 'total') {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [summary.yearly]);

  const yearlyChartData = useMemo(() => {
    if (!summary.yearly.length) return [];
    return summary.yearly.map((entry) => {
      const item = { year: entry.year, total: Number(entry.total) || 0 };
      externshipTypeKeys.forEach((key) => {
        item[key] = Number(entry[key]) || 0;
      });
      return item;
    });
  }, [summary.yearly, externshipTypeKeys]);

  const departmentChartData = useMemo(() => {
    if (!summary.department.length) return [];
    return summary.department.map((row) => ({
      department: row.department || 'Unspecified',
      total: Number(row.total) || 0
    }));
  }, [summary.department]);

  const typeTotals = useMemo(() => {
    const totals = {};
    summary.yearly.forEach((entry) => {
      externshipTypeKeys.forEach((key) => {
        totals[key] = (totals[key] || 0) + (Number(entry[key]) || 0);
      });
    });
    return totals;
  }, [summary.yearly, externshipTypeKeys]);

  const topType = useMemo(() => {
    let leader = null;
    let maxValue = -Infinity;
    Object.entries(typeTotals).forEach(([type, total]) => {
      if (total > maxValue) {
        leader = type;
        maxValue = total;
      }
    });
    return leader ? `${leader} (${formatNumber(maxValue)})` : '—';
  }, [typeTotals]);

  const participatingDepartments = useMemo(
    () => summary.department.filter((item) => (item.total || 0) > 0).length,
    [summary.department]
  );

  const activeYears = useMemo(() => summary.yearly.length, [summary.yearly]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      externship_year: 'All'
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
        {!isPublicView && <h1>Research · Administrative (Industry Externships)</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Monitor faculty participation in industry externship programmes and collaborations, segmented by department,
          engagement type, and year.
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
              Total Externships
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {formatNumber(summary.total)}
            </div>
          </div>
          <div className="summary-card" style={{ 
            padding: '20px', 
            backgroundColor: '#22c55e', 
            color: 'white', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)'
          }}>
            <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
              Participating Departments
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {formatNumber(participatingDepartments)}
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
              Timeline Coverage
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {formatNumber(activeYears)}
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
              Most Common Type
            </div>
            <div className="summary-card-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {topType}
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
                  Upload Externships
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
                backgroundColor: viewType === 'yearly' ? '#6366f1' : 'white',
                color: viewType === 'yearly' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'yearly' ? '2px solid #6366f1' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="yearly"
                  checked={viewType === 'yearly'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#6366f1',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'yearly' ? 'bold' : 'normal' }}>
                  📊 Year-wise Externships
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

              {/* Table Option */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'externshipTable' ? '#f97316' : 'white',
                color: viewType === 'externshipTable' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'externshipTable' ? '2px solid #f97316' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="externshipTable"
                  checked={viewType === 'externshipTable'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#f97316',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'externshipTable' ? 'bold' : 'normal' }}>
                  📋 Externship Directory
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
                {filterOptions.externship_departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Externship Year
              </label>
              <select
                className="filter-select"
                value={filters.externship_year}
                onChange={(e) => handleFilterChange('externship_year', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Years</option>
                {filterOptions.externship_years.map((year) => (
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
            {filters.externship_year !== 'All' && <span style={{ marginRight: '10px' }}>📅 Year: {filters.externship_year}</span>}
            {filters.department === 'All' && filters.externship_year === 'All' && 
              <span>No filters applied (showing all externships)</span>
            }
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading externship analytics…</p>
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
              {/* Year-wise Externships Chart */}
              {viewType === 'yearly' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span> Year-wise Industry Externships
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Distribution of externship engagements by type across the selected timeframe.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={yearlyChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
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
                            value: 'Number of Externships', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                          }}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                        {externshipTypeKeys.map((type, index) => (
                          <Bar
                            key={type}
                            dataKey={type}
                            stackId="externships"
                            name={type}
                            fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                            radius={index === externshipTypeKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                          />
                        ))}
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
                          {yearlyChartData.reduce((sum, item) => sum + item.total, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Externships</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {yearlyChartData.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {yearlyChartData.length > 0 
                            ? Math.max(...yearlyChartData.map(item => item.total)) 
                            : 0}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Peak Year Count</div>
                      </div>
                    </div>

                    {/* Type Summary */}
                    <div style={{ 
                      marginTop: '15px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '10px'
                    }}>
                      {Object.entries(typeTotals).map(([type, total], index) => (
                        <div key={type} style={{
                          padding: '10px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '6px',
                          border: `1px solid ${TYPE_COLORS[index % TYPE_COLORS.length]}`,
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>{type}</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: TYPE_COLORS[index % TYPE_COLORS.length] }}>
                            {formatNumber(total)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Department-wise Participation Chart */}
              {viewType === 'department' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🏢</span> Department-wise Participation
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Departments ranked by the number of externships completed with industry partners.
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
                            value: 'Number of Externships', 
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
                          name="Externships"
                          fill="#60a5fa" 
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
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Externships</div>
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

              {/* Externship Directory Table */}
              {viewType === 'externshipTable' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📋</span> Faculty–Industry Externship Roster
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Detailed listing of faculty externships including industry partner, duration, and timeline.
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
                        <tr style={{ backgroundColor: '#f97316', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Faculty</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Industry Partner</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Externship Type</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Start Date</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>End Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {externshipList.length === 0 && (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                              No externship records found for the selected filters.
                            </td>
                          </tr>
                        )}
                        {externshipList.map((record, index) => (
                          <tr 
                            key={record.externship_id}
                            style={{ 
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            <td style={{ padding: '12px', fontWeight: '500' }}>{record.faculty_name}</td>
                            <td style={{ padding: '12px' }}>{record.department || '—'}</td>
                            <td style={{ padding: '12px' }}>{record.industry_name || '—'}</td>
                            <td style={{ padding: '12px' }}>
                              {record.type && (
                                <span style={{ 
                                  backgroundColor: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {record.type}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>{formatDuration(record.duration_days)}</td>
                            <td style={{ padding: '12px' }}>{formatDate(record.startdate)}</td>
                            <td style={{ padding: '12px' }}>{formatDate(record.enddate)}</td>
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
                      <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                        {externshipList.length}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Total Records</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                        {new Set(externshipList.map(e => e.department).filter(Boolean)).size}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Departments</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                        {new Set(externshipList.map(e => e.type).filter(Boolean)).size}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Externship Types</div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
        <DataUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tableName="externship_info"
          token={token}
        />
      </div>
    </div>
  );
}

export default ResearchAdministrativeSection;