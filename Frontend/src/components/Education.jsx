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
import {
  fetchPlacementFilterOptions,
  fetchPlacementSummary,
  fetchPlacementTrend,
  fetchPlacementGenderBreakdown,
  fetchPlacementProgramStatus,
  fetchPlacementRecruiters,
  fetchPlacementSectorDistribution,
  fetchPlacementPackageTrend,
  fetchTopRecruiters
} from '../services/placementStats';

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
const GENDER_COLORS = ['#667eea', '#fa709a', '#f59e0b'];
const SECTOR_COLORS = ['#4f46e5', '#ec4899', '#22d3ee', '#f97316', '#10b981', '#facc15'];

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return '–';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '–';
  }
  return `${numeric.toFixed(2)} LPA`;
}

function formatPercentage(value) {
  if (value === null || value === undefined) {
    return '0%';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '0%';
  }
  return `${numeric.toFixed(2)}%`;
}

function Education() {
  const [activeTab, setActiveTab] = useState('engagement');
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

  const [placementFilterOptions, setPlacementFilterOptions] = useState({
    years: [],
    programs: [],
    genders: [],
    sectors: []
  });
  const [placementFilters, setPlacementFilters] = useState({
    year: 'All',
    program: 'All',
    gender: 'All',
    sector: 'All'
  });
  const [placementSummary, setPlacementSummary] = useState({
    registered: 0,
    placed: 0,
    placement_percentage: 0,
    highest_package: null,
    lowest_package: null,
    average_package: null
  });
  const [placementTrend, setPlacementTrend] = useState([]);
  const [genderBreakdown, setGenderBreakdown] = useState([]);
  const [programStatus, setProgramStatus] = useState([]);
  const [recruiterStats, setRecruiterStats] = useState([]);
  const [sectorDistribution, setSectorDistribution] = useState([]);
  const [packageTrend, setPackageTrend] = useState([]);
  const [topRecruiters, setTopRecruiters] = useState([]);

  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementError, setEngagementError] = useState(null);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [placementError, setPlacementError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) {
        const authError = 'Authentication token not found. Please log in again.';
        setEngagementError(authError);
        setPlacementError(authError);
        return;
      }
      try {
        const [engagementOptions, placementOptions] = await Promise.all([
          fetchFilterOptions(token),
          fetchPlacementFilterOptions(token)
        ]);

        setFilterOptions({
          years: Array.isArray(engagementOptions?.years) ? engagementOptions.years : [],
          departments: Array.isArray(engagementOptions?.departments) ? engagementOptions.departments : [],
          engagement_types: Array.isArray(engagementOptions?.engagement_types)
            ? engagementOptions.engagement_types
            : ['Adjunct', 'Honorary', 'Visiting', 'FacultyFellow', 'PoP']
        });

        setPlacementFilterOptions({
          years: Array.isArray(placementOptions?.years) ? placementOptions.years : [],
          programs: Array.isArray(placementOptions?.programs) ? placementOptions.programs : [],
          genders: Array.isArray(placementOptions?.genders) ? placementOptions.genders : [],
          sectors: Array.isArray(placementOptions?.sectors) ? placementOptions.sectors : []
        });
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
        const message = err.message || 'Failed to load filter options.';
        setEngagementError(message);
        setPlacementError(message);
      }
    };

    loadFilterOptions();
  }, [token]);

  const loadEngagementData = async () => {
    if (!token || activeTab !== 'engagement') return;
    try {
      setEngagementLoading(true);
      setEngagementError(null);
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
      setEngagementError(err.message || 'Failed to load education statistics.');
    } finally {
      setEngagementLoading(false);
    }
  };

  const loadPlacementData = async () => {
    if (!token || activeTab !== 'placement') return;
    try {
      setPlacementLoading(true);
      setPlacementError(null);
      const [summaryResp, trendResp, genderResp, programResp, recruiterResp, sectorResp, packageResp, topRecruiterResp] =
        await Promise.all([
          fetchPlacementSummary(placementFilters, token),
          fetchPlacementTrend(placementFilters, token),
          fetchPlacementGenderBreakdown(placementFilters, token),
          fetchPlacementProgramStatus(placementFilters, token),
          fetchPlacementRecruiters(placementFilters, token),
          fetchPlacementSectorDistribution(placementFilters, token),
          fetchPlacementPackageTrend(placementFilters, token),
          fetchTopRecruiters(placementFilters, token)
        ]);

      setPlacementSummary(summaryResp?.data || {
        registered: 0,
        placed: 0,
        placement_percentage: 0,
        highest_package: null,
        lowest_package: null,
        average_package: null
      });
      setPlacementTrend(trendResp?.data || []);
      setGenderBreakdown(genderResp?.data || []);
      setProgramStatus(programResp?.data || []);
      setRecruiterStats(recruiterResp?.data || []);
      setSectorDistribution(sectorResp?.data || []);
      setPackageTrend(packageResp?.data || []);
      setTopRecruiters(topRecruiterResp?.data || []);
    } catch (err) {
      console.error('Failed to load placement data:', err);
      setPlacementError(err.message || 'Failed to load placement statistics.');
    } finally {
      setPlacementLoading(false);
    }
  };

  useEffect(() => {
    loadEngagementData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab]);

  useEffect(() => {
    loadPlacementData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placementFilters, activeTab]);

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

  const placementTrendChartData = useMemo(() => {
    if (!placementTrend.length) {
      return [];
    }
    return placementTrend.map((row) => ({
      year: row.year,
      percentage: row.placement_percentage || 0,
      registered: row.registered || 0,
      placed: row.placed || 0
    }));
  }, [placementTrend]);

  const genderPieChartData = useMemo(() => {
    if (!genderBreakdown.length) {
      return [];
    }
    return genderBreakdown.map((row) => ({
      name: row.gender,
      value: row.placement_percentage || 0,
      registered: row.registered || 0,
      placed: row.placed || 0
    }));
  }, [genderBreakdown]);

  const programStatusChartData = useMemo(() => {
    if (!programStatus.length) {
      return [];
    }
    return programStatus.map((row) => ({
      program: row.program_category,
      registered: row.registered || 0,
      placed: row.placed || 0,
      percentage: row.placement_percentage || 0
    }));
  }, [programStatus]);

  const recruiterChartData = useMemo(() => {
    if (!recruiterStats.length) {
      return [];
    }
    return recruiterStats.map((row) => ({
      year: row.year,
      companies: row.companies || 0,
      offers: row.offers || 0
    }));
  }, [recruiterStats]);

  const sectorPieData = useMemo(() => {
    if (!sectorDistribution.length) {
      return [];
    }
    return sectorDistribution.map((row) => ({
      sector: row.sector,
      companies: row.companies || 0,
      offers: row.offers || 0
    }));
  }, [sectorDistribution]);

  const packageTrendChartData = useMemo(() => {
    if (!packageTrend.length) {
      return [];
    }
    return packageTrend.map((row) => ({
      year: row.year,
      highest: row.highest ?? null,
      lowest: row.lowest ?? null,
      average: row.average ?? null
    }));
  }, [packageTrend]);

  const handlePlacementFilterChange = (field, value) => {
    setPlacementFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Education Dashboard</h1>
        <p>
          Explore IIT Palakkad&apos;s academic ecosystem — switch between external academic engagement metrics and
          placement outcomes to get a complete picture of institutional performance.
        </p>

        <div className="section-toggle">
          <button
            type="button"
            className={`toggle-button ${activeTab === 'engagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('engagement')}
          >
            External Academic Engagement
          </button>
          <button
            type="button"
            className={`toggle-button ${activeTab === 'placement' ? 'active' : ''}`}
            onClick={() => setActiveTab('placement')}
          >
            Placements & Career Outcomes
          </button>
        </div>

        {activeTab === 'engagement' && (
          <>
            {engagementError && <div className="error-message">{engagementError}</div>}

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

            {engagementLoading ? (
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
          </>
        )}

        {activeTab === 'placement' && (
          <>
            {placementError && <div className="error-message">{placementError}</div>}

            <div className="filter-panel">
              <div className="filter-header">
                <h2>Filters</h2>
                <button
                  className="clear-filters-btn"
                  onClick={() =>
                    setPlacementFilters({
                      year: 'All',
                      program: 'All',
                      gender: 'All',
                      sector: 'All'
                    })
                  }
                >
                  Clear Filters
                </button>
              </div>

              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="placementYearFilter">Year</label>
                  <select
                    id="placementYearFilter"
                    className="filter-select"
                    value={placementFilters.year}
                    onChange={(e) => handlePlacementFilterChange('year', e.target.value)}
                  >
                    <option value="All">All</option>
                    {placementFilterOptions.years?.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="placementProgramFilter">Program</label>
                  <select
                    id="placementProgramFilter"
                    className="filter-select"
                    value={placementFilters.program}
                    onChange={(e) => handlePlacementFilterChange('program', e.target.value)}
                  >
                    <option value="All">All</option>
                    {placementFilterOptions.programs?.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="placementGenderFilter">Gender</label>
                  <select
                    id="placementGenderFilter"
                    className="filter-select"
                    value={placementFilters.gender}
                    onChange={(e) => handlePlacementFilterChange('gender', e.target.value)}
                  >
                    <option value="All">All</option>
                    {placementFilterOptions.genders?.map((genderOption) => (
                      <option key={genderOption} value={genderOption}>
                        {genderOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="placementSectorFilter">Sector</label>
                  <select
                    id="placementSectorFilter"
                    className="filter-select"
                    value={placementFilters.sector}
                    onChange={(e) => handlePlacementFilterChange('sector', e.target.value)}
                  >
                    <option value="All">All</option>
                    {placementFilterOptions.sectors?.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {placementLoading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
                <p>Compiling placement performance metrics...</p>
              </div>
            ) : (
              <>
                <div className="summary-cards">
                  <div className="summary-card">
                    <h3>Total Registered</h3>
                    <p className="summary-value">{formatNumber(placementSummary.registered)}</p>
                    <span className="summary-subtitle">Students registered for placements</span>
                  </div>
                  <div className="summary-card">
                    <h3>Total Placed</h3>
                    <p className="summary-value">{formatNumber(placementSummary.placed)}</p>
                    <span className="summary-subtitle">Offers accepted</span>
                  </div>
                  <div className="summary-card">
                    <h3>Placement Percentage</h3>
                    <p className="summary-value">{formatPercentage(placementSummary.placement_percentage)}</p>
                    <span className="summary-subtitle">Placed / Registered</span>
                  </div>
                  <div className="summary-card">
                    <h3>Highest Package</h3>
                    <p className="summary-value">{formatCurrency(placementSummary.highest_package)}</p>
                    <span className="summary-subtitle">Across selected filters</span>
                  </div>
                  <div className="summary-card">
                    <h3>Average Package</h3>
                    <p className="summary-value">{formatCurrency(placementSummary.average_package)}</p>
                    <span className="summary-subtitle">Weighted mean</span>
                  </div>
                  <div className="summary-card">
                    <h3>Lowest Package</h3>
                    <p className="summary-value">{formatCurrency(placementSummary.lowest_package)}</p>
                    <span className="summary-subtitle">Across selected filters</span>
                  </div>
                </div>

                <div className="chart-section">
                  <div className="chart-header">
                    <div>
                      <h2>Placement Percentage Trend</h2>
                      <p className="chart-description">
                        Track how overall placement conversion has evolved across years.
                      </p>
                    </div>
                  </div>

                  {!placementTrendChartData.length ? (
                    <div className="no-data">No placement trend data available.</div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={380}>
                        <LineChart data={placementTrendChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="year" stroke="#cbd5f5" />
                          <YAxis stroke="#cbd5f5" />
                          <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                          <Legend />
                          <Line type="monotone" dataKey="percentage" name="Placement %" stroke="#38bdf8" strokeWidth={3} />
                          <Line type="monotone" dataKey="placed" name="Placed" stroke="#22c55e" strokeWidth={2} />
                          <Line type="monotone" dataKey="registered" name="Registered" stroke="#6366f1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="chart-section">
                  <div className="chart-header">
                    <div>
                      <h2>Gender-wise Placement Share</h2>
                      <p className="chart-description">
                        Understand gender balance in placement outcomes for the selected filters.
                      </p>
                    </div>
                  </div>

                  {!genderPieChartData.length ? (
                    <div className="no-data">No gender-wise data available.</div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={340}>
                        <PieChart>
                          <Pie
                            data={genderPieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={130}
                            label={({ name, value }) => `${name} (${formatPercentage(value)})`}
                          >
                            {genderPieChartData.map((entry, index) => (
                              <Cell key={entry.name} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
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
                      <h2>Program-wise Placement Status</h2>
                      <p className="chart-description">
                        Compare registrations and offers across UG, PG, and PhD cohorts.
                      </p>
                    </div>
                  </div>

                  {!programStatusChartData.length ? (
                    <div className="no-data">No program-wise data available.</div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={380}>
                        <BarChart data={programStatusChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="program" stroke="#cbd5f5" />
                          <YAxis stroke="#cbd5f5" />
                          <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                          <Legend />
                          <Bar dataKey="registered" name="Registered" fill="#6366f1" />
                          <Bar dataKey="placed" name="Placed" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="chart-section">
                  <div className="chart-header">
                    <div>
                      <h2>Recruiters per Year</h2>
                      <p className="chart-description">
                        Monitor company participation and total offers year over year.
                      </p>
                    </div>
                  </div>

                  {!recruiterChartData.length ? (
                    <div className="no-data">No recruiter statistics available.</div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={recruiterChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="year" stroke="#cbd5f5" />
                          <YAxis stroke="#cbd5f5" />
                          <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                          <Legend />
                          <Bar dataKey="companies" name="Companies" fill="#f59e0b" />
                          <Bar dataKey="offers" name="Offers" fill="#38bdf8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="chart-section">
                  <div className="chart-header">
                    <div>
                      <h2>Sector-wise Company Split</h2>
                      <p className="chart-description">
                        Distribution of visiting recruiters by industry sector.
                      </p>
                    </div>
                  </div>

                  {!sectorPieData.length ? (
                    <div className="no-data">No sector information available.</div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={340}>
                        <PieChart>
                          <Pie
                            data={sectorPieData}
                            dataKey="companies"
                            nameKey="sector"
                            cx="50%"
                            cy="50%"
                            outerRadius={130}
                            label={({ sector, companies }) => `${sector} (${formatNumber(companies)})`}
                          >
                            {sectorPieData.map((entry, index) => (
                              <Cell key={entry.sector} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
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
                      <h2>Package Benchmarks</h2>
                      <p className="chart-description">
                        Highest, lowest, and average packages secured each year.
                      </p>
                    </div>
                  </div>

                  {!packageTrendChartData.length ? (
                    <div className="no-data">No package data available.</div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={380}>
                        <LineChart data={packageTrendChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="year" stroke="#cbd5f5" />
                          <YAxis stroke="#cbd5f5" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                            formatter={(value) => formatCurrency(value)}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="highest" name="Highest" stroke="#22c55e" strokeWidth={3} />
                          <Line type="monotone" dataKey="average" name="Average" stroke="#38bdf8" strokeWidth={3} />
                          <Line type="monotone" dataKey="lowest" name="Lowest" stroke="#f97316" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="grievance-table-wrapper">
                  <div className="chart-header">
                    <div>
                      <h2>Top Recruiters</h2>
                      <p className="chart-description">
                        Highlights of leading recruiters and offer counts.
                      </p>
                    </div>
                  </div>

                  {!topRecruiters.length ? (
                    <div className="no-data">No recruiter details available.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="grievance-table">
                        <thead>
                          <tr>
                            <th>Year</th>
                            <th>Company</th>
                            <th>Sector</th>
                            <th>Offers</th>
                            <th>Hires</th>
                            <th>Flagged</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topRecruiters.map((row) => (
                            <tr key={`${row.year}-${row.company_name}`}>
                              <td>{row.year}</td>
                              <td>{row.company_name}</td>
                              <td>{row.sector || '—'}</td>
                              <td>{formatNumber(row.offers)}</td>
                              <td>{formatNumber(row.hires)}</td>
                              <td>{row.is_top_recruiter ? 'Yes' : 'No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Education;
