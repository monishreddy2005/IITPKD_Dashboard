import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  fetchOpenHouseSummary,
  fetchOpenHouseList,
  fetchOpenHouseTimeline
} from '../services/outreachExtensionStats';
import './Page.css';
import './AcademicSection.css';
import DataUploadModal from './DataUploadModal';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function OpenHouseSection({ user }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const token = localStorage.getItem('authToken');

  const [summary, setSummary] = useState({
    total_events: 0,
    total_visitors: 0,
    departments_participated: 0
  });

  const [timeline, setTimeline] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    year: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchOpenHouseSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  // Load timeline data
  useEffect(() => {
    const loadTimeline = async () => {
      if (!token) return;
      try {
        const result = await fetchOpenHouseTimeline(token);
        setTimeline(result.timeline || []);
      } catch (err) {
        console.error('Error loading timeline:', err);
      }
    };
    loadTimeline();
  }, [token]);

  // Load events list
  useEffect(() => {
    const loadEvents = async () => {
      if (!token) return;
      try {
        const result = await fetchOpenHouseList(
          token,
          pagination.page,
          pagination.per_page,
          filters.search,
          filters.year || null
        );
        setEventsList(result.events || []);
        setPagination(result.pagination || pagination);
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };
    loadEvents();
  }, [token, pagination.page, pagination.per_page, filters.search, filters.year]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleYearChange = (e) => {
    setFilters(prev => ({ ...prev, year: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && eventsList.length === 0) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1>Open House</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1>Open House</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Open House – Faculty Coordinator</h1>

        {user && user.role_id === 3 && (
          <div className="upload-buttons-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Upload Open House Data
            </button>
          </div>
        )}

        {/* Summary Tiles */}
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Open House Events</h3>
            <p className="summary-value">{formatNumber(summary.total_events)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Visitors</h3>
            <p className="summary-value">{formatNumber(summary.total_visitors)}</p>
          </div>
          <div className="summary-card">
            <h3>Participating Departments</h3>
            <p className="summary-value">{formatNumber(summary.departments_participated)}</p>
          </div>
        </div>

        {/* Event Timeline Chart */}
        {timeline.length > 0 && (
          <div className="chart-section">
            <h2>Event Timeline</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event_year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="event_count" stroke="#4f46e5" name="Events" />
                <Line type="monotone" dataKey="total_visitors" stroke="#22c55e" name="Visitors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Participation Trends Chart */}
        {timeline.length > 0 && (
          <div className="chart-section">
            <h2>Participation Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event_year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_departments" fill="#0ea5e9" name="Avg. Departments" />
                <Bar dataKey="total_visitors" fill="#f97316" name="Total Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Events Table */}
        <div className="chart-section">
          <h2>Open House Events</h2>

          {/* Filters */}
          <div className="filters-section">
            <input
              type="text"
              placeholder="Search by theme, audience, or departments..."
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <input
              type="number"
              placeholder="Filter by year..."
              value={filters.year}
              onChange={handleYearChange}
              className="search-input"
              style={{ width: '150px' }}
            />
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Date</th>
                  <th>Theme</th>
                  <th>Target Audience</th>
                  <th>Departments</th>
                  <th>Visitors</th>
                  <th>Key Highlights</th>
                  <th>Images</th>
                </tr>
              </thead>
              <tbody>
                {eventsList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No events found
                    </td>
                  </tr>
                ) : (
                  eventsList.map((event) => (
                    <tr key={event.event_id}>
                      <td>{event.event_year}</td>
                      <td>{new Date(event.event_date).toLocaleDateString()}</td>
                      <td>{event.theme || '-'}</td>
                      <td>{event.target_audience || '-'}</td>
                      <td>{event.departments_participated || '-'}</td>
                      <td>{formatNumber(event.total_visitors)}</td>
                      <td>{event.key_highlights || '-'}</td>
                      <td>
                        {event.photos_url ? (
                          <a href={event.photos_url} target="_blank" rel="noopener noreferrer">
                            View Images
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName="open_house"
        token={token}
      />
    </div>
  );
}

export default OpenHouseSection;

