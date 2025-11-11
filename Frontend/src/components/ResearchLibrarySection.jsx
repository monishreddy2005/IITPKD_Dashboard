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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  fetchResearchFilterOptions,
  fetchPublicationSummary,
  fetchPublicationTrend,
  fetchPublicationDepartmentBreakdown,
  fetchPublicationTypeDistribution,
  fetchPublicationList
} from '../services/researchStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './ResearchSection.css';

const TYPE_COLORS = ['#6366f1', '#22d3ee', '#f97316', '#a855f7', '#14b8a6', '#facc15'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const formatDateYear = (year) => {
  if (!year || Number.isNaN(Number(year))) return '—';
  return year;
};

function ResearchLibrarySection() {
  const [filterOptions, setFilterOptions] = useState({
    publication_departments: [],
    publication_years: [],
    publication_types: []
  });

  const [filters, setFilters] = useState({
    department: 'All',
    publication_year: 'All',
    publication_type: 'All'
  });

  const [summary, setSummary] = useState({
    total: 0,
    by_type: {},
    latest_year: null
  });

  const [trendData, setTrendData] = useState([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);
  const [publicationList, setPublicationList] = useState([]);

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
          publication_departments: Array.isArray(options?.publication_departments)
            ? options.publication_departments
            : [],
          publication_years: Array.isArray(options?.publication_years)
            ? [...options.publication_years].sort((a, b) => b - a)
            : [],
          publication_types: Array.isArray(options?.publication_types)
            ? options.publication_types
            : []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch publication filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadLibraryData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const [summaryResp, trendResp, deptResp, typeResp, listResp] = await Promise.all([
          fetchPublicationSummary(filters, token),
          fetchPublicationTrend(filters, token),
          fetchPublicationDepartmentBreakdown(filters, token),
          fetchPublicationTypeDistribution(filters, token),
          fetchPublicationList(filters, token)
        ]);

        setSummary({
          total: summaryResp?.total || 0,
          by_type: summaryResp?.by_type || {},
          latest_year: summaryResp?.latest_year || null
        });
        setTrendData(trendResp?.data || []);
        setDepartmentBreakdown(deptResp?.data || []);
        setTypeDistribution(typeResp?.data || []);
        setPublicationList(listResp?.data || []);
      } catch (err) {
        console.error('Failed to load library analytics:', err);
        setError(err.message || 'Failed to load library analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadLibraryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const trendChartData = useMemo(() => {
    if (!trendData.length) return [];
    return trendData.map((row) => ({
      year: row.year,
      publications: Number(row.total) || 0
    }));
  }, [trendData]);

  const departmentChartData = useMemo(() => {
    if (!departmentBreakdown.length) return [];
    return departmentBreakdown.map((row) => ({
      department: row.department || 'Unspecified',
      total: Number(row.total) || 0
    }));
  }, [departmentBreakdown]);

  const typePieData = useMemo(() => {
    if (!typeDistribution.length) return [];
    return typeDistribution.map((row) => ({
      name: row.publication_type,
      value: Number(row.total) || 0
    }));
  }, [typeDistribution]);

  const participatingDepartments = useMemo(
    () => departmentBreakdown.filter((row) => (row.total || 0) > 0).length,
    [departmentBreakdown]
  );

  const journalVsConference = useMemo(() => {
    const journal = summary.by_type?.Journal || 0;
    const conference = summary.by_type?.Conference || 0;
    return `${formatNumber(journal)} / ${formatNumber(conference)}`;
  }, [summary.by_type]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      publication_year: 'All',
      publication_type: 'All'
    });
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Research · Library & Scholarly Outputs</h1>
        <p>
          Explore the institute&apos;s research publications across journals, conferences, and scholarly formats with
          granular filters by department and year.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-panel">
          <div className="filter-header">
            <h2>Filters</h2>
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="library-dept-filter">Department</label>
              <select
                id="library-dept-filter"
                className="filter-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.publication_departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="library-year-filter">Publication Year</label>
              <select
                id="library-year-filter"
                className="filter-select"
                value={filters.publication_year}
                onChange={(e) => handleFilterChange('publication_year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.publication_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="library-type-filter">Publication Type</label>
              <select
                id="library-type-filter"
                className="filter-select"
                value={filters.publication_type}
                onChange={(e) => handleFilterChange('publication_type', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.publication_types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Publications</h3>
            <p className="summary-value">{formatNumber(summary.total)}</p>
            <span className="summary-subtitle">Filtered scholarly outputs</span>
          </div>
          <div className="summary-card">
            <h3>Latest Reporting Year</h3>
            <p className="summary-value">{formatDateYear(summary.latest_year)}</p>
            <span className="summary-subtitle">Most recent publication year available</span>
          </div>
          <div className="summary-card">
            <h3>Departments Contributing</h3>
            <p className="summary-value">{formatNumber(participatingDepartments)}</p>
            <span className="summary-subtitle">Active departments in selection</span>
          </div>
          <div className="summary-card">
            <h3>Journal vs Conference (J/C)</h3>
            <p className="summary-value">{journalVsConference}</p>
            <span className="summary-subtitle">Publication mix for current filters</span>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading publication analytics…</p>
          </div>
        )}

        {!loading && (
          <>
            <section className="chart-section">
              <div className="chart-header">
                <h2>Year-wise Publication Trend</h2>
                <p className="chart-description">
                  Longitudinal view of publications produced across the selected department and type filters.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="publications" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Department-wise Publications</h2>
                <p className="chart-description">
                  Departments ranked by number of publications under current filters.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="department" stroke="#9ca3af" tick={{ fontSize: 12 }} interval={0} angle={-20} dy={12} />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Publication Type Distribution</h2>
                <p className="chart-description">
                  Snapshot of publication formats (journal, conference, monographs, etc.) for the current selection.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Pie
                    data={typePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {typePieData.map((entry, index) => (
                      <Cell key={entry.name} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </section>

            <section className="grievance-table-wrapper">
              <h2>Publication Catalogue</h2>
              <p className="chart-description">
                Detailed list of publications satisfying the selected filters, including faculty and publication venue.
              </p>
              <div className="table-responsive">
                <table className="grievance-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Faculty</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Year</th>
                      <th>Journal / Venue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicationList.length === 0 && (
                      <tr>
                        <td colSpan={6}>No publications found for the selected filters.</td>
                      </tr>
                    )}
                    {publicationList.map((item) => (
                      <tr key={item.publication_id}>
                        <td>{item.publication_title}</td>
                        <td>{item.faculty_name || '—'}</td>
                        <td>{item.department || '—'}</td>
                        <td>{item.publication_type}</td>
                        <td>{formatDateYear(item.publication_year)}</td>
                        <td>{item.journal_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default ResearchLibrarySection;
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  fetchResearchFilterOptions,
  fetchPublicationSummary,
  fetchPublicationTrend,
  fetchPublicationByDepartment,
  fetchPublicationTypeDistribution,
  fetchPublicationList
} from '../services/researchModuleStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const TYPE_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#a855f7', '#0ea5e9'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function ResearchLibrarySection() {
  const [filterOptions, setFilterOptions] = useState({
    publication_departments: [],
    publication_years: [],
    publication_types: []
  });

  const [filters, setFilters] = useState({
    department: 'All',
    publication_year: 'All',
    publication_type: 'All'
  });

  const [summary, setSummary] = useState({
    total: 0,
    by_type: {},
    latest_year: null
  });
  const [trendData, setTrendData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);
  const [publicationList, setPublicationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const options = await fetchResearchFilterOptions(token);
        setFilterOptions({
          publication_departments: options?.publication_departments ?? [],
          publication_years: options?.publication_years ?? [],
          publication_types: options?.publication_types ?? []
        });
      } catch (err) {
        setError(err.message);
      }
    };

    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, trend, dept, typeDist, list] = await Promise.all([
          fetchPublicationSummary(filters, token),
          fetchPublicationTrend(filters, token),
          fetchPublicationByDepartment(filters, token),
          fetchPublicationTypeDistribution(filters, token),
          fetchPublicationList(filters, token)
        ]);

        setSummary(summaryData || { total: 0, by_type: {}, latest_year: null });
        setTrendData(trend || []);
        setDepartmentData(dept || []);
        setTypeDistribution(typeDist || []);
        setPublicationList(list || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, token]);

  const summaryCards = useMemo(() => {
    const entries = summary?.by_type ? Object.entries(summary.by_type) : [];
    return entries.map(([type, count], index) => ({
      type,
      count,
      color: TYPE_COLORS[index % TYPE_COLORS.length]
    }));
  }, [summary]);

  const pieData = useMemo(
    () => typeDistribution.map((item) => ({ name: item.publication_type, value: item.total })),
    [typeDistribution]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Research Library – Scholarly Publications</h1>
        <p>
          Explore publication outputs across journals, conferences, and scholarly works, with department-wise trends and
          publication mix insights.
        </p>

        <div className="section-filters">
          <div className="filter-group">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={filters.department} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.publication_departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="publication_year">Publication Year</label>
            <select id="publication_year" name="publication_year" value={filters.publication_year} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.publication_years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="publication_type">Publication Type</label>
            <select id="publication_type" name="publication_type" value={filters.publication_type} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.publication_types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading-indicator">Loading publication analytics...</div>}

        <div className="stats-summary-grid">
          <div className="stat-card accent">
            <span className="stat-label">Total Publications</span>
            <span className="stat-value">{formatNumber(summary.total)}</span>
            {summary.latest_year && <span className="stat-subtitle">Latest Year: {summary.latest_year}</span>}
          </div>
          {summaryCards.map((card) => (
            <div key={card.type} className="stat-card">
              <span className="stat-label">{card.type}</span>
              <span className="stat-value" style={{ color: card.color }}>
                {formatNumber(card.count)}
              </span>
            </div>
          ))}
        </div>

        <div className="chart-grid">
          <div className="chart-card wide">
            <h2>Publication Trend</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="Publications" stroke="#6366f1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card wide">
            <h2>Department-wise Publications</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="department" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Publications" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2>Publication Mix</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" label outerRadius={120}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2>Type Breakdown</h2>
            <div className="inline-stat-grid">
              {typeDistribution.length === 0 && <p>No data for the selected filters.</p>}
              {typeDistribution.map((item, index) => (
                <div key={item.publication_type} className="inline-stat-card">
                  <span className="inline-label">{item.publication_type}</span>
                  <span className="inline-value" style={{ color: TYPE_COLORS[index % TYPE_COLORS.length] }}>
                    {formatNumber(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h2>Publication Catalogue</h2>
          <div className="table-responsive">
            <table className="grievance-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Journal / Conference</th>
                  <th>Department</th>
                  <th>Faculty</th>
                  <th>Year</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {publicationList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No publications found for the selected filters.
                    </td>
                  </tr>
                )}
                {publicationList.map((item) => (
                  <tr key={item.publication_id}>
                    <td>{item.publication_title}</td>
                    <td>{item.journal_name || '—'}</td>
                    <td>{item.department || '—'}</td>
                    <td>{item.faculty_name || '—'}</td>
                    <td>{item.publication_year}</td>
                    <td>{item.publication_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResearchLibrarySection;

import './Page.css';

function ResearchLibrarySection() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Research · Library</h1>
        <p>Publication analytics and library metrics will be displayed here.</p>
        <p className="coming-soon">Implementation in progress…</p>
      </div>
    </div>
  );
}

export default ResearchLibrarySection;
