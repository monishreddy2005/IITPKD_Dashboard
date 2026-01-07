import { useState, useEffect, useMemo } from 'react';
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
  fetchInnovationSummary,
  fetchYearlyGrowth,
  fetchSectorDistribution,
  fetchStartups,
  fetchFilterOptions
} from '../services/innovationStats';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import DataUploadModal from './DataUploadModal';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];
const SECTOR_COLORS = ['#4f46e5', '#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15', '#fb7185', '#14b8a6'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function InnovationSection({ user }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const token = localStorage.getItem('authToken');
  const [isPublicViewMode, setIsPublicViewMode] = useState(false);

  // Determine effective public view state: true if user is public (role 1) OR explicitly toggled
  const isPublicView = user?.role_id === 1 || isPublicViewMode;

  const [summary, setSummary] = useState({
    total_incubatees: 0,
    total_startups: 0,
    total_innovation_projects: 0,
    startups_from_iitpkd: 0
  });

  const [yearlyGrowth, setYearlyGrowth] = useState([]);
  const [sectorDistribution, setSectorDistribution] = useState([]);
  const [startupsList, setStartupsList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    sectors: [],
    years: []
  });

  const [filters, setFilters] = useState({
    status: 'All',
    sector: 'All',
    year: 'All',
    iitpkd_only: false,
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
        const options = await fetchFilterOptions(token);
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
        const data = await fetchInnovationSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  // Load yearly growth
  useEffect(() => {
    const loadYearlyGrowth = async () => {
      if (!token) return;
      try {
        const result = await fetchYearlyGrowth(token);
        setYearlyGrowth(result.data || []);
      } catch (err) {
        console.error('Error loading yearly growth:', err);
      }
    };
    loadYearlyGrowth();
  }, [token]);

  // Load sector distribution
  useEffect(() => {
    const loadSectorDistribution = async () => {
      if (!token) return;
      try {
        const result = await fetchSectorDistribution(token);
        setSectorDistribution(result.data || []);
      } catch (err) {
        console.error('Error loading sector distribution:', err);
      }
    };
    loadSectorDistribution();
  }, [token]);

  // Load startups list
  useEffect(() => {
    const loadStartups = async () => {
      if (!token) return;
      try {
        const result = await fetchStartups(
          filters,
          pagination.page,
          pagination.per_page,
          token
        );
        setStartupsList(result.data || []);
        setPagination(result.pagination || pagination);
      } catch (err) {
        console.error('Error loading startups:', err);
      }
    };
    loadStartups();
  }, [filters, pagination.page, token]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset to page 1 when filters change
    if (field !== 'search') {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'All',
      sector: 'All',
      year: 'All',
      iitpkd_only: false,
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Chart data
  const yearlyChartData = useMemo(() => {
    return yearlyGrowth.map(row => ({
      year: row.year,
      incubatees: row.incubatees || 0,
      startups: row.startups || 0,
      innovationProjects: row.innovation_projects || 0
    }));
  }, [yearlyGrowth]);

  const sectorPieData = useMemo(() => {
    return sectorDistribution
      .filter(s => s.startups > 0 || s.projects > 0)
      .map(s => ({
        name: s.sector,
        value: s.startups + s.projects,
        startups: s.startups,
        projects: s.projects
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 sectors
  }, [sectorDistribution]);

  return (
    <div className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Innovation & Entrepreneurship</h1>

          {/* Public View Toggle for Admins */}
          {!isPublicView && user && user.role_id === 3 && (
            <button
              className="upload-data-btn"
              onClick={() => setIsPublicViewMode(true)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              View Public Page
            </button>
          )}

          {/* Back Button for Admins in Public Mode */}
          {isPublicViewMode && user && user.role_id === 3 && (
            <button
              className="upload-data-btn"
              onClick={() => setIsPublicViewMode(false)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              ← Back to Admin View
            </button>
          )}
        </div>
        <p>
          Track incubatees, startups, and innovation projects at TECHIN (Technology Innovation Foundation)
          and IPTIF (IIT Palakkad Technology IHub Foundation).
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Summary Cards */}
        <div className="summary-cards" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div className="summary-card">
            <div className="summary-card-label">Total Incubatees</div>
            <div className="summary-card-value">{formatNumber(summary.total_incubatees)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Total Startups</div>
            <div className="summary-card-value">{formatNumber(summary.total_startups)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Innovation Projects</div>
            <div className="summary-card-value">{formatNumber(summary.total_innovation_projects)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Startups from IIT Palakkad</div>
            <div className="summary-card-value">{formatNumber(summary.startups_from_iitpkd)}</div>
          </div>
        </div>

        {/* Yearly Growth Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h2>Year-wise Growth</h2>
            <p className="chart-description">Growth of incubatees, startups, and innovation projects over time.</p>
          </div>
          {yearlyChartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#cbd5f5" />
                  <YAxis stroke="#cbd5f5" />
                  <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                  <Legend />
                  <Line type="monotone" dataKey="incubatees" name="Incubatees" stroke="#667eea" strokeWidth={3} />
                  <Line type="monotone" dataKey="startups" name="Startups" stroke="#764ba2" strokeWidth={2} />
                  <Line type="monotone" dataKey="innovationProjects" name="Innovation Projects" stroke="#43e97b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">No yearly growth data available.</div>
          )}
        </div>

        {/* Sector Distribution Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h2>Sector-wise Innovation Distribution</h2>
            <p className="chart-description">Distribution of startups and innovation projects by sector.</p>
          </div>
          {sectorPieData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={sectorPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {sectorPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">No sector distribution data available.</div>
          )}
        </div>

        {/* Filters and Startups Table */}
        <div className="grievance-table-wrapper">
          <div className="chart-header">
            <h2>Startups Directory</h2>
            <p className="chart-description">Search and filter through all startups and incubatees.</p>
          </div>

          <div className="filter-panel">
            <div className="filter-header">
              <h3>Filters</h3>
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
            <div className="filter-grid">
              {isPublicView ? null : (user && user.role_id === 3 && (
                <div className="filter-group" style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                  <button
                    className="upload-data-btn"
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Upload Startups
                  </button>
                </div>
              ))}
              <div className="filter-group">
                <label>Status</label>
                <select
                  className="filter-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="All">All</option>
                  {filterOptions.statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Sector</label>
                <select
                  className="filter-select"
                  value={filters.sector}
                  onChange={(e) => handleFilterChange('sector', e.target.value)}
                >
                  <option value="All">All</option>
                  {filterOptions.sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
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
              <div className="filter-group">
                <label>
                  <input
                    type="checkbox"
                    checked={filters.iitpkd_only}
                    onChange={(e) => handleFilterChange('iitpkd_only', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  IIT Palakkad Only
                </label>
              </div>
              <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search by startup name, founder, or innovation area..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {startupsList.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="grievance-table">
                  <thead>
                    <tr>
                      <th>Startup Name</th>
                      <th>Founder</th>
                      <th>Innovation / Focus Area</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th>Sector</th>
                      <th>IIT Palakkad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {startupsList.map((startup) => (
                      <tr key={startup.startup_id}>
                        <td>{startup.startup_name}</td>
                        <td>{startup.founder_name}</td>
                        <td>{startup.innovation_focus_area || '—'}</td>
                        <td>{startup.year_of_incubation}</td>
                        <td>{startup.status}</td>
                        <td>{startup.sector || '—'}</td>
                        <td>{startup.is_from_iitpkd ? '✓ Yes' : 'No'}</td>
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
            <div className="no-data">No startups found for the selected filters.</div>
          )}
        </div>
      </div>

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName="startups"
        token={token}
      />
    </div >
  );
}

export default InnovationSection;

