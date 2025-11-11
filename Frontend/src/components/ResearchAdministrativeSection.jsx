import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

import {
  fetchResearchFilterOptions,
  fetchExternshipSummary,
  fetchExternshipList
} from '../services/researchStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './ResearchSection.css';

const TYPE_COLORS = ['#6366f1', '#22c55e', '#f97316', '#a855f7', '#14b8a6', '#0ea5e9', '#facc15'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

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

const formatDuration = (days) => {
  const numeric = Number(days);
  if (!Number.isFinite(numeric)) {
    return '—';
  }
  if (numeric <= 0) return `${numeric} days`;
  const months = numeric / 30;
  if (months >= 1) {
    return `${(months).toFixed(1)} months`;
  }
  return `${numeric} days`;
};

function ResearchAdministrativeSection() {
  const [filterOptions, setFilterOptions] = useState({
    externship_departments: [],
    externship_years: []
  });

  const [filters, setFilters] = useState({
    department: 'All',
    externship_year: 'All'
  });

  const [summary, setSummary] = useState({
    total: 0,
    yearly: [],
    department: []
  });
  const [externshipList, setExternshipList] = useState([]);

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
          externship_departments: Array.isArray(options?.externship_departments)
            ? options.externship_departments
            : [],
          externship_years: Array.isArray(options?.externship_years)
            ? [...options.externship_years].sort((a, b) => b - a)
            : []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch externship filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadExternshipData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const [summaryResp, listResp] = await Promise.all([
          fetchExternshipSummary(filters, token),
          fetchExternshipList(filters, token)
        ]);

        setSummary({
          total: summaryResp?.total || 0,
          yearly: Array.isArray(summaryResp?.yearly) ? summaryResp.yearly : [],
          department: Array.isArray(summaryResp?.department) ? summaryResp.department : []
        });
        setExternshipList(listResp?.data || []);
      } catch (err) {
        console.error('Failed to load externship analytics:', err);
        setError(err.message || 'Failed to load externship analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadExternshipData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const externshipTypeKeys = useMemo(() => {
    const keys = new Set();
    summary.yearly.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key !== 'year' && key !== 'total') {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [summary.yearly]);

  const yearlyChartData = useMemo(() => {
    if (!summary.yearly.length) return [];
    return summary.yearly.map((entry) => {
      const item = { year: entry.year, total: Number(entry.total) || 0 };
      externshipTypeKeys.forEach((key) => {
        item[key] = Number(entry[key]) || 0;
      });
      return item;
    });
  }, [summary.yearly, externshipTypeKeys]);

  const departmentChartData = useMemo(() => {
    if (!summary.department.length) return [];
    return summary.department.map((row) => ({
      department: row.department || 'Unspecified',
      total: Number(row.total) || 0
    }));
  }, [summary.department]);

  const typeTotals = useMemo(() => {
    const totals = {};
    summary.yearly.forEach((entry) => {
      externshipTypeKeys.forEach((key) => {
        totals[key] = (totals[key] || 0) + (Number(entry[key]) || 0);
      });
    });
    return totals;
  }, [summary.yearly, externshipTypeKeys]);

  const topType = useMemo(() => {
    let leader = null;
    let maxValue = -Infinity;
    Object.entries(typeTotals).forEach(([type, total]) => {
      if (total > maxValue) {
        leader = type;
        maxValue = total;
      }
    });
    return leader ? `${leader} (${formatNumber(maxValue)})` : '—';
  }, [typeTotals]);

  const participatingDepartments = useMemo(
    () => summary.department.filter((item) => (item.total || 0) > 0).length,
    [summary.department]
  );

  const activeYears = useMemo(() => summary.yearly.length, [summary.yearly]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      externship_year: 'All'
    });
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Research · Administrative (Industry Externships)</h1>
        <p>
          Monitor faculty participation in industry externship programmes and collaborations, segmented by department,
          engagement type, and year.
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
              <label htmlFor="externship-dept-filter">Department</label>
              <select
                id="externship-dept-filter"
                className="filter-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.externship_departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="externship-year-filter">Externship Year</label>
              <select
                id="externship-year-filter"
                className="filter-select"
                value={filters.externship_year}
                onChange={(e) => handleFilterChange('externship_year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.externship_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Externships</h3>
            <p className="summary-value">{formatNumber(summary.total)}</p>
            <span className="summary-subtitle">Completed with the selected filters</span>
          </div>
          <div className="summary-card">
            <h3>Participating Departments</h3>
            <p className="summary-value">{formatNumber(participatingDepartments)}</p>
            <span className="summary-subtitle">Distinct departments engaged</span>
          </div>
          <div className="summary-card">
            <h3>Timeline Coverage</h3>
            <p className="summary-value">{formatNumber(activeYears)}</p>
            <span className="summary-subtitle">Years of externship activity</span>
          </div>
          <div className="summary-card">
            <h3>Most Common Externship Type</h3>
            <p className="summary-value">{topType}</p>
            <span className="summary-subtitle">Aggregated across selected filters</span>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading externship analytics…</p>
          </div>
        )}

        {!loading && (
          <>
            <section className="chart-section">
              <div className="chart-header">
                <h2>Year-wise Industry Externships</h2>
                <p className="chart-description">
                  Distribution of externship engagements by type across the selected timeframe.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  {externshipTypeKeys.map((type, index) => (
                    <Bar
                      key={type}
                      dataKey={type}
                      stackId="externships"
                      fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                      radius={index === externshipTypeKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Department-wise Participation</h2>
                <p className="chart-description">
                  Departments ranked by the number of externships completed with industry partners.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="department" stroke="#9ca3af" tick={{ fontSize: 12 }} interval={0} angle={-20} dy={12} />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Bar dataKey="total" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="grievance-table-wrapper">
              <h2>Faculty–Industry Externship Roster</h2>
              <p className="chart-description">
                Detailed listing of faculty externships including industry partner, duration, and timeline.
              </p>
              <div className="table-responsive">
                <table className="grievance-table">
                  <thead>
                    <tr>
                      <th>Faculty</th>
                      <th>Department</th>
                      <th>Industry Partner</th>
                      <th>Externship Type</th>
                      <th>Duration</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {externshipList.length === 0 && (
                      <tr>
                        <td colSpan={7}>No externship records found for the selected filters.</td>
                      </tr>
                    )}
                    {externshipList.map((record) => (
                      <tr key={record.externship_id}>
                        <td>{record.faculty_name}</td>
                        <td>{record.department || '—'}</td>
                        <td>{record.industry_name || '—'}</td>
                        <td>{record.type || '—'}</td>
                        <td>{formatDuration(record.duration_days)}</td>
                        <td>{formatDate(record.startdate)}</td>
                        <td>{formatDate(record.enddate)}</td>
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

export default ResearchAdministrativeSection;
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from 'recharts';

import {
  fetchResearchFilterOptions,
  fetchExternshipSummary,
  fetchExternshipList
} from '../services/researchModuleStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const EXTERNSHIP_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#a855f7'];

function ResearchAdministrativeSection() {
  const [filterOptions, setFilterOptions] = useState({
    externship_departments: [],
    externship_years: []
  });

  const [filters, setFilters] = useState({
    department: 'All',
    externship_year: 'All'
  });

  const [summary, setSummary] = useState({
    total: 0,
    yearly: [],
    department: []
  });
  const [externshipList, setExternshipList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const options = await fetchResearchFilterOptions(token);
        setFilterOptions({
          externship_departments: options?.externship_departments ?? [],
          externship_years: options?.externship_years ?? []
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
        const [summaryData, listData] = await Promise.all([
          fetchExternshipSummary(filters, token),
          fetchExternshipList(filters, token)
        ]);
        setSummary(summaryData || { total: 0, yearly: [], department: [] });
        setExternshipList(listData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, token]);

  const yearlyKeys = useMemo(() => {
    const keys = new Set();
    (summary.yearly || []).forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key !== 'year' && key !== 'total') {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [summary.yearly]);

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
        <h1>Research Administrative – Industry Externships</h1>
        <p>
          Monitor faculty participation in industry externship programmes and collaboration immersions that strengthen
          academia-industry partnerships.
        </p>

        <div className="section-filters">
          <div className="filter-group">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={filters.department} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.externship_departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="externship_year">Year</label>
            <select id="externship_year" name="externship_year" value={filters.externship_year} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.externship_years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading-indicator">Loading externship analytics...</div>}

        <div className="stats-summary-grid">
          <div className="stat-card accent">
            <span className="stat-label">Total Externships</span>
            <span className="stat-value">{summary.total || 0}</span>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-card wide">
            <h2>Year-wise Externship Participation</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={summary.yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                {yearlyKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="externships"
                    name={key}
                    fill={EXTERNSHIP_COLORS[index % EXTERNSHIP_COLORS.length]}
                    radius={index === yearlyKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card wide">
            <h2>Department-wise Externship Footprint</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={summary.department}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="department" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Externships" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <h2>Recent Faculty-Industry Externships</h2>
          <div className="table-responsive">
            <table className="grievance-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Industry Partner</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration (days)</th>
                </tr>
              </thead>
              <tbody>
                {externshipList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No externship records found for the selected filters.
                    </td>
                  </tr>
                )}
                {externshipList.map((item) => (
                  <tr key={item.externship_id}>
                    <td>{item.faculty_name}</td>
                    <td>{item.department}</td>
                    <td>{item.industry_name}</td>
                    <td>{item.type}</td>
                    <td>{item.startdate || '—'}</td>
                    <td>{item.enddate || '—'}</td>
                    <td>{item.duration_days ?? '—'}</td>
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

export default ResearchAdministrativeSection;

import './Page.css';

function ResearchAdministrativeSection() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Research · Administrative Section</h1>
        <p>Visualisations for faculty industry externships will appear here.</p>
        <p className="coming-soon">Implementation in progress…</p>
      </div>
    </div>
  );
}

export default ResearchAdministrativeSection;
