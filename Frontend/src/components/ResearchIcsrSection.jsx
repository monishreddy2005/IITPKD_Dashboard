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
  
  const crore = 10000000;
  const lakh = 100000;
  
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

  // Graph type selection with radio buttons
  const [viewType, setViewType] = useState('fundedProjects');

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
  }, [filters, token]);

  const projectTrendChartData = useMemo(() => {
    if (!projectTrend.length) return [];
    return projectTrend.map((row) => ({
      year: row.year,
      funded: Number(row.funded) || 0,
      consultancy: Number(row.consultancy) || 0
    }));
  }, [projectTrend]);

  const consultancyTrendChartData = useMemo(() => {
    if (!consultancyTrend.length) return [];
    return consultancyTrend.map((row) => ({
      year: row.year,
      funded_revenue: Number(row.funded_revenue) || 0,
      consultancy_revenue: Number(row.consultancy_revenue) || 0
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
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Track externally funded and consultancy projects, partnership MoUs, and innovation outcomes through patents
          filed and granted under IIT Palakkad&apos;s ICSR portfolio.
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
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '30px'
        }}>
          {/* Total Sanctioned Projects Card */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '70px',
              height: '70px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '6px' }}>📊</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '21px', fontWeight: '500' }}>Total Projects</span>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                {formatNumber(summary.total_projects)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>Funded + Consultancy</span>
              </div>
            </div>
          </div>

          {/* Externally Funded Projects Card */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '70px',
              height: '70px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '6px' }}>🎯</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '21px', fontWeight: '500' }}>Funded Projects</span>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                {formatNumber(summary.funded_projects)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>Active + completed</span>
              </div>
            </div>
          </div>

          {/* Consultancy Projects Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 8px 16px rgba(249, 115, 22, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '70px',
              height: '70px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '6px' }}>💼</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '21px', fontWeight: '500' }}>Consultancy</span>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                {formatNumber(summary.consultancy_projects)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>Client engagements</span>
              </div>
            </div>
          </div>

          {/* Consultancy Revenue Card */}
          <div style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 8px 16px rgba(20, 184, 166, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '70px',
              height: '70px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '6px' }}>💰</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '21px', fontWeight: '500' }}>Revenue</span>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                {(() => {
                  const scaled = formatScaledCurrency(summary.consultancy_revenue);
                  return (
                    <>
                      ₹{scaled.value}
                      {scaled.unit && <span style={{ fontSize: '12px', marginLeft: '2px' }}>{scaled.unit}</span>}
                    </>
                  );
                })()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>Sanctioned amount</span>
              </div>
            </div>
          </div>

          {/* Partnership MoUs Card */}
          <div style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 8px 16px rgba(168, 85, 247, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '70px',
              height: '70px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '6px' }}>🤝</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '21px', fontWeight: '500' }}>MoUs Signed</span>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                {formatNumber(summary.total_mous)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>Collaborations</span>
              </div>
            </div>
          </div>

          {/* Patents Card */}
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '70px',
              height: '70px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '6px' }}>📝</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '21px', fontWeight: '500' }}>Patents</span>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                {formatNumber(summary.patent_breakdown.Filed)} / {formatNumber(summary.patent_breakdown.Granted)} / {formatNumber(summary.patent_breakdown.Published)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', background: '#4ade80', borderRadius: '50%' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>Filed/Granted/Published</span>
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
                    onClick={() => { setActiveUploadTable('icsr_consultancy_projects'); setIsUploadModalOpen(true); }}
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
                    Upload Consultancy Projects
                  </button>
                  <button
                    className="upload-data-btn"
                    onClick={() => { setActiveUploadTable('icsr_sponsered_projects'); setIsUploadModalOpen(true); }}
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
                    Upload Sponsored Projects
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
              gap: '10px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'fundedProjects' ? '#4f46e5' : 'white',
                color: viewType === 'fundedProjects' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'fundedProjects' ? '2px solid #4f46e5' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="fundedProjects"
                  checked={viewType === 'fundedProjects'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#4f46e5',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'fundedProjects' ? 'bold' : 'normal', fontSize: '13px' }}>
                  📊 Funded Projects
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
                <span style={{ fontWeight: viewType === 'consultancyRevenue' ? 'bold' : 'normal', fontSize: '13px' }}>
                  💰 Consultancy Revenue
                </span>
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'mous' ? '#a855f7' : 'white',
                color: viewType === 'mous' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'mous' ? '2px solid #a855f7' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="mous"
                  checked={viewType === 'mous'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ 
                    accentColor: '#a855f7',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'mous' ? 'bold' : 'normal', fontSize: '13px' }}>
                  🤝 MoUs Trend
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
                <span style={{ fontWeight: viewType === 'patents' ? 'bold' : 'normal', fontSize: '13px' }}>
                  📝 Patents Trend
                </span>
              </label>

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
                <span style={{ fontWeight: viewType === 'projectsTable' ? 'bold' : 'normal', fontSize: '13px' }}>
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
                <span style={{ fontWeight: viewType === 'mousTable' ? 'bold' : 'normal', fontSize: '13px' }}>
                  📋 MoUs Directory
                </span>
              </label>
            </div>
          </div>

          <div className="filter-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '12px' 
          }}>
            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Department</label>
              <select
                className="filter-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                style={{ padding: '6px', fontSize: '13px' }}
              >
                <option value="All">All</option>
                {filterOptions.project_departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Project Year</label>
              <select
                className="filter-select"
                value={filters.project_year}
                onChange={(e) => handleFilterChange('project_year', e.target.value)}
                style={{ padding: '6px', fontSize: '13px' }}
              >
                <option value="All">All</option>
                {filterOptions.project_years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Project Type</label>
              <select
                className="filter-select"
                value={filters.project_type}
                onChange={(e) => handleFilterChange('project_type', e.target.value)}
                style={{ padding: '6px', fontSize: '13px' }}
              >
                <option value="All">All</option>
                {filterOptions.project_types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Project Status</label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{ padding: '6px', fontSize: '13px' }}
              >
                <option value="All">All</option>
                {filterOptions.project_statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>MoU Year</label>
              <select
                className="filter-select"
                value={filters.mou_year}
                onChange={(e) => handleFilterChange('mou_year', e.target.value)}
                style={{ padding: '6px', fontSize: '13px' }}
              >
                <option value="All">All</option>
                {filterOptions.mou_years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Patent Year</label>
              <select
                className="filter-select"
                value={filters.patent_year}
                onChange={(e) => handleFilterChange('patent_year', e.target.value)}
                style={{ padding: '6px', fontSize: '13px' }}
              >
                <option value="All">All</option>
                {filterOptions.patent_years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Patent Status</label>
              <select
                className="filter-select"
                value={filters.patent_status}
                onChange={(e) => handleFilterChange('patent_status', e.target.value)}
                style={{ padding: '6px', fontSize: '13px' }}
              >
                <option value="All">All</option>
                {filterOptions.patent_statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
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
            {filters.project_year !== 'All' && <span style={{ marginRight: '8px' }}>📅 {filters.project_year}</span>}
            {filters.project_type !== 'All' && <span style={{ marginRight: '8px' }}>📋 {filters.project_type}</span>}
            {filters.status !== 'All' && <span style={{ marginRight: '8px' }}>⚡ {filters.status}</span>}
            {filters.mou_year !== 'All' && <span style={{ marginRight: '8px' }}>🤝 {filters.mou_year}</span>}
            {filters.patent_year !== 'All' && <span style={{ marginRight: '8px' }}>📝 {filters.patent_year}</span>}
            {filters.patent_status !== 'All' && <span style={{ marginRight: '8px' }}>📌 {filters.patent_status}</span>}
            {filters.department === 'All' && filters.project_year === 'All' && filters.project_type === 'All' && 
             filters.status === 'All' && filters.mou_year === 'All' && filters.patent_year === 'All' && 
             filters.patent_status === 'All' && 
              <span>No filters applied</span>
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
            {/* Single View Section based on radio selection */}
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
                      <span style={{ fontSize: '24px' }}>📊</span> Projects Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Annual count of sponsored and consultancy projects.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={projectTrendChartData} margin={{ top: 10, right: 20, left: 40, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                        <Bar 
                          dataKey="funded" 
                          name="Sponsored Projects" 
                          stackId="a" 
                          fill="#6366f1" 
                          radius={[0, 0, 4, 4]} 
                          barSize={40}
                        />
                        <Bar 
                          dataKey="consultancy" 
                          name="Consultancy Projects" 
                          stackId="a" 
                          fill="#22c55e" 
                          radius={[4, 4, 0, 0]} 
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Consultancy Revenue Trend Chart */}
              {viewType === 'consultancyRevenue' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>💰</span> Revenue Trend — Sponsored vs Consultancy
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Year-wise sanctioned revenue comparison (₹) from sponsored and consultancy projects.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={consultancyTrendChartData} margin={{ top: 10, right: 20, left: 50, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="plainline" />
                        <Line 
                          type="monotone" 
                          dataKey="funded_revenue" 
                          name="Sponsored Revenue"
                          stroke="#6366f1" 
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#6366f1' }}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="consultancy_revenue" 
                          name="Consultancy Revenue"
                          stroke="#22c55e" 
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#22c55e' }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* MoUs Trend Chart */}
              {viewType === 'mous' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🤝</span> MoUs Signed Per Year
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Research and industry collaboration agreements.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={mouTrendChartData} margin={{ top: 10, right: 20, left: 40, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="rect" wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="total" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Patents Trend Chart */}
              {viewType === 'patents' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📝</span> Patents Trend
                    </h2>
                    <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                      Year-wise patent filings and grants.
                    </p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={patentTrendChartData} margin={{ top: 10, right: 20, left: 40, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="rect" wrapperStyle={{ fontSize: '12px' }} />
                        {PATENT_STATUS_ORDER.map((status) => (
                          <Bar key={status} dataKey={status} stackId="patents" fill={PATENT_COLORS[status]} radius={status === 'Published' ? [4, 4, 0, 0] : [0, 0, 0, 0]} barSize={30} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Projects Directory Table */}
              {viewType === 'projectsTable' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📋</span> Projects Directory
                    </h2>
                    <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 0 0' }}>
                      {projectList.length} projects found
                    </p>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0ea5e9', color: 'white' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Title</th>
                          <th style={{ padding: '10px' }}>PI</th>
                          <th style={{ padding: '10px' }}>Type</th>
                          <th style={{ padding: '10px' }}>Dept</th>
                          <th style={{ padding: '10px' }}>Amount</th>
                          <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectList.map((p, i) => (
                          <tr key={p.project_id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                            <td style={{ padding: '8px' }}>{p.project_title}</td>
                            <td style={{ padding: '8px' }}>{p.principal_investigator}</td>
                            <td style={{ padding: '8px' }}>{p.project_type}</td>
                            <td style={{ padding: '8px' }}>{p.department}</td>
                            <td style={{ padding: '8px' }}>{formatCurrency(p.amount_sanctioned)}</td>
                            <td style={{ padding: '8px' }}>{p.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MoUs Directory Table */}
              {viewType === 'mousTable' && (
                <div>
                  <div className="chart-header" style={{ marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🤝</span> MoUs Directory
                    </h2>
                    <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 0 0' }}>
                      {mouList.length} MoUs found
                    </p>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ec4899', color: 'white' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Partner</th>
                          <th style={{ padding: '10px' }}>Focus</th>
                          <th style={{ padding: '10px' }}>Signed</th>
                          <th style={{ padding: '10px' }}>Valid Till</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mouList.map((m, i) => (
                          <tr key={m.mou_id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                            <td style={{ padding: '8px' }}>{m.partner_name}</td>
                            <td style={{ padding: '8px' }}>{m.collaboration_nature}</td>
                            <td style={{ padding: '8px' }}>{formatDate(m.date_signed)}</td>
                            <td style={{ padding: '8px' }}>{formatDate(m.validity_end)}</td>
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