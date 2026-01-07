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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

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
import DataUploadModal from './DataUploadModal';

const GENDER_COLORS = ['#6366f1', '#ec4899', '#f97316'];
const SECTOR_COLORS = ['#4f46e5', '#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15', '#fb7185', '#14b8a6'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return '–';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '–';
  }
  return `${numeric.toFixed(2)} LPA`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '0%';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '0%';
  }
  return `${numeric.toFixed(2)}%`;
};

function PlacementSection({ user }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    programs: [],
    genders: [],
    sectors: []
  });

  const [filters, setFilters] = useState({
    year: 'All',
    program: 'All',
    gender: 'All',
    sector: 'All'
  });

  const [summary, setSummary] = useState({
    registered: 0,
    placed: 0,
    placement_percentage: 0,
    highest_package: null,
    lowest_package: null,
    average_package: null
  });

  const [trendData, setTrendData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [programStatus, setProgramStatus] = useState([]);
  const [recruiterStats, setRecruiterStats] = useState([]);
  const [sectorDistribution, setSectorDistribution] = useState([]);
  const [packageTrend, setPackageTrend] = useState([]);
  const [topRecruiters, setTopRecruiters] = useState([]);

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
        const options = await fetchPlacementFilterOptions(token);
        setFilterOptions({
          years: Array.isArray(options?.years) ? options.years : [],
          programs: Array.isArray(options?.programs) ? options.programs : [],
          genders: Array.isArray(options?.genders) ? options.genders : [],
          sectors: Array.isArray(options?.sectors) ? options.sectors : []
        });
      } catch (err) {
        console.error('Failed to fetch placement filter options:', err);
        setError(err.message || 'Failed to load placement filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadPlacementData = async () => {
      if (!token) {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [summaryResp, trendResp, genderResp, programResp, recruiterResp, sectorResp, packageResp, topRecruiterResp] =
          await Promise.all([
            fetchPlacementSummary(filters, token),
            fetchPlacementTrend(filters, token),
            fetchPlacementGenderBreakdown(filters, token),
            fetchPlacementProgramStatus(filters, token),
            fetchPlacementRecruiters(filters, token),
            fetchPlacementSectorDistribution(filters, token),
            fetchPlacementPackageTrend(filters, token),
            fetchTopRecruiters(filters, token)
          ]);

        setSummary(summaryResp?.data || {
          registered: 0,
          placed: 0,
          placement_percentage: 0,
          highest_package: null,
          lowest_package: null,
          average_package: null
        });
        setTrendData(trendResp?.data || []);
        setGenderData(genderResp?.data || []);
        setProgramStatus(programResp?.data || []);
        setRecruiterStats(recruiterResp?.data || []);
        setSectorDistribution(sectorResp?.data || []);
        setPackageTrend(packageResp?.data || []);
        setTopRecruiters(topRecruiterResp?.data || []);
      } catch (err) {
        console.error('Failed to load placement data:', err);
        setError(err.message || 'Failed to load placement statistics.');
      } finally {
        setLoading(false);
      }
    };

    loadPlacementData();
  }, [filters, token]);

  const placementTrendChartData = useMemo(() => {
    if (!trendData.length) return [];
    return trendData.map((row) => ({
      year: row.year,
      percentage: row.placement_percentage || 0,
      registered: row.registered || 0,
      placed: row.placed || 0
    }));
  }, [trendData]);

  const genderPieData = useMemo(() => {
    if (!genderData.length) return [];
    return genderData.map((row) => ({
      name: row.gender,
      value: row.placement_percentage || 0,
      registered: row.registered || 0,
      placed: row.placed || 0
    }));
  }, [genderData]);

  const programStatusChartData = useMemo(() => {
    if (!programStatus.length) return [];
    return programStatus.map((row) => ({
      program: row.program_category,
      registered: row.registered || 0,
      placed: row.placed || 0,
      percentage: row.placement_percentage || 0
    }));
  }, [programStatus]);

  const recruiterChartData = useMemo(() => {
    if (!recruiterStats.length) return [];
    return recruiterStats.map((row) => ({
      year: row.year,
      companies: row.companies || 0,
      offers: row.offers || 0
    }));
  }, [recruiterStats]);

  const sectorPieData = useMemo(() => {
    if (!sectorDistribution.length) return [];
    return sectorDistribution.map((row) => ({
      sector: row.sector,
      companies: row.companies || 0,
      offers: row.offers || 0
    }));
  }, [sectorDistribution]);

  const packageTrendChartData = useMemo(() => {
    if (!packageTrend.length) return [];
    return packageTrend.map((row) => ({
      year: row.year,
      highest: row.highest ?? null,
      lowest: row.lowest ?? null,
      average: row.average ?? null
    }));
  }, [packageTrend]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      year: 'All',
      program: 'All',
      gender: 'All',
      sector: 'All'
    });
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Placements & Career Outcomes</h1>
        <p>
          Analyse multi-year placement performance, cohort-wise conversion rates, visiting recruiters, and package
          benchmarks to understand student career trajectories at IIT Palakkad.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-panel">
          <div className="filter-header">
            <h2>Filters</h2>
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>

          {user && user.role_id === 3 && (
            <div className="upload-buttons-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                className="upload-data-btn"
                onClick={() => { setActiveUploadTable('placement_summary'); setIsUploadModalOpen(true); }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Upload Placement Summaries
              </button>
              <button
                className="upload-data-btn"
                onClick={() => { setActiveUploadTable('placement_companies'); setIsUploadModalOpen(true); }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Upload Recruiters
              </button>
            </div>
          )}

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="placement-year-filter">Year</label>
              <select
                id="placement-year-filter"
                className="filter-select"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="placement-program-filter">Program</label>
              <select
                id="placement-program-filter"
                className="filter-select"
                value={filters.program}
                onChange={(e) => handleFilterChange('program', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.programs.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="placement-gender-filter">Gender</label>
              <select
                id="placement-gender-filter"
                className="filter-select"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="placement-sector-filter">Sector</label>
              <select
                id="placement-sector-filter"
                className="filter-select"
                value={filters.sector}
                onChange={(e) => handleFilterChange('sector', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Compiling placement performance metrics...</p>
          </div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Registered</h3>
                <p className="summary-value">{formatNumber(summary.registered)}</p>
                <span className="summary-subtitle">Students registered for placements</span>
              </div>
              <div className="summary-card">
                <h3>Total Placed</h3>
                <p className="summary-value">{formatNumber(summary.placed)}</p>
                <span className="summary-subtitle">Offers accepted</span>
              </div>
              <div className="summary-card">
                <h3>Placement Percentage</h3>
                <p className="summary-value">{formatPercentage(summary.placement_percentage)}</p>
                <span className="summary-subtitle">Placed / Registered</span>
              </div>
              <div className="summary-card">
                <h3>Highest Package</h3>
                <p className="summary-value">{formatCurrency(summary.highest_package)}</p>
                <span className="summary-subtitle">Across selected filters</span>
              </div>
              <div className="summary-card">
                <h3>Average Package</h3>
                <p className="summary-value">{formatCurrency(summary.average_package)}</p>
                <span className="summary-subtitle">Weighted mean</span>
              </div>
              <div className="summary-card">
                <h3>Lowest Package</h3>
                <p className="summary-value">{formatCurrency(summary.lowest_package)}</p>
                <span className="summary-subtitle">Across selected filters</span>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Placement Percentage Trend</h2>
                  <p className="chart-description">Track how overall placement conversion has evolved across years.</p>
                </div>
              </div>

              {!placementTrendChartData.length ? (
                <div className="no-data">No placement trend data available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
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
                  <p className="chart-description">Understand gender balance in placement outcomes.</p>
                </div>
              </div>

              {!genderPieData.length ? (
                <div className="no-data">No gender-wise data available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={genderPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        label={({ name, value }) => `${name} (${formatPercentage(value)})`}
                      >
                        {genderPieData.map((entry, index) => (
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
                  <p className="chart-description">Compare registrations and offers across UG, PG, and PhD cohorts.</p>
                </div>
              </div>

              {!programStatusChartData.length ? (
                <div className="no-data">No program-wise data available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
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
                  <p className="chart-description">Monitor company participation and total offers year over year.</p>
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
                  <p className="chart-description">Distribution of visiting recruiters by industry sector.</p>
                </div>
              </div>

              {!sectorPieData.length ? (
                <div className="no-data">No sector-wise data available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie
                        data={sectorPieData}
                        dataKey="companies"
                        nameKey="sector"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        label={({ name, value }) => `${name} (${formatNumber(value)})`}
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
                  <h2>Package Trends</h2>
                  <p className="chart-description">Track average package trends across years.</p>
                </div>
              </div>

              {!packageTrendChartData.length ? (
                <div className="no-data">No package trend data available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={packageTrendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                      <Line type="monotone" dataKey="average" name="Average Package" stroke="#10b981" strokeWidth={3} />
                      <Line type="monotone" dataKey="highest" name="Highest Package" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="lowest" name="Lowest Package" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grievance-table-wrapper">
              <div className="chart-header">
                <div>
                  <h2>Top Recruiters</h2>
                  <p className="chart-description">Highlights of visiting recruiters, their sectors, and offer volume.</p>
                </div>
              </div>

              {!topRecruiters.length ? (
                <div className="no-data">No top recruiter information available for the selected filters.</div>
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
      </div>

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName={activeUploadTable}
        token={token}
      />
    </div >
  );
}

export default PlacementSection;
