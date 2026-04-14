import { useEffect, useState } from 'react';
import { useUploadRefresh } from '../hooks/useUploadRefresh';
import {
  ResponsiveContainer,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

import { fetchIccSummary, fetchIccYearly } from '../services/grievanceStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import { useNavigate } from 'react-router-dom';

const COMPLAINT_COLORS = {
  total:    '#667eea',
  resolved: '#43e97b',
  pending:  '#fa709a',
};

const BAR_META = [
  { key: 'total',    color: '#667eea', label: 'Total'    },
  { key: 'resolved', color: '#43e97b', label: 'Resolved' },
  { key: 'pending',  color: '#fa709a', label: 'Pending'  },
];

function IccSection({ user, isPublicView = false }) {
  const navigate = useNavigate();

  const uploadVersion = useUploadRefresh();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [yearlyData, setYearlyData] = useState([]);
  const [chartType, setChartType] = useState('Bar');
  const [activeView, setActiveView] = useState('chart'); // 'chart' | 'table'
  const [summary, setSummary] = useState({
    total: 0,
    resolved: 0,
    pending: 0
  });
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
          fetchIccYearly(token),
          fetchIccSummary(token)
        ]);

        const iccRows = yearlyResponse?.data || [];
        const formattedYearly = iccRows.map((row) => ({
          year: row.complaints_year,
          total: row.total_complaints,
          resolved: row.complaints_resolved,
          pending: row.complaints_pending
        }));
        formattedYearly.sort((a, b) => a.year - b.year);
        setYearlyData(formattedYearly);

        const summaryData = summaryResponse?.data || {};
        setSummary({
          total: summaryData.total || 0,
          resolved: summaryData.resolved || 0,
          pending: summaryData.pending || 0
        });
      } catch (err) {
        console.error('Failed to load ICC data:', err);
        setError(err.message || 'Failed to load ICC data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, uploadVersion]);

  // Calculate resolution rate
  // const resolutionRate = summary.total > 0 
  //   ? Math.round((summary.resolved / summary.total) * 100) 
  //   : 0;

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && (
          <button className="page-back-btn" onClick={() => navigate('/people-campus')}>
            ← Back to People & Campus
          </button>
        )}
        {!isPublicView && <h1>Internal Complaints Committee (ICC)</h1>}
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
            <p>Loading ICC data...</p>
          </div>
        ) : (
          <>
            <h2 style={{ textDecoration: 'underline', color: '#000', marginBottom: '12px', fontSize: '20px' }}>
              Internal Complaints Committee (ICC)
            </h2>

            {/* Bar / Trend toggle — above summary cards */}
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

            {/* Modern Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Total Complaints Card */}
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
                    <span style={{ fontSize: '34px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>📋</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '24px', fontWeight: '500' }}>Total Complaints</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.total}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Received over the years</span>
                  </div>
                </div>
              </div>

              {/* Resolved Complaints Card */}
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
                    <span style={{ fontSize: '34px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>✅</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '24px', fontWeight: '500' }}>Resolved</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.resolved}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Successfully resolved</span>
                  </div>
                </div>
              </div>

              {/* Pending Complaints Card */}
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
                    <span style={{ fontSize: '34px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>⏳</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '24px', fontWeight: '500' }}>Pending</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {summary.pending}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Under review</span>
                  </div>
                </div>
              </div>

            </div>



            {/* View selector for chart vs table */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '10px'
            }}>
              <button
                type="button"
                onClick={() => setActiveView('chart')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeView === 'chart' ? '#667eea' : '#f8f9fa',
                  color: activeView === 'chart' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeView === 'chart' ? '600' : '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📈</span> Trend View
              </button>
              <button
                type="button"
                onClick={() => setActiveView('table')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeView === 'table' ? '#667eea' : '#f8f9fa',
                  color: activeView === 'table' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeView === 'table' ? '600' : '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📊</span> Yearly Statistics
              </button>
            </div>

            {activeView === 'chart' && (
              <div className="chart-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '20px' }}>
                    Internal Complaints Committee (ICC)
                  </h2>
                  <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                    {chartType === 'Bar' ? 'Year-wise complaint breakdown' : 'Complaint count trend over years'}
                  </p>
                </div>

                {yearlyData.length === 0 ? (
                  <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                    <p style={{ color: '#666', fontSize: '16px' }}>No complaint records available.</p>
                  </div>
                ) : (
                  <div className="chart-container">

                    {/* ── Bar Chart: Total / Resolved / Pending ── */}
                    {chartType === 'Bar' && (
                      <ResponsiveContainer width="100%" height={380}>
                        <BarChart data={yearlyData} margin={{ top: 10, right: 20, left: 40, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="year" stroke="#000"
                            tick={{ fill: '#000', fontSize: 13, fontWeight: 'bold' }}
                            angle={-35} textAnchor="end" height={55} tickLine={false}
                            label={{ value: 'Year', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#000', fontSize: 14, fontWeight: 'bold' } }} />
                          <YAxis stroke="#000"
                            tick={{ fill: '#000', fontSize: 13, fontWeight: 'bold' }}
                            allowDecimals={false}
                            label={{ value: 'Number of Complaints', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000', fontSize: 14, fontWeight: 'bold' } }} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }} cursor={{ fill: 'rgba(102,126,234,0.08)' }} />
                          <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px', fontWeight: 'bold' }} />
                          {BAR_META.map(({ key, color, label }) => (
                            <Bar key={key} dataKey={key} name={label} fill={color} radius={[4, 4, 0, 0]}
                              isAnimationActive animationDuration={700} animationEasing="ease-out" />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* ── Trend Chart: complaints (total) only ── */}
                    {chartType === 'Trend' && (
                      <ResponsiveContainer width="100%" height={380}>
                        <AreaChart data={yearlyData} margin={{ top: 10, right: 20, left: 40, bottom: 40 }}>
                          <defs>
                            <linearGradient id="iccGradComplaints" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={COMPLAINT_COLORS.total} stopOpacity={0.72} />
                              <stop offset="95%" stopColor={COMPLAINT_COLORS.total} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="year" stroke="#000"
                            tick={{ fill: '#000', fontSize: 13, fontWeight: 'bold' }}
                            angle={-35} textAnchor="end" height={55} tickLine={false}
                            label={{ value: 'Year', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#000', fontSize: 14, fontWeight: 'bold' } }} />
                          <YAxis stroke="#000"
                            tick={{ fill: '#000', fontSize: 13, fontWeight: 'bold' }}
                            allowDecimals={false}
                            label={{ value: 'Number of Complaints', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000', fontSize: 14, fontWeight: 'bold' } }} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }} />
                          <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px', fontWeight: 'bold' }} />
                          <Area type="monotone" dataKey="total" name="Complaints"
                            stroke={COMPLAINT_COLORS.total} fill="url(#iccGradComplaints)"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: COMPLAINT_COLORS.total, strokeWidth: 0 }}
                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                            animationDuration={800} animationEasing="ease-in-out" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                  </div>
                )}
              </div>
            )}

            {activeView === 'table' && (
              <div className="chart-section" style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '20px' }}>
                      Yearly Complaint Statistics
                    </h2>
                    <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                      Detailed breakdown of total complaints and their resolution status.
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {yearlyData.length} Years
                  </span>
                </div>

                {yearlyData.length === 0 ? (
                  <div className="no-data" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
                    <p style={{ color: '#666', fontSize: '16px' }}>No records available to display.</p>
                  </div>
                ) : (
                  <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                          <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Year</th>
                          <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Total Complaints</th>
                          <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Resolved</th>
                          <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Pending</th>
                          <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyData.map((row, index) => {
                          const statusLabel =
                            row.pending === 0 ? (
                              <span style={{
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>All Resolved</span>
                            ) : row.resolved === 0 ? (
                              <span style={{
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>All Pending</span>
                            ) : (
                              <span style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>Mixed</span>
                            );

                          return (
                            <tr key={row.year} style={{
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0'
                            }}>
                              <td style={{ padding: '12px', fontWeight: '500' }}>{row.year}</td>
                              <td style={{ padding: '12px' }}>{row.total}</td>
                              <td style={{ padding: '12px', color: '#22c55e', fontWeight: '500' }}>{row.resolved}</td>
                              <td style={{ padding: '12px', color: '#f97316', fontWeight: '500' }}>{row.pending}</td>
                              <td style={{ padding: '12px' }}>{statusLabel}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName="icc_yearwise"
        token={token}
      />
    </div>
  );
}

export default IccSection;