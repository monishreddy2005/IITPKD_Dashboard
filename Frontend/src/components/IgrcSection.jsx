import { useEffect, useState } from 'react';
import { useUploadRefresh } from '../hooks/useUploadRefresh';
import {
  ResponsiveContainer,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

import { fetchIgrcSummary, fetchIgrcYearly } from '../services/grievanceStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import { useNavigate } from 'react-router-dom';

const BAR_COLORS = {
  filed: '#667eea',
  resolved: '#43e97b',
  pending: '#fa709a'
};

const COMPLAINT_META = [
  { key: 'filed',    color: '#667eea', gradId: 'igrcFiled',    label: 'Filed'    },
  { key: 'resolved', color: '#43e97b', gradId: 'igrcResolved', label: 'Resolved' },
  { key: 'pending',  color: '#fa709a', gradId: 'igrcPending',  label: 'Pending'  },
];

function IgrcSection({ user, isPublicView = false }) {
  const navigate = useNavigate();

  const uploadVersion = useUploadRefresh();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [yearlyData, setYearlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [visibleMetrics, setVisibleMetrics] = useState({
    filed: true,
    resolved: true,
    pending: true
  });
  const [summary, setSummary] = useState({
    total: 0,
    resolved: 0,
    pending: 0
  });
  const [chartType, setChartType] = useState('Bar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [yearlyResponse, summaryResponse] = await Promise.all([
          fetchIgrcYearly(token),
          fetchIgrcSummary(token)
        ]);

        const igrcRows = yearlyResponse?.data || [];
        const formattedYearly = igrcRows.map((row) => ({
          year: row.grievance_year,
          filed: row.total_grievances_filed,
          resolved: row.grievances_resolved,
          pending: row.grievances_pending
        }));

        // Sort by year ascending for consistent dropdown order
        formattedYearly.sort((a, b) => a.year - b.year);
        setYearlyData(formattedYearly);

        const summaryData = summaryResponse?.data || {};
        setSummary({
          total: summaryData.total || 0,
          resolved: summaryData.resolved || 0,
          pending: summaryData.pending || 0
        });
      } catch (err) {
        console.error('Failed to load IGRC data:', err);
        setError(err.message || 'Failed to load IGRC data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, uploadVersion]);

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && (
          <button className="page-back-btn" onClick={() => navigate('/people-campus')}>
            ← Back to People & Campus
          </button>
        )}
        {!isPublicView && <h1>Internal Grievance Resolution Cell (IGRC)</h1>}

        {isPublicView ? null : user && user.role_id === 3 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              Upload Data
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading IGRC data...</p>
          </div>
        ) : (
          <>
            <h2 style={{ textDecoration: 'underline', color: '#000', marginBottom: '12px', fontSize: '20px' }}>
              Internal Grievance Resolution Cell (IGRC)
            </h2>

            {/* Bar / Trend toggle — sits just above the summary cards */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['Bar', 'Trend'].map(type => (
                <button key={type} type="button" onClick={() => setChartType(type)}
                  style={{
                    padding: '6px 20px', border: 'none', borderRadius: '20px',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                    transition: 'all 0.2s ease',
                    backgroundColor: chartType === type ? '#667eea' : '#f0f0f0',
                    color: chartType === type ? 'white' : '#555',
                    boxShadow: chartType === type ? '0 3px 10px rgba(102,126,234,0.35)' : 'none',
                  }}>
                  {type === 'Bar' ? 'Bar Chart' : 'Trend'}
                </button>
              ))}
            </div>

            {/* Modern Gradient Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Total Grievances Card - Purple Gradient */}
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
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>📋</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Total Grievances</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.total}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>All grievances filed</span>
                  </div>
                </div>
              </div>

              {/* Resolved Card - Green Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 20px rgba(67, 233, 123, 0.2)',
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
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>✅</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Resolved</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.resolved}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Successfully closed</span>
                  </div>
                </div>
              </div>

              {/* Pending Card - Pink Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #feca57 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 20px rgba(250, 112, 154, 0.2)',
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
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>⏳</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Pending</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.pending}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Currently in process</span>
                  </div>
                </div>
              </div>

              {/* Filter by Year Card - Purple Gradient */}
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
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>📅</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Filter by Year</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: '500',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="All" style={{ color: '#333' }}>All Years</option>
                      {yearlyData.map((row) => (
                        <option key={row.year} value={row.year} style={{ color: '#333' }}>
                          {row.year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Focus on a specific year</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h2 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '20px' }}>
                Internal Grievance Resolution Cell (IGRC)
              </h2>
              <div className="chart-header">
                <div>
                  <p className="chart-description">
                    Visual comparison of total grievances filed against resolutions and pending cases.
                  </p>
                </div>
                {/* Metric toggles (only for Bar) */}
                {chartType === 'Bar' && (
                  <div className="metric-toggle-group">
                    {['filed', 'resolved', 'pending'].map(key => (
                      <button key={key} type="button"
                        className={`metric-toggle ${visibleMetrics[key] ? 'active' : ''}`}
                        onClick={() => setVisibleMetrics(prev => {
                          const next = { ...prev, [key]: !prev[key] };
                          return Object.values(next).some(Boolean) ? next : prev;
                        })}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {yearlyData.length === 0 ? (
                <div className="no-data">No grievance records available.</div>
              ) : (
                <div className="chart-container">

                  {/* ── Bar Chart ── */}
                  {chartType === 'Bar' && (
                    <ResponsiveContainer width="100%" height={420}>
                      <BarChart
                        data={selectedYear === 'All' ? yearlyData : yearlyData.filter(r => String(r.year) === String(selectedYear))}
                        margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="year" stroke="#000"
                          tick={{ fill: '#000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#000', fontSize: 16, fontWeight: 'bold' } }} />
                        <YAxis stroke="#000"
                          tick={{ fill: '#000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Number of Grievances', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000', fontSize: 16, fontWeight: 'bold' } }} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }} cursor={{ fill: 'rgba(102,126,234,0.08)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                        {visibleMetrics.filed    && <Bar dataKey="filed"    name="Filed"    fill={BAR_COLORS.filed}    radius={[4,4,0,0]} />}
                        {visibleMetrics.resolved && <Bar dataKey="resolved" name="Resolved" fill={BAR_COLORS.resolved} radius={[4,4,0,0]} />}
                        {visibleMetrics.pending  && <Bar dataKey="pending"  name="Pending"  fill={BAR_COLORS.pending}  radius={[4,4,0,0]} />}
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {/* ── Trend Chart ── */}
                  {chartType === 'Trend' && (
                    <ResponsiveContainer width="100%" height={420}>
                      <AreaChart data={yearlyData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                        <defs>
                          {COMPLAINT_META.map(({ gradId, color }) => (
                            <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={color} stopOpacity={0.7} />
                              <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="year" stroke="#000"
                          tick={{ fill: '#000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#000', fontSize: 16, fontWeight: 'bold' } }} />
                        <YAxis stroke="#000"
                          tick={{ fill: '#000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Number of Grievances', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000', fontSize: 16, fontWeight: 'bold' } }} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }} />
                        <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px', fontWeight: 'bold' }} />
                        {COMPLAINT_META.map(({ key, color, gradId, label }) => (
                          <Area key={key} type="monotone" dataKey={key} name={label}
                            stroke={color} fill={`url(#${gradId})`} strokeWidth={2.5}
                            dot={{ r: 4, fill: color, strokeWidth: 0 }}
                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                            animationDuration={800} animationEasing="ease-in-out" />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
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
        tableName="igrs_yearwise"
        token={token}
      />
    </div>
  );
}

export default IgrcSection;