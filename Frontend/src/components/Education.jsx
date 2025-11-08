import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  fetchFilterOptions,
  fetchSummary,
  fetchDepartmentBreakdown,
  fetchYearTrend,
  fetchTypeDistribution
} from '../services/educationStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const TYPE_COLORS = {
  Adjunct: '#667eea',
  Honorary: '#f59e0b',
  Visiting: '#43e97b',
  FacultyFellow: '#a855f7',
  PoP: '#fa709a'
};

const PIE_COLORS = ['#667eea', '#f59e0b', '#43e97b', '#a855f7', '#fa709a'];

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function Education() {
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    departments: [],
    engagement_types: []
  });
  const [filters, setFilters] = useState({
    year: 'All',
    department: 'All',
    engagement_type: 'All'
  });
  const [summaryData, setSummaryData] = useState({
    summary: [],
    overall_total: 0,
    overall_active: 0
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [yearTrendData, setYearTrendData] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);

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
        const options = await fetchFilterOptions(token);
        setFilterOptions({
          years: Array.isArray(options?.years) ? options.years : [],
          departments: Array.isArray(options?.departments) ? options.departments : [],
          engagement_types: Array.isArray(options?.engagement_types)
            ? options.engagement_types
            : ['Adjunct', 'Honorary', 'Visiting', 'FacultyFellow', 'PoP']
        });
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const [summaryResp, deptResp, trendResp, typeResp] = await Promise.all([
        fetchSummary(filters, token),
        fetchDepartmentBreakdown(filters, token),
        fetchYearTrend(filters, token),
        fetchTypeDistribution(filters, token)
      ]);

      setSummaryData(summaryResp?.data || { summary: [], overall_total: 0, overall_active: 0 });
      setDepartmentData(deptResp?.data || []);
      setYearTrendData(trendResp?.data || []);
      setTypeDistribution(typeResp?.data || []);
    } catch (err) {
      console.error('Failed to load education data:', err);
      setError(err.message || 'Failed to load education statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const departmentChartData = useMemo(() => {
    if (!departmentData.length) {
      return [];
    }
    return departmentData.map((row) => ({
      department: row.department,
      Adjunct: row.Adjunct_total || 0,
      Honorary: row.Honorary_total || 0,
      Visiting: row.Visiting_total || 0,
      FacultyFellow: row.FacultyFellow_total || 0,
      PoP: row.PoP_total || 0
    }));
  }, [departmentData]);

  const trendChartData = useMemo(() => {
    if (!yearTrendData.length) {
      return [];
    }
    return yearTrendData.map((row) => ({
      year: row.year,
      Adjunct: row.Adjunct || 0,
      Honorary: row.Honorary || 0,
      Visiting: row.Visiting || 0,
      FacultyFellow: row.FacultyFellow || 0,
      PoP: row.PoP || 0
    }));
  }, [yearTrendData]);

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Education · External Academic Engagement</h1>
        <p>
          Monitor adjunct, honorary, visiting faculty, fellows, and PoP appointments across departments and years to
          understand IIT Palakkad&apos;s external collaboration footprint.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-panel">
          <div className="filter-header">
            <h2>Filters</h2>
            <button
              className="clear-filters-btn"
              onClick={() =>
                setFilters({
                  year: 'All',
                  department: 'All',
                  engagement_type: 'All'
                })
              }
            >
              Clear Filters
            </button>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="yearFilter">Year</label>
              <select
                id="yearFilter"
                className="filter-select"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.years?.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="departmentFilter">Department</label>
              <select
                id="departmentFilter"
                className="filter-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.departments?.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="typeFilter">Engagement Type</label>
              <select
                id="typeFilter"
                className="filter-select"
                value={filters.engagement_type}
                onChange={(e) => handleFilterChange('engagement_type', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.engagement_types?.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Gathering faculty engagement statistics...</p>
          </div>
        ) : (
          <>
            <div className="summary-cards">
              {summaryData.summary.map((item) => (
                <div key={item.engagement_type} className="summary-card">
                  <h3>{item.engagement_type}</h3>
                  <p className="summary-value">{formatNumber(item.total)}</p>
                  <span className="summary-subtitle">
                    Active: {formatNumber(item.active)} · Total appointed: {formatNumber(item.total)}
                  </span>
                </div>
              ))}
              <div className="summary-card">
                <h3>Overall Engagements</h3>
                <p className="summary-value">{formatNumber(summaryData.overall_total)}</p>
                <span className="summary-subtitle">
                  Active: {formatNumber(summaryData.overall_active)} · Total: {formatNumber(summaryData.overall_total)}
                </span>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Department-wise Engagement Mix</h2>
                  <p className="chart-description">
                    Compare how each department leverages different types of external faculty appointments.
                  </p>
                </div>
              </div>

              {!departmentChartData.length ? (
                <div className="no-data">No department records available for the selected filters.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={departmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="department" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                      {Object.entries(TYPE_COLORS).map(([type, color]) => (
                        <Bar key={type} dataKey={type} stackId="a" name={type} fill={color} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Year-wise Trend</h2>
                  <p className="chart-description">
                    Observe how adjunct, honorary, visiting and other appointments have evolved over the years.
                  </p>
                </div>
              </div>

              {!trendChartData.length ? (
                <div className="no-data">No year-wise data to display.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                      {Object.entries(TYPE_COLORS).map(([type, color]) => (
                        <Line
                          key={type}
                          type="monotone"
                          dataKey={type}
                          name={type}
                          stroke={color}
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Engagement Type Distribution</h2>
                  <p className="chart-description">
                    Proportion of total appointments by engagement type for the applied filters.
                  </p>
                </div>
              </div>

              {!typeDistribution.length ? (
                <div className="no-data">No distribution data to display.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        dataKey="total"
                        nameKey="engagement_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
                        label={({ name, value }) => `${name} (${formatNumber(value)})`}
                      >
                        {typeDistribution.map((entry, index) => (
                          <Cell
                            key={entry.engagement_type}
                            fill={TYPE_COLORS[entry.engagement_type] || PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grievance-table-wrapper">
              <div className="chart-header">
                <div>
                  <h2>Department Detail Table</h2>
                  <p className="chart-description">
                    View total and active engagements per department broken down by type.
                  </p>
                </div>
              </div>

              {!departmentData.length ? (
                <div className="no-data">No data available to display.</div>
              ) : (
                <div className="table-responsive">
                  <table className="grievance-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Total</th>
                        <th>Active</th>
                        {Object.keys(TYPE_COLORS).map((type) => (
                          <th key={type}>{type} (Total / Active)</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((row) => (
                        <tr key={row.department}>
                          <td>{row.department}</td>
                          <td>{formatNumber(row.total)}</td>
                          <td>{formatNumber(row.active)}</td>
                          {Object.keys(TYPE_COLORS).map((type) => (
                            <td key={`${row.department}-${type}`}>
                              {formatNumber(row[`${type}_total`] || 0)} / {formatNumber(row[`${type}_active`] || 0)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Education;
