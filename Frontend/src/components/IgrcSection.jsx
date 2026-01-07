import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { fetchIgrcSummary, fetchIgrcYearly } from '../services/grievanceStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const BAR_COLORS = {
  filed: '#667eea',
  resolved: '#43e97b',
  pending: '#fa709a'
};

function IgrcSection({ user, isPublicView = false }) {
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
  }, [token]);

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>Internal Grievance Resolution Cell (IGRC)</h1>}
        <p>
          Track how grievances have been filed, resolved, and remain pending across the years for the Institute
          Grievance Resolution Cell.
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
            <p>Loading IGRC data...</p>
          </div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Grievances</h3>
                <p className="summary-value">{summary.total}</p>
                <span className="summary-subtitle">All grievances filed to date</span>
              </div>
              <div className="summary-card">
                <h3>Resolved</h3>
                <p className="summary-value accent-success">{summary.resolved}</p>
                <span className="summary-subtitle">Grievances successfully closed</span>
              </div>
              <div className="summary-card">
                <h3>Pending</h3>
                <p className="summary-value accent-warning">{summary.pending}</p>
                <span className="summary-subtitle">Grievances currently in process</span>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Year-wise Grievance Trend</h2>
                  <p className="chart-description">
                    Visual comparison of total grievances filed against resolutions and pending cases.
                  </p>
                </div>
              </div>

              {yearlyData.length === 0 ? (
                <div className="no-data">No grievance records available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                        cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="filed" name="Filed" fill={BAR_COLORS.filed} />
                      <Bar dataKey="resolved" name="Resolved" fill={BAR_COLORS.resolved} />
                      <Bar dataKey="pending" name="Pending" fill={BAR_COLORS.pending} />
                    </BarChart>
                  </ResponsiveContainer>
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

