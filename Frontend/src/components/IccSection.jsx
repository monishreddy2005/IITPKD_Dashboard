import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { fetchIccSummary, fetchIccYearly } from '../services/grievanceStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const AREA_COLORS = {
  total: '#667eea',
  resolved: '#43e97b',
  pending: '#fa709a'
};

function IccSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [yearlyData, setYearlyData] = useState([]);
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
  }, [token]);

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>Internal Complaints Committee (ICC)</h1>}
        <p>
          Monitor the yearly trend of sexual harassment complaints received by the ICC and track their resolution
          status.
        </p>

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
            <p>Loading ICC data...</p>
          </div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Complaints</h3>
                <p className="summary-value">{summary.total}</p>
                <span className="summary-subtitle">Complaints received over the years</span>
              </div>
              <div className="summary-card">
                <h3>Resolved</h3>
                <p className="summary-value accent-success">{summary.resolved}</p>
                <span className="summary-subtitle">Complaints resolved by the ICC</span>
              </div>
              <div className="summary-card">
                <h3>Pending</h3>
                <p className="summary-value accent-warning">{summary.pending}</p>
                <span className="summary-subtitle">Complaints currently under review</span>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Year-wise Complaint Trend</h2>
                  <p className="chart-description">
                    Overview of total complaints vis-à-vis resolved and pending cases.
                  </p>
                </div>
              </div>

              {yearlyData.length === 0 ? (
                <div className="no-data">No complaint records available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <AreaChart data={yearlyData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={AREA_COLORS.total} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={AREA_COLORS.total} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={AREA_COLORS.resolved} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={AREA_COLORS.resolved} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={AREA_COLORS.pending} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={AREA_COLORS.pending} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                        cursor={{ strokeDasharray: '4 2', stroke: '#667eea' }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke={AREA_COLORS.total}
                        fill="url(#colorTotal)"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        name="Resolved"
                        stroke={AREA_COLORS.resolved}
                        fill="url(#colorResolved)"
                      />
                      <Area
                        type="monotone"
                        dataKey="pending"
                        name="Pending"
                        stroke={AREA_COLORS.pending}
                        fill="url(#colorPending)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grievance-table-wrapper">
              <div className="chart-header">
                <div>
                  <h2>Yearly Complaint Statistics</h2>
                  <p className="chart-description">
                    Detailed breakdown of total complaints and their resolution status.
                  </p>
                </div>
              </div>

              {yearlyData.length === 0 ? (
                <div className="no-data">No records available to display.</div>
              ) : (
                <div className="table-responsive">
                  <table className="grievance-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Total Complaints</th>
                        <th>Resolved</th>
                        <th>Pending</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((row) => {
                        const statusLabel =
                          row.pending === 0 ? (
                            <span className="status-pill resolved">All Resolved</span>
                          ) : row.resolved === 0 ? (
                            <span className="status-pill pending">All Pending</span>
                          ) : (
                            <span className="status-pill mixed">Mixed</span>
                          );

                        return (
                          <tr key={row.year}>
                            <td>{row.year}</td>
                            <td>{row.total}</td>
                            <td>{row.resolved}</td>
                            <td>{row.pending}</td>
                            <td>{statusLabel}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
        tableName="icc_yearwise"
        token={token}
      />
    </div>
  );
}

export default IccSection;

