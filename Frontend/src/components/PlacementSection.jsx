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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

import {
  fetchPlacementFilterOptions,
  fetchPlacementSummary,
  fetchPlacementTrend,
  fetchPlacementGenderBreakdown,
  fetchPlacementProgramStatus,
  fetchPlacementRecruiters,
  fetchPlacementSectorDistribution,
  fetchPlacementPackageTrend,
  fetchTopRecruiters
} from '../services/placementStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import DataUploadModal from './DataUploadModal';

const GENDER_COLORS = ['#6366f1', '#ec4899', '#f97316'];
const SECTOR_COLORS = ['#4f46e5', '#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15', '#fb7185', '#14b8a6'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return '–';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '–';
  }
  return `${numeric.toFixed(2)} LPA`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '0%';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '0%';
  }
  return `${numeric.toFixed(2)}%`;
};

function PlacementSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    programs: [],
    genders: [],
    sectors: []
  });

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('placementTrend'); // 'placementTrend' | 'genderWise' | 'programWise' | 'recruiters' | 'sectorWise' | 'packageTrend' | 'topRecruiters'

  const [filters, setFilters] = useState({
    year: 'All',
    program: 'All',
    gender: 'All',
    sector: 'All'
  });

  const [summary, setSummary] = useState({
    registered: 0,
    placed: 0,
    placement_percentage: 0,
    highest_package: null,
    lowest_package: null,
    average_package: null
  });

  const [trendData, setTrendData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [programStatus, setProgramStatus] = useState([]);
  const [recruiterStats, setRecruiterStats] = useState([]);
  const [sectorDistribution, setSectorDistribution] = useState([]);
  const [packageTrend, setPackageTrend] = useState([]);
  const [topRecruiters, setTopRecruiters] = useState([]);

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
        const options = await fetchPlacementFilterOptions(token);
        setFilterOptions({
          years: Array.isArray(options?.years) ? options.years : [],
          programs: Array.isArray(options?.programs) ? options.programs : [],
          genders: Array.isArray(options?.genders) ? options.genders : [],
          sectors: Array.isArray(options?.sectors) ? options.sectors : []
        });
      } catch (err) {
        console.error('Failed to fetch placement filter options:', err);
        setError(err.message || 'Failed to load placement filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadPlacementData = async () => {
      if (!token) {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [summaryResp, trendResp, genderResp, programResp, recruiterResp, sectorResp, packageResp, topRecruiterResp] =
          await Promise.all([
            fetchPlacementSummary(filters, token),
            fetchPlacementTrend(filters, token),
            fetchPlacementGenderBreakdown(filters, token),
            fetchPlacementProgramStatus(filters, token),
            fetchPlacementRecruiters(filters, token),
            fetchPlacementSectorDistribution(filters, token),
            fetchPlacementPackageTrend(filters, token),
            fetchTopRecruiters(filters, token)
          ]);

        setSummary(summaryResp?.data || {
          registered: 0,
          placed: 0,
          placement_percentage: 0,
          highest_package: null,
          lowest_package: null,
          average_package: null
        });
        setTrendData(trendResp?.data || []);
        setGenderData(genderResp?.data || []);
        setProgramStatus(programResp?.data || []);
        setRecruiterStats(recruiterResp?.data || []);
        setSectorDistribution(sectorResp?.data || []);
        setPackageTrend(packageResp?.data || []);
        setTopRecruiters(topRecruiterResp?.data || []);
      } catch (err) {
        console.error('Failed to load placement data:', err);
        setError(err.message || 'Failed to load placement statistics.');
      } finally {
        setLoading(false);
      }
    };

    loadPlacementData();
  }, [filters, token]);

  const placementTrendChartData = useMemo(() => {
    if (!trendData.length) return [];
    return trendData.map((row) => ({
      year: row.year,
      percentage: row.placement_percentage || 0,
      registered: row.registered || 0,
      placed: row.placed || 0
    }));
  }, [trendData]);

  const genderPieData = useMemo(() => {
    if (!genderData.length) return [];
    return genderData.map((row) => ({
      name: row.gender,
      value: row.placement_percentage || 0,
      registered: row.registered || 0,
      placed: row.placed || 0
    }));
  }, [genderData]);

  const programStatusChartData = useMemo(() => {
    if (!programStatus.length) return [];
    return programStatus.map((row) => ({
      program: row.program_category,
      registered: row.registered || 0,
      placed: row.placed || 0,
      percentage: row.placement_percentage || 0
    }));
  }, [programStatus]);

  const recruiterChartData = useMemo(() => {
    if (!recruiterStats.length) return [];
    return recruiterStats.map((row) => ({
      year: row.year,
      companies: row.companies || 0,
      offers: row.offers || 0
    }));
  }, [recruiterStats]);

  const sectorPieData = useMemo(() => {
    if (!sectorDistribution.length) return [];
    return sectorDistribution.map((row) => ({
      sector: row.sector,
      companies: row.companies || 0,
      offers: row.offers || 0
    }));
  }, [sectorDistribution]);

  const packageTrendChartData = useMemo(() => {
    if (!packageTrend.length) return [];
    return packageTrend.map((row) => ({
      year: row.year,
      highest: row.highest ?? null,
      lowest: row.lowest ?? null,
      average: row.average ?? null
    }));
  }, [packageTrend]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      year: 'All',
      program: 'All',
      gender: 'All',
      sector: 'All'
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
              {entry.name}: {
                entry.name.includes('Package') || entry.name.includes('package') 
                  ? formatCurrency(entry.value) 
                  : entry.name.includes('%') 
                    ? formatPercentage(entry.value)
                    : formatNumber(entry.value)
              }
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
        {!isPublicView && <h1>Placements & Career Outcomes</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Analyse multi-year placement performance, cohort-wise conversion rates, visiting recruiters, and package
          benchmarks to understand student career trajectories at IIT Palakkad.
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
            <p>Compiling placement performance metrics...</p>
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
                  Total Registered
                </div>
                <div className="summary-card-value" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {formatNumber(summary.registered)}
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
                  Total Placed
                </div>
                <div className="summary-card-value" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {formatNumber(summary.placed)}
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
                  Placement %
                </div>
                <div className="summary-card-value" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {formatPercentage(summary.placement_percentage)}
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
                  Highest Package
                </div>
                <div className="summary-card-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {formatCurrency(summary.highest_package)}
                </div>
              </div>
              <div className="summary-card" style={{ 
                padding: '20px', 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                borderRadius: '10px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(14, 165, 233, 0.2)'
              }}>
                <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
                  Average Package
                </div>
                <div className="summary-card-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {formatCurrency(summary.average_package)}
                </div>
              </div>
              <div className="summary-card" style={{ 
                padding: '20px', 
                backgroundColor: '#ef4444', 
                color: 'white', 
                borderRadius: '10px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)'
              }}>
                <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
                  Lowest Package
                </div>
                <div className="summary-card-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {formatCurrency(summary.lowest_package)}
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
                        onClick={() => { setActiveUploadTable('placement_summary'); setIsUploadModalOpen(true); }}
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
                        Upload Summaries
                      </button>
                      <button
                        className="upload-data-btn"
                        onClick={() => { setActiveUploadTable('placement_companies'); setIsUploadModalOpen(true); }}
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
                        Upload Recruiters
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
                    backgroundColor: viewType === 'placementTrend' ? '#6366f1' : 'white',
                    color: viewType === 'placementTrend' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'placementTrend' ? '2px solid #6366f1' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="placementTrend"
                      checked={viewType === 'placementTrend'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#6366f1',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'placementTrend' ? 'bold' : 'normal' }}>
                      📈 Placement Trend
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'genderWise' ? '#ec4899' : 'white',
                    color: viewType === 'genderWise' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'genderWise' ? '2px solid #ec4899' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="genderWise"
                      checked={viewType === 'genderWise'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#ec4899',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'genderWise' ? 'bold' : 'normal' }}>
                      👥 Gender-wise
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'programWise' ? '#f97316' : 'white',
                    color: viewType === 'programWise' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'programWise' ? '2px solid #f97316' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="programWise"
                      checked={viewType === 'programWise'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#f97316',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'programWise' ? 'bold' : 'normal' }}>
                      🎓 Program-wise
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'recruiters' ? '#f59e0b' : 'white',
                    color: viewType === 'recruiters' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'recruiters' ? '2px solid #f59e0b' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="recruiters"
                      checked={viewType === 'recruiters'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#f59e0b',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'recruiters' ? 'bold' : 'normal' }}>
                      🏢 Recruiters
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'sectorWise' ? '#4f46e5' : 'white',
                    color: viewType === 'sectorWise' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'sectorWise' ? '2px solid #4f46e5' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="sectorWise"
                      checked={viewType === 'sectorWise'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#4f46e5',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'sectorWise' ? 'bold' : 'normal' }}>
                      📊 Sector-wise
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'packageTrend' ? '#10b981' : 'white',
                    color: viewType === 'packageTrend' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'packageTrend' ? '2px solid #10b981' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="packageTrend"
                      checked={viewType === 'packageTrend'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#10b981',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'packageTrend' ? 'bold' : 'normal' }}>
                      💰 Package Trends
                    </span>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    backgroundColor: viewType === 'topRecruiters' ? '#8b5cf6' : 'white',
                    color: viewType === 'topRecruiters' ? 'white' : '#333',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    border: viewType === 'topRecruiters' ? '2px solid #8b5cf6' : '2px solid #ced4da'
                  }}>
                    <input
                      type="radio"
                      name="viewType"
                      value="topRecruiters"
                      checked={viewType === 'topRecruiters'}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{ 
                        accentColor: '#8b5cf6',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: viewType === 'topRecruiters' ? 'bold' : 'normal' }}>
                      ⭐ Top Recruiters
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
                    Year
                  </label>
                  <select
                    className="filter-select"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Years</option>
                    {filterOptions.years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Program
                  </label>
                  <select
                    className="filter-select"
                    value={filters.program}
                    onChange={(e) => handleFilterChange('program', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Programs</option>
                    {filterOptions.programs.map((program) => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Gender
                  </label>
                  <select
                    className="filter-select"
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Genders</option>
                    {filterOptions.genders.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Sector
                  </label>
                  <select
                    className="filter-select"
                    value={filters.sector}
                    onChange={(e) => handleFilterChange('sector', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Sectors</option>
                    {filterOptions.sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
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
                {filters.program !== 'All' && <span style={{ marginRight: '10px' }}>🎓 Program: {filters.program}</span>}
                {filters.gender !== 'All' && <span style={{ marginRight: '10px' }}>👤 Gender: {filters.gender}</span>}
                {filters.sector !== 'All' && <span style={{ marginRight: '10px' }}>🏢 Sector: {filters.sector}</span>}
                {filters.year === 'All' && filters.program === 'All' && filters.gender === 'All' && filters.sector === 'All' && 
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
              {/* Placement Trend Chart */}
              {viewType === 'placementTrend' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📈</span> Placement Percentage Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Track how overall placement conversion has evolved across years.
                    </p>
                  </div>

                  {!placementTrendChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No placement trend data available.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={placementTrendChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
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
                              value: 'Count / Percentage', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="plainline" />
                          <Line 
                            type="monotone" 
                            dataKey="percentage" 
                            name="Placement %" 
                            stroke="#38bdf8" 
                            strokeWidth={3} 
                            dot={{ r: 6, fill: '#38bdf8' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="placed" 
                            name="Placed" 
                            stroke="#22c55e" 
                            strokeWidth={2} 
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="registered" 
                            name="Registered" 
                            stroke="#6366f1" 
                            strokeWidth={2} 
                            dot={{ r: 4 }}
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
                            {placementTrendChartData.reduce((sum, item) => sum + item.registered, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Registered</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                            {placementTrendChartData.reduce((sum, item) => sum + item.placed, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Placed</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '24px' }}>
                            {placementTrendChartData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gender-wise Placement Chart */}
              {viewType === 'genderWise' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>👥</span> Gender-wise Placement Share
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Understand gender balance in placement outcomes.
                    </p>
                  </div>

                  {!genderPieData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No gender-wise data available.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                          <Pie
                            data={genderPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            label={({ name, value }) => `${name}: ${formatPercentage(value)}`}
                            labelLine={{ stroke: '#666', strokeWidth: 1 }}
                          >
                            {genderPieData.map((entry, index) => (
                              <Cell 
                                key={entry.name} 
                                fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => {
                              if (name === 'value') return formatPercentage(value);
                              return value;
                            }}
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

                      {/* Gender Statistics */}
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
                        {genderPieData.map((item, index) => (
                          <div key={item.name} style={{ textAlign: 'center' }}>
                            <div style={{ color: GENDER_COLORS[index % GENDER_COLORS.length], fontWeight: 'bold', fontSize: '20px' }}>
                              {item.registered} / {item.placed}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                              {item.name} (Reg/Placed)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Program-wise Placement Chart */}
              {viewType === 'programWise' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🎓</span> Program-wise Placement Status
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Compare registrations and offers across UG, PG, and PhD cohorts.
                    </p>
                  </div>

                  {!programStatusChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No program-wise data available.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={programStatusChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis 
                            dataKey="program" 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{ 
                              value: 'Program', 
                              position: 'insideBottom', 
                              offset: -10,
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{ 
                              value: 'Number of Students', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                          <Bar dataKey="registered" name="Registered" fill="#6366f1" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="placed" name="Placed" fill="#22c55e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Program Statistics */}
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
                        {programStatusChartData.map((item) => (
                          <div key={item.program} style={{ textAlign: 'center' }}>
                            <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '18px' }}>
                              {formatPercentage(item.percentage)}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                              {item.program} Placement %
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recruiters Chart */}
              {viewType === 'recruiters' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🏢</span> Recruiters per Year
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Monitor company participation and total offers year over year.
                    </p>
                  </div>

                  {!recruiterChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No recruiter statistics available.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={recruiterChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
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
                              value: 'Count', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                          <Bar dataKey="companies" name="Companies" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="offers" name="Offers" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Recruiter Statistics */}
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
                          <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '24px' }}>
                            {recruiterChartData.reduce((sum, item) => sum + item.companies, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Companies</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '24px' }}>
                            {recruiterChartData.reduce((sum, item) => sum + item.offers, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Offers</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                            {recruiterChartData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Years Active</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sector-wise Distribution */}
              {viewType === 'sectorWise' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span> Sector-wise Company Split
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Distribution of visiting recruiters by industry sector.
                    </p>
                  </div>

                  {!sectorPieData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No sector-wise data available.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                          <Pie
                            data={sectorPieData}
                            dataKey="companies"
                            nameKey="sector"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            label={({ sector, companies }) => `${sector}: ${companies}`}
                            labelLine={{ stroke: '#666', strokeWidth: 1 }}
                          >
                            {sectorPieData.map((entry, index) => (
                              <Cell 
                                key={entry.sector} 
                                fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
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

                      {/* Sector Statistics */}
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
                          <div style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '24px' }}>
                            {sectorPieData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Sectors</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                            {sectorPieData.reduce((sum, item) => sum + item.companies, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Companies</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {sectorPieData.reduce((sum, item) => sum + item.offers, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Total Offers</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Package Trends Chart */}
              {viewType === 'packageTrend' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>💰</span> Package Trends
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Track average package trends across years.
                    </p>
                  </div>

                  {!packageTrendChartData.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No package trend data available.
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={packageTrendChartData} margin={{ top: 20, right: 30, left: 60, bottom: 40 }}>
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
                              value: 'Package (LPA)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="plainline" />
                          <Line 
                            type="monotone" 
                            dataKey="average" 
                            name="Average Package" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{ r: 6, fill: '#10b981' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="highest" 
                            name="Highest Package" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="lowest" 
                            name="Lowest Package" 
                            stroke="#ef4444" 
                            strokeWidth={2} 
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>

                      {/* Package Statistics */}
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
                          <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '20px' }}>
                            {formatCurrency(summary.average_package)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Overall Average</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '20px' }}>
                            {formatCurrency(summary.highest_package)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Overall Highest</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '20px' }}>
                            {formatCurrency(summary.lowest_package)}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>Overall Lowest</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Top Recruiters Table */}
              {viewType === 'topRecruiters' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>⭐</span> Top Recruiters
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Highlights of visiting recruiters, their sectors, and offer volume.
                    </p>
                  </div>

                  {!topRecruiters.length ? (
                    <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      No top recruiter information available for the selected filters.
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
                          <tr style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Year</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Company</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Sector</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Offers</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Hires</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Flagged</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topRecruiters.map((row, index) => (
                            <tr 
                              key={`${row.year}-${row.company_name}`}
                              style={{ 
                                backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                                borderBottom: '1px solid #e0e0e0'
                              }}
                            >
                              <td style={{ padding: '12px', fontWeight: '500' }}>{row.year}</td>
                              <td style={{ padding: '12px' }}>{row.company_name}</td>
                              <td style={{ padding: '12px' }}>
                                {row.sector && (
                                  <span style={{ 
                                    backgroundColor: '#e0e7ff',
                                    color: '#3730a3',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    {row.sector}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px' }}>{formatNumber(row.offers)}</td>
                              <td style={{ padding: '12px' }}>{formatNumber(row.hires)}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ 
                                  backgroundColor: row.is_top_recruiter ? '#dcfce7' : '#fee2e2',
                                  color: row.is_top_recruiter ? '#166534' : '#991b1b',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {row.is_top_recruiter ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Recruiter Statistics */}
                  {topRecruiters.length > 0 && (
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
                        <div style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '24px' }}>
                          {topRecruiters.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Entries</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '24px' }}>
                          {new Set(topRecruiters.map(r => r.company_name)).size}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Unique Companies</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {topRecruiters.reduce((sum, r) => sum + (r.offers || 0), 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Offers</div>
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

export default PlacementSection;