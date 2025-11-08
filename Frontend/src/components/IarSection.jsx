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
  fetchStateDistribution,
  fetchCountryDistribution,
  fetchOutcomeBreakdown
} from '../services/iarStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './IarSection.css';

const PIE_COLORS = ['#667eea', '#764ba2', '#f093fb', '#43e97b', '#fa709a', '#00f2fe', '#f59e0b', '#a78bfa'];
const STATE_BAR_COLOR = '#67e8f9';
const HIGHER_BAR_COLOR = '#43e97b';
const CORPORATE_BAR_COLOR = '#fa709a';
const TREND_TOTAL_COLOR = '#667eea';
const TREND_HIGHER_COLOR = '#22d3ee';
const TREND_CORPORATE_COLOR = '#f97316';

function IarSection() {
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    departments: [],
    genders: [],
    programs: [],
    categories: []
  });

  const [filters, setFilters] = useState({
    year: 'All',
    department: 'All',
    gender: 'All',
    program: 'All',
    category: 'All'
  });

  const [summary, setSummary] = useState({
    total_alumni: 0,
    higher_studies: 0,
    corporate: 0,
    trend: []
  });
  const [stateDistribution, setStateDistribution] = useState([]);
  const [countryDistribution, setCountryDistribution] = useState([]);
  const [outcomeBreakdown, setOutcomeBreakdown] = useState([]);

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
        setFilterOptions(options);
      } catch (err) {
        console.error('Failed to load filter options:', err);
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
      const [summaryResp, stateResp, countryResp, outcomeResp] = await Promise.all([
        fetchSummary(filters, token),
        fetchStateDistribution(filters, token),
        fetchCountryDistribution(filters, token),
        fetchOutcomeBreakdown(filters, token)
      ]);
      setSummary(summaryResp?.data || { total_alumni: 0, higher_studies: 0, corporate: 0, trend: [] });
      setStateDistribution(stateResp?.data || []);
      setCountryDistribution(countryResp?.data || []);
      setOutcomeBreakdown(outcomeResp?.data || []);
    } catch (err) {
      console.error('Failed to load IAR data:', err);
      setError(err.message || 'Failed to load alumni statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const trendData = useMemo(() => summary.trend || [], [summary.trend]);

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>International and Alumni Relations</h1>
        <p>
          Explore global alumni reach, outcome trends, and state-wise engagement insights with comprehensive filtering by
          year, department, program, gender, and category.
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
                  gender: 'All',
                  program: 'All',
                  category: 'All'
                })
              }
            >
              Clear Filters
            </button>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="yearFilter">Year of Admission</label>
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
              <label htmlFor="programFilter">Program</label>
              <select
                id="programFilter"
                className="filter-select"
                value={filters.program}
                onChange={(e) => handleFilterChange('program', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.programs?.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="genderFilter">Gender</label>
              <select
                id="genderFilter"
                className="filter-select"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.genders?.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="categoryFilter">Category</label>
              <select
                id="categoryFilter"
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Fetching alumni insights...</p>
          </div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Alumni</h3>
                <p className="summary-value">{summary.total_alumni}</p>
                <span className="summary-subtitle">Alumni matched with filters</span>
              </div>
              <div className="summary-card">
                <h3>Higher Studies</h3>
                <p className="summary-value accent-success">{summary.higher_studies}</p>
                <span className="summary-subtitle">Pursuing research or advanced education</span>
              </div>
              <div className="summary-card">
                <h3>Corporate Careers</h3>
                <p className="summary-value accent-warning">{summary.corporate}</p>
                <span className="summary-subtitle">Working in industry and corporate roles</span>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Outcome Trend Over Years</h2>
                  <p className="chart-description">
                    Track the proportion of alumni opting for higher studies versus corporate roles across admission
                    years.
                  </p>
                </div>
              </div>

              {trendData.length === 0 ? (
                <div className="no-data">No trend data available for the selected filters.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total alumni" stroke={TREND_TOTAL_COLOR} strokeWidth={3} />
                      <Line type="monotone" dataKey="higher" name="Higher studies" stroke={TREND_HIGHER_COLOR} strokeWidth={3} />
                      <Line type="monotone" dataKey="corporate" name="Corporate" stroke={TREND_CORPORATE_COLOR} strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>State-wise Alumni Distribution</h2>
                  <p className="chart-description">
                    Alumni counts mapped to Indian states based on their registered home state.
                  </p>
                </div>
              </div>

              {stateDistribution.length === 0 ? (
                <div className="no-data">No state distribution data to display.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={stateDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="state" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                      <Bar dataKey="count" name="Alumni count" fill={STATE_BAR_COLOR} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Global Alumni Reach</h2>
                  <p className="chart-description">
                    Breakdown of alumni locations across countries to understand international presence.
                  </p>
                </div>
              </div>

              {countryDistribution.length === 0 ? (
                <div className="no-data">No country distribution data to display.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                      <Pie
                        dataKey="count"
                        data={countryDistribution}
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
                        label={({ name, value }) => `${name} (${value})`}
                      >
                        {countryDistribution.map((entry, index) => (
                          <Cell key={entry.country} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Outcome by Department</h2>
                  <p className="chart-description">
                    Compare higher studies versus corporate career paths chosen by alumni from each department.
                  </p>
                </div>
              </div>

              {outcomeBreakdown.length === 0 ? (
                <div className="no-data">No departmental breakdown to display.</div>
              ) : (
                <>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={420}>
                      <BarChart data={outcomeBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="department" stroke="#cbd5f5" />
                        <YAxis stroke="#cbd5f5" />
                        <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                        <Legend />
                        <Bar dataKey="higher" name="Higher studies" stackId="a" fill={HIGHER_BAR_COLOR} />
                        <Bar dataKey="corporate" name="Corporate" stackId="a" fill={CORPORATE_BAR_COLOR} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grievance-table-wrapper">
                    <div className="chart-header">
                      <div>
                        <h2>Departmental Outcome Summary</h2>
                        <p className="chart-description">
                          Tabular view listing counts per department for transparency and export needs.
                        </p>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="grievance-table">
                        <thead>
                          <tr>
                            <th>Department</th>
                            <th>Total Alumni</th>
                            <th>Higher Studies</th>
                            <th>Corporate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outcomeBreakdown.map((row) => (
                            <tr key={row.department}>
                              <td>{row.department}</td>
                              <td>{row.total}</td>
                              <td>{row.higher}</td>
                              <td>{row.corporate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default IarSection;

