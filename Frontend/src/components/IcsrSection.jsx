import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  fetchIcsrSummary,
  fetchIcsrYearlyDistribution,
  fetchIcsrEventTypes,
  fetchIcsrEvents,
  fetchIcsrFilterOptions
} from '../services/industryConnectStats';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const EVENT_TYPE_COLORS = ['#4f46e5', '#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15', '#fb7185', '#14b8a6', '#ec4899', '#8b5cf6'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function IcsrSection({ user, isPublicView = false }) {
  const token = localStorage.getItem('authToken');

  const [summary, setSummary] = useState({
    total_events: 0,
    departments_involved: 0
  });

  const [yearlyDistribution, setYearlyDistribution] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    event_types: [],
    departments: [],
    years: []
  });

  const [filters, setFilters] = useState({
    event_type: 'All',
    department: 'All',
    year: 'All',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) return;
      try {
        const options = await fetchIcsrFilterOptions(token);
        setFilterOptions(options);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadFilterOptions();
  }, [token]);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchIcsrSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  // Load yearly distribution
  useEffect(() => {
    const loadYearlyDistribution = async () => {
      if (!token) return;
      try {
        const result = await fetchIcsrYearlyDistribution(token);
        setYearlyDistribution(result.data || []);
      } catch (err) {
        console.error('Error loading yearly distribution:', err);
      }
    };
    loadYearlyDistribution();
  }, [token]);

  // Load event types distribution
  useEffect(() => {
    const loadEventTypes = async () => {
      if (!token) return;
      try {
        const result = await fetchIcsrEventTypes(token);
        setEventTypes(result.data || []);
      } catch (err) {
        console.error('Error loading event types:', err);
      }
    };
    loadEventTypes();
  }, [token]);

  // Load events list
  useEffect(() => {
    const loadEvents = async () => {
      if (!token) return;
      try {
        const result = await fetchIcsrEvents(
          filters,
          pagination.page,
          pagination.per_page,
          token
        );
        setEventsList(result.data || []);
        setPagination(result.pagination || pagination);
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };
    loadEvents();
  }, [filters, pagination.page, token]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      event_type: 'All',
      department: 'All',
      year: 'All',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Chart data
  const yearlyChartData = useMemo(() => {
    return yearlyDistribution.map(row => ({
      year: row.year,
      events: row.event_count || 0,
      departments: row.departments_count || 0
    }));
  }, [yearlyDistribution]);

  const eventTypesPieData = useMemo(() => {
    return eventTypes.map(row => ({
      name: row.event_type,
      value: row.count || 0
    }));
  }, [eventTypes]);

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>ICSR Section - Industry Interaction Events</h1>}
        <p>
          Track and analyze industry engagement events, workshops, seminars, and networking activities
          coordinated by the Industrial Consultancy & Sponsored Research (ICSR) section.
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Summary Cards */}
        <div className="summary-cards" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div className="summary-card">
            <div className="summary-card-label">Total Industry Events</div>
            <div className="summary-card-value">{formatNumber(summary.total_events)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Departments Involved</div>
            <div className="summary-card-value">{formatNumber(summary.departments_involved)}</div>
          </div>
        </div>

        {/* Year-wise Distribution Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <p className="chart-description">Distribution of industry events and participating departments over time.</p>
          </div>
          {yearlyChartData.length > 0 ? (
            <div className="chart-container">
              <h3 className="chart-heading">Year-wise Event Distribution</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#cbd5f5" />
                  <YAxis stroke="#cbd5f5" />
                  <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="rect" />
                  <Bar dataKey="events" name="Events" fill="#667eea" />
                  <Bar dataKey="departments" name="Departments" fill="#43e97b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">No yearly distribution data available.</div>
          )}
        </div>

        {/* Event Types Distribution Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <p className="chart-description">Frequency of different types of industry interaction events.</p>
          </div>
          {eventTypesPieData.length > 0 ? (
            <div className="chart-container">
              <h3 className="chart-heading">Event Types Distribution</h3>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={eventTypesPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {eventTypesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EVENT_TYPE_COLORS[index % EVENT_TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">No event types data available.</div>
          )}
        </div>

        {/* Events Table */}
        <div className="grievance-table-wrapper">
          <div className="chart-header">
            <h2>Industry Events Directory</h2>
            <p className="chart-description">Search and filter through all industry interaction events.</p>
          </div>

          <div className="chart-section">
            {/* Filter Panel */}
            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filters</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="clear-filters-btn" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                  {isPublicView ? null : (user && user.role_id === 3 && (
                    <button
                      className="upload-data-btn"
                      onClick={() => setIsUploadModalOpen(true)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      Upload Industry Events
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-grid">
              <div className="filter-group">
                <label>Event Type</label>
                <select
                  className="filter-select"
                  value={filters.event_type}
                  onChange={(e) => handleFilterChange('event_type', e.target.value)}
                >
                  <option value="All">All Types</option>
                  {filterOptions.event_types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Department</label>
                <select
                  className="filter-select"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <option value="All">All Departments</option>
                  {filterOptions.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Year</label>
                <select
                  className="filter-select"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="All">All Years</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search by event title, industry partner, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {eventsList.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="grievance-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Type</th>
                      <th>Industry Partner</th>
                      <th>Date</th>
                      <th>Duration (hrs)</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventsList.map((event) => (
                      <tr key={event.event_id}>
                        <td>{event.event_title}</td>
                        <td>{event.event_type}</td>
                        <td>{event.industry_partner || '—'}</td>
                        <td>{event.event_date ? new Date(event.event_date).toLocaleDateString() : '—'}</td>
                        <td>{event.duration_hours ? `${event.duration_hours}` : '—'}</td>
                        <td>{event.department || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '2rem'
                }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: pagination.page === 1 ? '#ccc' : '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.total_pages} ({formatNumber(pagination.total)} total)
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: pagination.page >= pagination.total_pages ? '#ccc' : '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: pagination.page >= pagination.total_pages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">No events found for the selected filters.</div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IcsrSection;

