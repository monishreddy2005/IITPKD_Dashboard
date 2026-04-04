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

  // Process data for department-wise yearly trend line graph
  const departmentYearlyTrendData = useMemo(() => {
    if (!summary.yearly.length) return { trendData: [], departments: [] };
    
    // Get all departments from the data
    const departments = new Set();
    summary.yearly.forEach((yearData) => {
      Object.keys(yearData).forEach((key) => {
        if (key !== 'year' && key !== 'total') {
          departments.add(key);
        }
      });
    });
    
    // Transform data for line chart
    const trendData = summary.yearly.map((yearData) => {
      const yearItem = { year: yearData.year };
      departments.forEach((dept) => {
        yearItem[dept] = Number(yearData[dept]) || 0;
      });
      return yearItem;
    });
    
    return { trendData, departments: Array.from(departments) };
  }, [summary.yearly]);

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

        {/* Modern Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Total Externships Card */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)',
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
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Total Externships</span>
              </div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                {formatNumber(summary.total)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Total industry engagements</span>
              </div>
            </div>
          </div>

          {/* Participating Departments Card */}
          <div style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)',
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
                <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>🏢</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Departments</span>
              </div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                {formatNumber(participatingDepartments)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Active departments</span>
              </div>
            </div>
          </div>

          {/* Timeline Coverage Card */}
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
                <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>📅</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Timeline Coverage</span>
              </div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                {formatNumber(activeYears)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Years of activity</span>
              </div>
            </div>
          </div>

          {/* Most Common Type Card */}
          <div style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 20px rgba(168, 85, 247, 0.2)',
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
                <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>📊</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Most Common Type</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                {topType}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Most frequent type</span>
              </div>
            </div>
          </div>
        </div>

        {/* Radio Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          marginBottom: '30px',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <button 
            onClick={() => setViewType('yearly')}
            style={{
              padding: '12px 24px',
              backgroundColor: viewType === 'yearly' ? '#6366f1' : 'transparent',
              color: viewType === 'yearly' ? 'white' : '#333',
              border: viewType === 'yearly' ? '2px solid #6366f1' : '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewType === 'yearly' ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}
          >
            📊 Year-wise Externships
          </button>
          <button 
            onClick={() => setViewType('department')}
            style={{
              padding: '12px 24px',
              backgroundColor: viewType === 'department' ? '#22c55e' : 'transparent',
              color: viewType === 'department' ? 'white' : '#333',
              border: viewType === 'department' ? '2px solid #22c55e' : '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewType === 'department' ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}
          >
            🏢 Department-wise
          </button>
          <button 
            onClick={() => setViewType('externshipTable')}
            style={{
              padding: '12px 24px',
              backgroundColor: viewType === 'externshipTable' ? '#f97316' : 'transparent',
              color: viewType === 'externshipTable' ? 'white' : '#333',
              border: viewType === 'externshipTable' ? '2px solid #f97316' : '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewType === 'externshipTable' ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}
          >
            📋 Externship Directory
          </button>
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
                  <div className="chart-header" style={{ marginBottom: '15px' }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '22px' }}>📊</span> Year-wise Externships
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0', fontSize: '13px' }}>
                      Distribution by type over time
                    </p>
                  </div>
                  
                  {/* Filters inside the yearly view */}
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '15px' 
                    }}>
                      <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Filters</h4>
                      <button 
                        onClick={handleClearFilters}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#dc3545', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                    
                    <div className="filter-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '12px' 
                    }}>
                      <div className="filter-group">
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Department</label>
                        <select
                          className="filter-select"
                          value={filters.department}
                          onChange={(e) => handleFilterChange('department', e.target.value)}
                          style={{ padding: '6px', fontSize: '13px', width: '100%' }}
                        >
                          <option value="All">All Departments</option>
                          {filterOptions.externship_departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Externship Year</label>
                        <select
                          className="filter-select"
                          value={filters.externship_year}
                          onChange={(e) => handleFilterChange('externship_year', e.target.value)}
                          style={{ padding: '6px', fontSize: '13px', width: '100%' }}
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
                      marginTop: '12px', 
                      padding: '8px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <strong>Active Filters:</strong>{' '}
                      {filters.department !== 'All' && <span style={{ marginRight: '8px' }}>🏢 {filters.department}</span>}
                      {filters.externship_year !== 'All' && <span style={{ marginRight: '8px' }}>📅 {filters.externship_year}</span>}
                      {filters.department === 'All' && filters.externship_year === 'All' && 
                        <span>No filters applied</span>
                      }
                    </div>
                  </div>

                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={yearlyChartData} margin={{ top: 10, right: 20, left: 40, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        {externshipTypeKeys.map((type, index) => (
                          <Bar key={type} dataKey={type} stackId="a" fill={TYPE_COLORS[index % TYPE_COLORS.length]} radius={index === externshipTypeKeys.length - 1 ? [4,4,0,0] : [0,0,0,0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Department-wise Yearly Trend Line Graph */}
              {viewType === 'department' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '15px' }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '22px' }}>🏢</span> Department-wise Yearly Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0', fontSize: '13px' }}>
                      Yearly trend of externships by department
                    </p>
                  </div>
                  
                  {/* Filters inside the department view */}
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '15px' 
                    }}>
                      <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Filters</h4>
                      <button 
                        onClick={handleClearFilters}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#dc3545', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                    
                    <div className="filter-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '12px' 
                    }}>
                      <div className="filter-group">
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Department</label>
                        <select
                          className="filter-select"
                          value={filters.department}
                          onChange={(e) => handleFilterChange('department', e.target.value)}
                          style={{ padding: '6px', fontSize: '13px', width: '100%' }}
                        >
                          <option value="All">All Departments</option>
                          {filterOptions.externship_departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Externship Year</label>
                        <select
                          className="filter-select"
                          value={filters.externship_year}
                          onChange={(e) => handleFilterChange('externship_year', e.target.value)}
                          style={{ padding: '6px', fontSize: '13px', width: '100%' }}
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
                      marginTop: '12px', 
                      padding: '8px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <strong>Active Filters:</strong>{' '}
                      {filters.department !== 'All' && <span style={{ marginRight: '8px' }}>🏢 {filters.department}</span>}
                      {filters.externship_year !== 'All' && <span style={{ marginRight: '8px' }}>📅 {filters.externship_year}</span>}
                      {filters.department === 'All' && filters.externship_year === 'All' && 
                        <span>No filters applied</span>
                      }
                    </div>
                  </div>

                  {/* Department-wise Yearly Trend Line Graph */}
                  {departmentYearlyTrendData.trendData.length > 0 && (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={departmentYearlyTrendData.trendData} margin={{ top: 10, right: 30, left: 40, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          {departmentYearlyTrendData.departments.map((dept, index) => (
                            <Line
                              key={dept}
                              type="monotone"
                              dataKey={dept}
                              stroke={TYPE_COLORS[index % TYPE_COLORS.length]}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Externship Directory Table */}
              {viewType === 'externshipTable' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📋</span> Externship Directory
                    </h2>
                    <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 0 0' }}>
                      {externshipList.length} records found
                    </p>
                  </div>
                  
                  {/* Filters inside the table view */}
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '15px' 
                    }}>
                      <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Filters</h4>
                      <button 
                        onClick={handleClearFilters}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#dc3545', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                    
                    <div className="filter-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '12px' 
                    }}>
                      <div className="filter-group">
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Department</label>
                        <select
                          className="filter-select"
                          value={filters.department}
                          onChange={(e) => handleFilterChange('department', e.target.value)}
                          style={{ padding: '6px', fontSize: '13px', width: '100%' }}
                        >
                          <option value="All">All Departments</option>
                          {filterOptions.externship_departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Externship Year</label>
                        <select
                          className="filter-select"
                          value={filters.externship_year}
                          onChange={(e) => handleFilterChange('externship_year', e.target.value)}
                          style={{ padding: '6px', fontSize: '13px', width: '100%' }}
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
                      marginTop: '12px', 
                      padding: '8px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <strong>Active Filters:</strong>{' '}
                      {filters.department !== 'All' && <span style={{ marginRight: '8px' }}>🏢 {filters.department}</span>}
                      {filters.externship_year !== 'All' && <span style={{ marginRight: '8px' }}>📅 {filters.externship_year}</span>}
                      {filters.department === 'All' && filters.externship_year === 'All' && 
                        <span>No filters applied</span>
                      }
                    </div>
                  </div>

                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f97316', color: 'white' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Faculty</th>
                          <th style={{ padding: '10px' }}>Dept</th>
                          <th style={{ padding: '10px' }}>Partner</th>
                          <th style={{ padding: '10px' }}>Type</th>
                          <th style={{ padding: '10px' }}>Duration</th>
                          <th style={{ padding: '10px' }}>Start</th>
                          <th style={{ padding: '10px' }}>End</th>
                        </tr>
                      </thead>
                      <tbody>
                        {externshipList.map((e, i) => (
                          <tr key={e.externship_id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                            <td style={{ padding: '8px' }}>{e.faculty_name}</td>
                            <td style={{ padding: '8px' }}>{e.department}</td>
                            <td style={{ padding: '8px' }}>{e.industry_name}</td>
                            <td style={{ padding: '8px' }}>{e.type}</td>
                            <td style={{ padding: '8px' }}>{formatDuration(e.duration_days)}</td>
                            <td style={{ padding: '8px' }}>{formatDate(e.startdate)}</td>
                            <td style={{ padding: '8px' }}>{formatDate(e.enddate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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