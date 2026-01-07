import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  fetchNptelSummary,
  fetchNptelEnrollmentsOverTime,
  fetchNptelCourseCategories,
  fetchNptelCertificationRatio
} from '../services/outreachExtensionStats';
import './Page.css';
import './AcademicSection.css';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

const COLORS = ['#4f46e5', '#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15', '#fb7185', '#14b8a6', '#ec4899', '#8b5cf6'];

function NptelSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');
  const token = localStorage.getItem('authToken');

  const [summary, setSummary] = useState({
    total_courses: 0,
    total_enrollments: 0,
    certifications_completed: 0,
    local_chapters: 0
  });

  const [enrollmentsOverTime, setEnrollmentsOverTime] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [certificationRatio, setCertificationRatio] = useState({
    total_enrollments: 0,
    certified: 0,
    not_certified: 0,
    certification_rate: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchNptelSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  // Load enrollments over time
  useEffect(() => {
    const loadEnrollmentsOverTime = async () => {
      if (!token) return;
      try {
        const result = await fetchNptelEnrollmentsOverTime(token);
        setEnrollmentsOverTime(result.enrollments_over_time || []);
      } catch (err) {
        console.error('Error loading enrollments over time:', err);
      }
    };
    loadEnrollmentsOverTime();
  }, [token]);

  // Load course categories
  useEffect(() => {
    const loadCourseCategories = async () => {
      if (!token) return;
      try {
        const result = await fetchNptelCourseCategories(token);
        setCourseCategories(result.categories || []);
      } catch (err) {
        console.error('Error loading course categories:', err);
      }
    };
    loadCourseCategories();
  }, [token]);

  // Load certification ratio
  useEffect(() => {
    const loadCertificationRatio = async () => {
      if (!token) return;
      try {
        const data = await fetchNptelCertificationRatio(token);
        setCertificationRatio(data);
      } catch (err) {
        console.error('Error loading certification ratio:', err);
      }
    };
    loadCertificationRatio();
  }, [token]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1>NPTEL – CCE</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1>NPTEL – CCE</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const certificationData = [
    { name: 'Certified', value: certificationRatio.certified },
    { name: 'Not Certified', value: certificationRatio.not_certified }
  ];

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>NPTEL – CCE (Centre for Continuing Education)</h1>}

        {/* Summary Tiles */}
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Courses Offered</h3>
            <p className="summary-value">{formatNumber(summary.total_courses)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Enrollments</h3>
            <p className="summary-value">{formatNumber(summary.total_enrollments)}</p>
          </div>
          <div className="summary-card">
            <h3>Certifications Completed</h3>
            <p className="summary-value">{formatNumber(summary.certifications_completed)}</p>
          </div>
          <div className="summary-card">
            <h3>Local Chapters</h3>
            <p className="summary-value">{formatNumber(summary.local_chapters)}</p>
          </div>
        </div>

        {/* Enrollments Over Time */}
        {enrollmentsOverTime.length > 0 && (
          <div className="chart-section">
            <h2>Enrollments Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="enrollment_year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_enrollments" stroke="#4f46e5" name="Total Enrollments" />
                <Line type="monotone" dataKey="certifications" stroke="#22c55e" name="Certifications" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Course Category Breakdown */}
        {courseCategories.length > 0 && (
          <div className="chart-section">
            <h2>Course Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={courseCategories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {courseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Certification Ratio */}
        {certificationRatio.total_enrollments > 0 && (
          <div className="chart-section">
            <h2>Certification Ratio</h2>
            <div style={{ marginBottom: '1rem' }}>
              <p>
                <strong>Certification Rate:</strong> {certificationRatio.certification_rate}%
              </p>
              <p>
                <strong>Total Enrollments:</strong> {formatNumber(certificationRatio.total_enrollments)}
              </p>
              <p>
                <strong>Certified:</strong> {formatNumber(certificationRatio.certified)}
              </p>
              <p>
                <strong>Not Certified:</strong> {formatNumber(certificationRatio.not_certified)}
              </p>
            </div>
            {isPublicView ? null : (user && user.role_id === 3 && (
              <div className="upload-buttons-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="upload-data-btn"
                  onClick={() => { setActiveUploadTable('nptel_local_chapters'); setIsUploadModalOpen(true); }}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Upload Local Chapters
                </button>
                <button
                  className="upload-data-btn"
                  onClick={() => { setActiveUploadTable('nptel_courses'); setIsUploadModalOpen(true); }}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Upload Courses
                </button>
                <button
                  className="upload-data-btn"
                  onClick={() => { setActiveUploadTable('nptel_enrollments'); setIsUploadModalOpen(true); }}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Upload Enrollments
                </button>
              </div>
            ))}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={certificationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {certificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#f97316'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
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

export default NptelSection;

