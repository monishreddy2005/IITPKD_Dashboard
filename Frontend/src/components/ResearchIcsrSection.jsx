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
  fetchResearchFilterOptions,
  fetchIcsrSummary,
  fetchIcsrProjectTrend,
  fetchConsultancyTrend,
  fetchIcsrProjectList,
  fetchMouTrend,
  fetchMouList,
  fetchPatentStats,
  fetchPatentList
} from '../services/researchStats';

import DataUploadModal from './DataUploadModal';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './ResearchSection.css';

const PATENT_STATUS_ORDER = ['Filed', 'Granted', 'Published'];
const PATENT_COLORS = {
  Filed: '#6366f1',
  Granted: '#22c55e',
  Published: '#f97316'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric);
};

const formatScaledCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return { value: '0', unit: '' };
  }
  
  const crore = 10000000; // 1 crore = 1,00,00,000
  const lakh = 100000; // 1 lakh = 1,00,000
  
  if (numeric >= crore) {
    const crores = numeric / crore;
    return {
      value: new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: crores % 1 === 0 ? 0 : 2
      }).format(crores),
      unit: crores === 1 ? 'Crore' : 'Crores'
    };
  } else if (numeric >= lakh) {
    const lakhs = numeric / lakh;
    return {
      value: new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: lakhs % 1 === 0 ? 0 : 2
      }).format(lakhs),
      unit: lakhs === 1 ? 'Lakh' : 'Lakhs'
    };
  } else {
    return {
      value: new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
      }).format(numeric),
      unit: ''
    };
  }
};

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

const buildPatentBreakdown = (source = {}) => ({
  Filed: Number(source?.Filed) || 0,
  Granted: Number(source?.Granted) || 0,
  Published: Number(source?.Published) || 0
});

function ResearchIcsrSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    project_departments: [],
    project_years: [],
    project_statuses: [],
    project_types: [],
    mou_years: [],
    patent_years: [],
    patent_statuses: []
  });

  // Graph type selection with radio buttons (now includes table views)
  const [viewType, setViewType] = useState('fundedProjects'); // 'fundedProjects' | 'consultancyRevenue' | 'mous' | 'patents' | 'projectsTable' | 'mousTable'

  const [filters, setFilters] = useState({
    department: 'All',
    project_year: 'All',
    project_type: 'All',
    status: 'All',
    mou_year: 'All',
    patent_year: 'All',
    patent_status: 'All'
  });

  const [summary, setSummary] = useState({
    funded_projects: 0,
    consultancy_projects: 0,
    sanctioned_projects: 0,
    total_projects: 0,
    total_mous: 0,
    total_patents: 0,
    consultancy_revenue: 0,
    patent_breakdown: buildPatentBreakdown()
  });

  const [projectTrend, setProjectTrend] = useState([]);
  const [consultancyTrend, setConsultancyTrend] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [mouTrend, setMouTrend] = useState([]);
  const [mouList, setMouList] = useState([]);
  const [patentStats, setPatentStats] = useState({ overall: buildPatentBreakdown(), yearly: [] });
  const [patentList, setPatentList] = useState([]);

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
          project_departments: Array.isArray(options?.project_departments) ? options.project_departments : [],
          project_years: Array.isArray(options?.project_years)
            ? [...options.project_years].sort((a, b) => b - a)
            : [],
          project_statuses: Array.isArray(options?.project_statuses) ? options.project_statuses : [],
          project_types: Array.isArray(options?.project_types) ? options.project_types : [],
          mou_years: Array.isArray(options?.mou_years) ? [...options.mou_years].sort((a, b) => b - a) : [],
          patent_years: Array.isArray(options?.patent_years)
            ? [...options.patent_years].sort((a, b) => b - a)
            : [],
          patent_statuses: Array.isArray(options?.patent_statuses) ? options.patent_statuses : []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load research filter options:', err);
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

        const [
          summaryResp,
          projectTrendResp,
          consultancyTrendResp,
          projectListResp,
          mouTrendResp,
          mouListResp,
          patentStatsResp,
          patentListResp
        ] = await Promise.all([
          fetchIcsrSummary(filters, token),
          fetchIcsrProjectTrend(filters, token),
          fetchConsultancyTrend(filters, token),
          fetchIcsrProjectList(filters, token),
          fetchMouTrend(token),
          fetchMouList({ mou_year: filters.mou_year }, token),
          fetchPatentStats(
            {
              patent_year: filters.patent_year,
              patent_status: filters.patent_status
            },
            token
          ),
          fetchPatentList(
            {
              patent_year: filters.patent_year,
              patent_status: filters.patent_status
            },
            token
          )
        ]);

        setSummary({
          funded_projects: summaryResp?.funded_projects || 0,
          consultancy_projects: summaryResp?.consultancy_projects || 0,
          sanctioned_projects:
            summaryResp?.sanctioned_projects ?? summaryResp?.total_projects ?? 0,
          total_projects: summaryResp?.total_projects ?? summaryResp?.sanctioned_projects ?? 0,
          total_mous: summaryResp?.total_mous || 0,
          total_patents: summaryResp?.total_patents || 0,
          consultancy_revenue: summaryResp?.consultancy_revenue || 0,
          patent_breakdown: buildPatentBreakdown(summaryResp?.patent_breakdown)
        });

        setProjectTrend(projectTrendResp?.data || []);
        setConsultancyTrend(consultancyTrendResp?.data || []);
        setProjectList(projectListResp?.data || []);
        setMouTrend(mouTrendResp?.data || []);
        setMouList(mouListResp?.data || []);
        setPatentStats({
          overall: buildPatentBreakdown(patentStatsResp?.overall),
          yearly: Array.isArray(patentStatsResp?.yearly) ? patentStatsResp.yearly : []
        });
        setPatentList(patentListResp?.data || []);
      } catch (err) {
        console.error('Failed to load ICSR analytics:', err);
        setError(err.message || 'Failed to load ICSR analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const projectTrendChartData = useMemo(() => {
    if (!projectTrend.length) return [];
    return projectTrend.map((row) => ({
      year: row.year,
      projects: Number(row.total) || 0
    }));
  }, [projectTrend]);

  const consultancyTrendChartData = useMemo(() => {
    if (!consultancyTrend.length) return [];
    return consultancyTrend.map((row) => ({
      year: row.year,
      revenue: Number(row.revenue) || 0
    }));
  }, [consultancyTrend]);

  const mouTrendChartData = useMemo(() => {
    if (!mouTrend.length) return [];
    return mouTrend.map((row) => ({
      year: row.year,
      total: Number(row.total) || 0
    }));
  }, [mouTrend]);

  const patentTrendChartData = useMemo(() => {
    if (!patentStats.yearly.length) return [];
    return patentStats.yearly.map((row) => {
      const entry = { year: row.year };
      PATENT_STATUS_ORDER.forEach((status) => {
        entry[status] = Number(row[status]) || 0;
      });
      entry.total = PATENT_STATUS_ORDER.reduce((acc, status) => acc + entry[status], 0);
      return entry;
    });
  }, [patentStats.yearly]);

  const patentOverall = useMemo(
    () => PATENT_STATUS_ORDER.map((status) => ({
      status,
      value: patentStats.overall[status] || 0,
      color: PATENT_COLORS[status]
    })),
    [patentStats.overall]
  );

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      project_year: 'All',
      project_type: 'All',
      status: 'All',
      mou_year: 'All',
      patent_year: 'All',
      patent_status: 'All'
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
              {entry.name}: {entry.name === 'revenue' ? formatCurrency(entry.value) : entry.value}
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
        {!isPublicView && <h1>Research · ICSR (Industrial Consultancy & Sponsored Research)</h1>}
        <p>
          Track externally funded and consultancy projects, partnership MoUs, and innovation outcomes through patents
          filed and granted under IIT Palakkad&apos;s ICSR portfolio.
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Summary Cards */}
        <div className="summary-cards icsr-summary-cards">
          <div className="summary-card">
            <h3>Total Sanctioned Projects</h3>
            <p className="summary-value">{formatNumber(summary.total_projects)}</p>
            <span className="summary-subtitle">Funded + consultancy projects</span>
          </div>
          <div className="summary-card">
            <h3>Externally Funded Projects</h3>
            <p className="summary-value accent-success">{formatNumber(summary.funded_projects)}</p>
            <span className="summary-subtitle">Active + completed</span>
          </div>
          <div className="summary-card">
            <h3>Consultancy Projects</h3>
            <p className="summary-value accent-warning">{formatNumber(summary.consultancy_projects)}</p>
            <span className="summary-subtitle">Client-driven engagements</span>
          </div>
          <div className="summary-card">
            <h3>Consultancy Revenue</h3>
            {(() => {
              const scaled = formatScaledCurrency(summary.consultancy_revenue);
              return (
                <p className="summary-value">
                  ₹{scaled.value}
                  {scaled.unit && <span style={{ fontSize: '0.65em', fontWeight: '500', marginLeft: '0.25rem' }}>{scaled.unit}</span>}
                </p>
              );
            })()}
            <span className="summary-subtitle">Amount sanctioned across consultancy projects</span>
          </div>
          <div className="summary-card">
            <h3>Partnership MoUs Signed</h3>
            <p className="summary-value">{formatNumber(summary.total_mous)}</p>
            <span className="summary-subtitle">Strategic collaboration agreements</span>
          </div>
          <div className="summary-card">
            <h3>Patents (Filed / Granted / Published)</h3>
            <p className="summary-value">
              {formatNumber(summary.patent_breakdown.Filed)} / {formatNumber(summary.patent_breakdown.Granted)} /{' '}
              {formatNumber(summary.patent_breakdown.Published)}
            </p>
            <span className="summary-subtitle">Total patents: {formatNumber(summary.total_patents)}</span>
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
                    onClick={() => { setActiveUploadTable('research_projects'); setIsUploadModalOpen(true); }}
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
                    Upload Projects
                  </button>
                  <button
                    className="upload-data-btn"
                    onClick={() => { setActiveUploadTable('research_mous'); setIsUploadModalOpen(true); }}
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
                    Upload MoUs
                  </button>
                  <button
                    className="upload-data-btn"
                    onClick={() => { setActiveUploadTable('research_patents'); setIsUploadModalOpen(true); }}
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
                    Upload Patents
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* View Type Selection - Radio Buttons (Now includes Charts AND Tables) */}
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
                backgroundColor: viewType === 'fundedProjects' ? '#6366f1' : 'white',
                color: viewType === 'fundedProjects' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'fundedProjects' ? '2px solid #6366f1' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="fundedProjects"
                  checked={viewType === 'fundedProjects'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#6366f1',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'fundedProjects' ? 'bold' : 'normal' }}>
                  📊 Funded Projects Trend
                </span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'consultancyRevenue' ? '#22c55e' : 'white',
                color: viewType === 'consultancyRevenue' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'consultancyRevenue' ? '2px solid #22c55e' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="consultancyRevenue"
                  checked={viewType === 'consultancyRevenue'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#22c55e',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'consultancyRevenue' ? 'bold' : 'normal' }}>
                  💰 Consultancy Revenue Trend
                </span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'mous' ? '#8b5cf6' : 'white',
                color: viewType === 'mous' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'mous' ? '2px solid #8b5cf6' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="mous"
                  checked={viewType === 'mous'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#8b5cf6',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'mous' ? 'bold' : 'normal' }}>
                  🤝 MoUs Signed Trend
                </span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'patents' ? '#f97316' : 'white',
                color: viewType === 'patents' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'patents' ? '2px solid #f97316' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="patents"
                  checked={viewType === 'patents'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#f97316',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'patents' ? 'bold' : 'normal' }}>
                  📝 Patents Trend
                </span>
              </label>

              {/* Table Options */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'projectsTable' ? '#0ea5e9' : 'white',
                color: viewType === 'projectsTable' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'projectsTable' ? '2px solid #0ea5e9' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="projectsTable"
                  checked={viewType === 'projectsTable'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#0ea5e9',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'projectsTable' ? 'bold' : 'normal' }}>
                  📋 Projects Directory
                </span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'mousTable' ? '#ec4899' : 'white',
                color: viewType === 'mousTable' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'mousTable' ? '2px solid #ec4899' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="mousTable"
                  checked={viewType === 'mousTable'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#ec4899',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'mousTable' ? 'bold' : 'normal' }}>
                  🤝 MoUs Directory
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
                {filterOptions.project_departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Project Year
              </label>
              <select
                className="filter-select"
                value={filters.project_year}
                onChange={(e) => handleFilterChange('project_year', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Years</option>
                {filterOptions.project_years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Project Type
              </label>
              <select
                className="filter-select"
                value={filters.project_type}
                onChange={(e) => handleFilterChange('project_type', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Types</option>
                {filterOptions.project_types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Project Status
              </label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Status</option>
                {filterOptions.project_statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                MoU Year
              </label>
              <select
                className="filter-select"
                value={filters.mou_year}
                onChange={(e) => handleFilterChange('mou_year', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Years</option>
                {filterOptions.mou_years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Patent Year
              </label>
              <select
                className="filter-select"
                value={filters.patent_year}
                onChange={(e) => handleFilterChange('patent_year', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Years</option>
                {filterOptions.patent_years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                Patent Status
              </label>
              <select
                className="filter-select"
                value={filters.patent_status}
                onChange={(e) => handleFilterChange('patent_status', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="All">All Status</option>
                {filterOptions.patent_statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
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
            {filters.project_year !== 'All' && <span style={{ marginRight: '10px' }}>📅 Project Year: {filters.project_year}</span>}
            {filters.project_type !== 'All' && <span style={{ marginRight: '10px' }}>📋 Type: {filters.project_type}</span>}
            {filters.status !== 'All' && <span style={{ marginRight: '10px' }}>⚡ Status: {filters.status}</span>}
            {filters.mou_year !== 'All' && <span style={{ marginRight: '10px' }}>🤝 MoU Year: {filters.mou_year}</span>}
            {filters.patent_year !== 'All' && <span style={{ marginRight: '10px' }}>📝 Patent Year: {filters.patent_year}</span>}
            {filters.patent_status !== 'All' && <span style={{ marginRight: '10px' }}>📌 Patent Status: {filters.patent_status}</span>}
            {filters.department === 'All' && filters.project_year === 'All' && filters.project_type === 'All' && 
             filters.status === 'All' && filters.mou_year === 'All' && filters.patent_year === 'All' && 
             filters.patent_status === 'All' && 
              <span>No filters applied (showing all data)</span>
            }
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading research analytics…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Single View Section based on radio selection - Charts or Tables */}
            <section className="chart-section" style={{ 
              marginBottom: '30px', 
              padding: '20px', 
              backgroundColor: '#fff', 
              borderRadius: '10px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              {/* Funded Projects Trend Chart */}
              {viewType === 'fundedProjects' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span> Externally Funded Project Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Annual count of externally funded projects with the selected filters.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={projectTrendChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
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
                            value: 'Number of Projects', 
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
                          dataKey="projects" 
                          name="Funded Projects"
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
                          {projectTrendChartData.reduce((sum, item) => sum + item.projects, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Funded Projects</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {projectTrendChartData.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {projectTrendChartData.length > 0 
                            ? Math.max(...projectTrendChartData.map(item => item.projects)) 
                            : 0}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Peak Year Count</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Consultancy Revenue Trend Chart */}
              {viewType === 'consultancyRevenue' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>💰</span> Consultancy Revenue Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Year-wise sanctioned consultancy revenue (₹), showcasing industry engagement momentum.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={consultancyTrendChartData} margin={{ top: 20, right: 30, left: 60, bottom: 40 }}>
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
                            value: 'Revenue (₹)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                          }}
                          tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="plainline" />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Consultancy Revenue"
                          stroke="#22c55e" 
                          strokeWidth={3} 
                          dot={{ r: 6, fill: '#22c55e' }}
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
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {formatCurrency(consultancyTrendChartData.reduce((sum, item) => sum + item.revenue, 0))}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Revenue</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                          {consultancyTrendChartData.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {consultancyTrendChartData.length > 0 
                            ? formatCurrency(Math.max(...consultancyTrendChartData.map(item => item.revenue)))
                            : '₹0'}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Peak Year Revenue</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MoUs Signed Trend Chart */}
              {viewType === 'mous' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🤝</span> MoUs Signed Per Year
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Timeline of research and industry collaboration agreements formalised through MoUs.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={mouTrendChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
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
                            value: 'Number of MoUs', 
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
                          name="MoUs Signed"
                          fill="#8b5cf6" 
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
                        <div style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '24px' }}>
                          {mouTrendChartData.reduce((sum, item) => sum + item.total, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total MoUs</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '24px' }}>
                          {mouTrendChartData.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {mouTrendChartData.length > 0 
                            ? Math.max(...mouTrendChartData.map(item => item.total)) 
                            : 0}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Peak Year Count</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Patents Trend Chart */}
              {viewType === 'patents' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📝</span> Patents Filed vs Granted (Year-wise)
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Stacked breakdown of innovation outputs across filing, granting, and publication stages.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={patentTrendChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
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
                            value: 'Number of Patents', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                          }}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                        {PATENT_STATUS_ORDER.map((status) => (
                          <Bar
                            key={status}
                            dataKey={status}
                            stackId="patents"
                            name={status}
                            fill={PATENT_COLORS[status]}
                            radius={status === 'Published' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
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
                          {patentTrendChartData.reduce((sum, item) => sum + item.Filed, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Filed</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {patentTrendChartData.reduce((sum, item) => sum + item.Granted, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Granted</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {patentTrendChartData.reduce((sum, item) => sum + item.Published, 0)}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Published</div>
                      </div>
                    </div>

                    {/* Patent Summary Cards */}
                    <div className="patent-summary-grid" style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '15px',
                      marginTop: '20px'
                    }}>
                      {patentOverall.map((item) => (
                        <div key={item.status} className="patent-summary-card" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <span style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            backgroundColor: item.color,
                            display: 'inline-block'
                          }} />
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>{item.status}</h4>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: item.color }}>{formatNumber(item.value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Directory Table */}
              {viewType === 'projectsTable' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📋</span> Key Research & Consultancy Projects
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Detailed snapshot of currently selected projects filtered by department, year, and status.
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
                        <tr style={{ backgroundColor: '#0ea5e9', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Principal Investigator</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Funding / Client</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Amount (₹)</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Timeline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectList.length === 0 && (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                              No projects match the selected filters.
                            </td>
                          </tr>
                        )}
                        {projectList.map((project, index) => (
                          <tr 
                            key={project.project_id}
                            style={{ 
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            <td style={{ padding: '12px', fontWeight: '500' }}>{project.project_title}</td>
                            <td style={{ padding: '12px' }}>{project.principal_investigator || '—'}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ 
                                backgroundColor: project.project_type === 'Consultancy' ? '#fef3c7' : '#e0e7ff',
                                color: project.project_type === 'Consultancy' ? '#92400e' : '#3730a3',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {project.project_type}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{project.department || '—'}</td>
                            <td style={{ padding: '12px' }}>{project.project_type === 'Consultancy' ? project.client_organization || '—' : project.funding_agency || '—'}</td>
                            <td style={{ padding: '12px', fontWeight: '500', color: '#059669' }}>{formatCurrency(project.amount_sanctioned || 0)}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ 
                                backgroundColor: project.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                color: project.status === 'Active' ? '#166534' : '#991b1b',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {project.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px' }}>
                              {formatDate(project.start_date)} → {formatDate(project.end_date)}
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '24px' }}>
                        {projectList.length}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Total Projects</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '24px' }}>
                        {projectList.filter(p => p.status === 'Active').length}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Active Projects</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                        {projectList.filter(p => p.project_type === 'Consultancy').length}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Consultancy Projects</div>
                    </div>
                  </div>
                </div>
              )}

              {/* MoUs Directory Table */}
              {viewType === 'mousTable' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🤝</span> Memoranda of Understanding (MoUs)
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Strategic collaborations powering research and innovation.
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
                        <tr style={{ backgroundColor: '#ec4899', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Partner</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Collaboration Focus</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Date Signed</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Validity</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mouList.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                              No MoUs found for the selected filters.
                            </td>
                          </tr>
                        )}
                        {mouList.map((mou, index) => (
                          <tr 
                            key={mou.mou_id}
                            style={{ 
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            <td style={{ padding: '12px', fontWeight: '500' }}>{mou.partner_name}</td>
                            <td style={{ padding: '12px' }}>{mou.collaboration_nature || '—'}</td>
                            <td style={{ padding: '12px' }}>{formatDate(mou.date_signed)}</td>
                            <td style={{ padding: '12px' }}>{formatDate(mou.validity_end)}</td>
                            <td style={{ padding: '12px', color: '#666' }}>{mou.remarks || '—'}</td>
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
                      <div style={{ color: '#ec4899', fontWeight: 'bold', fontSize: '24px' }}>
                        {mouList.length}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Total MoUs</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '24px' }}>
                        {new Set(mouList.map(m => new Date(m.date_signed).getFullYear())).size}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '24px' }}>
                        {mouList.filter(m => m.collaboration_nature).length}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>With Focus Area</div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Remove the separate tables sections since they're now integrated into the radio options */}
          </>
        )}
      </div>
      {/* Upload Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName={activeUploadTable}
        token={token}
      />
    </div>
  );
}

export default ResearchIcsrSection;