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
  Bar
} from 'recharts';

import {
  fetchResearchFilterOptions,
  fetchIcsrSummary,
  fetchIcsrProjectTrend,
  fetchConsultancyTrend,
  fetchIcsrProjectList,
  fetchMouTrend,
  fetchMouList,
  fetchPatentStats,
  fetchPatentList
} from '../services/researchStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './ResearchSection.css';

const PATENT_STATUS_ORDER = ['Filed', 'Granted', 'Published'];
const PATENT_COLORS = {
  Filed: '#6366f1',
  Granted: '#22c55e',
  Published: '#f97316'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric);
};

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

const buildPatentBreakdown = (source = {}) => ({
  Filed: Number(source?.Filed) || 0,
  Granted: Number(source?.Granted) || 0,
  Published: Number(source?.Published) || 0
});

function ResearchIcsrSection() {
  const [filterOptions, setFilterOptions] = useState({
    project_departments: [],
    project_years: [],
    project_statuses: [],
    project_types: [],
    mou_years: [],
    patent_years: [],
    patent_statuses: []
  });

  const [filters, setFilters] = useState({
    department: 'All',
    project_year: 'All',
    project_type: 'All',
    status: 'All',
    mou_year: 'All',
    patent_year: 'All',
    patent_status: 'All'
  });

  const [summary, setSummary] = useState({
    funded_projects: 0,
    consultancy_projects: 0,
    sanctioned_projects: 0,
    total_projects: 0,
    total_mous: 0,
    total_patents: 0,
    consultancy_revenue: 0,
    patent_breakdown: buildPatentBreakdown()
  });

  const [projectTrend, setProjectTrend] = useState([]);
  const [consultancyTrend, setConsultancyTrend] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [mouTrend, setMouTrend] = useState([]);
  const [mouList, setMouList] = useState([]);
  const [patentStats, setPatentStats] = useState({ overall: buildPatentBreakdown(), yearly: [] });
  const [patentList, setPatentList] = useState([]);

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
          project_departments: Array.isArray(options?.project_departments) ? options.project_departments : [],
          project_years: Array.isArray(options?.project_years)
            ? [...options.project_years].sort((a, b) => b - a)
            : [],
          project_statuses: Array.isArray(options?.project_statuses) ? options.project_statuses : [],
          project_types: Array.isArray(options?.project_types) ? options.project_types : [],
          mou_years: Array.isArray(options?.mou_years) ? [...options.mou_years].sort((a, b) => b - a) : [],
          patent_years: Array.isArray(options?.patent_years)
            ? [...options.patent_years].sort((a, b) => b - a)
            : [],
          patent_statuses: Array.isArray(options?.patent_statuses) ? options.patent_statuses : []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load research filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const [
          summaryResp,
          projectTrendResp,
          consultancyTrendResp,
          projectListResp,
          mouTrendResp,
          mouListResp,
          patentStatsResp,
          patentListResp
        ] = await Promise.all([
          fetchIcsrSummary(filters, token),
          fetchIcsrProjectTrend(filters, token),
          fetchConsultancyTrend(filters, token),
          fetchIcsrProjectList(filters, token),
          fetchMouTrend(token),
          fetchMouList({ mou_year: filters.mou_year }, token),
          fetchPatentStats(
            {
              patent_year: filters.patent_year,
              patent_status: filters.patent_status
            },
            token
          ),
          fetchPatentList(
            {
              patent_year: filters.patent_year,
              patent_status: filters.patent_status
            },
            token
          )
        ]);

        setSummary({
          funded_projects: summaryResp?.funded_projects || 0,
          consultancy_projects: summaryResp?.consultancy_projects || 0,
          sanctioned_projects:
            summaryResp?.sanctioned_projects ?? summaryResp?.total_projects ?? 0,
          total_projects: summaryResp?.total_projects ?? summaryResp?.sanctioned_projects ?? 0,
          total_mous: summaryResp?.total_mous || 0,
          total_patents: summaryResp?.total_patents || 0,
          consultancy_revenue: summaryResp?.consultancy_revenue || 0,
          patent_breakdown: buildPatentBreakdown(summaryResp?.patent_breakdown)
        });

        setProjectTrend(projectTrendResp?.data || []);
        setConsultancyTrend(consultancyTrendResp?.data || []);
        setProjectList(projectListResp?.data || []);
        setMouTrend(mouTrendResp?.data || []);
        setMouList(mouListResp?.data || []);
        setPatentStats({
          overall: buildPatentBreakdown(patentStatsResp?.overall),
          yearly: Array.isArray(patentStatsResp?.yearly) ? patentStatsResp.yearly : []
        });
        setPatentList(patentListResp?.data || []);
      } catch (err) {
        console.error('Failed to load ICSR analytics:', err);
        setError(err.message || 'Failed to load ICSR analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const projectTrendChartData = useMemo(() => {
    if (!projectTrend.length) return [];
    return projectTrend.map((row) => ({
      year: row.year,
      projects: Number(row.total) || 0
    }));
  }, [projectTrend]);

  const consultancyTrendChartData = useMemo(() => {
    if (!consultancyTrend.length) return [];
    return consultancyTrend.map((row) => ({
      year: row.year,
      revenue: Number(row.revenue) || 0
    }));
  }, [consultancyTrend]);

  const mouTrendChartData = useMemo(() => {
    if (!mouTrend.length) return [];
    return mouTrend.map((row) => ({
      year: row.year,
      total: Number(row.total) || 0
    }));
  }, [mouTrend]);

  const patentTrendChartData = useMemo(() => {
    if (!patentStats.yearly.length) return [];
    return patentStats.yearly.map((row) => {
      const entry = { year: row.year };
      PATENT_STATUS_ORDER.forEach((status) => {
        entry[status] = Number(row[status]) || 0;
      });
      entry.total = PATENT_STATUS_ORDER.reduce((acc, status) => acc + entry[status], 0);
      return entry;
    });
  }, [patentStats.yearly]);

  const patentOverall = useMemo(
    () => PATENT_STATUS_ORDER.map((status) => ({
      status,
      value: patentStats.overall[status] || 0,
      color: PATENT_COLORS[status]
    })),
    [patentStats.overall]
  );

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      project_year: 'All',
      project_type: 'All',
      status: 'All',
      mou_year: 'All',
      patent_year: 'All',
      patent_status: 'All'
    });
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Research · ICSR (Industrial Consultancy & Sponsored Research)</h1>
        <p>
          Track externally funded and consultancy projects, partnership MoUs, and innovation outcomes through patents
          filed and granted under IIT Palakkad&apos;s ICSR portfolio.
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
              <label htmlFor="department-filter">Department</label>
              <select
                id="department-filter"
                className="filter-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.project_departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="project-year-filter">Project Year</label>
              <select
                id="project-year-filter"
                className="filter-select"
                value={filters.project_year}
                onChange={(e) => handleFilterChange('project_year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.project_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="project-type-filter">Project Type</label>
              <select
                id="project-type-filter"
                className="filter-select"
                value={filters.project_type}
                onChange={(e) => handleFilterChange('project_type', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.project_types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="project-status-filter">Project Status</label>
              <select
                id="project-status-filter"
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.project_statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="mou-year-filter">MoU Year</label>
              <select
                id="mou-year-filter"
                className="filter-select"
                value={filters.mou_year}
                onChange={(e) => handleFilterChange('mou_year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.mou_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="patent-year-filter">Patent Year</label>
              <select
                id="patent-year-filter"
                className="filter-select"
                value={filters.patent_year}
                onChange={(e) => handleFilterChange('patent_year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.patent_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="patent-status-filter">Patent Status</label>
              <select
                id="patent-status-filter"
                className="filter-select"
                value={filters.patent_status}
                onChange={(e) => handleFilterChange('patent_status', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.patent_statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Sanctioned Projects</h3>
            <p className="summary-value">{formatNumber(summary.total_projects)}</p>
            <span className="summary-subtitle">Funded + consultancy projects</span>
          </div>
          <div className="summary-card">
            <h3>Externally Funded Projects</h3>
            <p className="summary-value accent-success">{formatNumber(summary.funded_projects)}</p>
            <span className="summary-subtitle">Active + completed</span>
          </div>
          <div className="summary-card">
            <h3>Consultancy Projects</h3>
            <p className="summary-value accent-warning">{formatNumber(summary.consultancy_projects)}</p>
            <span className="summary-subtitle">Client-driven engagements</span>
          </div>
          <div className="summary-card">
            <h3>Consultancy Revenue</h3>
            <p className="summary-value">{formatCurrency(summary.consultancy_revenue)}</p>
            <span className="summary-subtitle">Amount sanctioned across consultancy projects</span>
          </div>
          <div className="summary-card">
            <h3>Partnership MoUs Signed</h3>
            <p className="summary-value">{formatNumber(summary.total_mous)}</p>
            <span className="summary-subtitle">Strategic collaboration agreements</span>
          </div>
          <div className="summary-card">
            <h3>Patents (Filed / Granted / Published)</h3>
            <p className="summary-value">
              {formatNumber(summary.patent_breakdown.Filed)} / {formatNumber(summary.patent_breakdown.Granted)} /{' '}
              {formatNumber(summary.patent_breakdown.Published)}
            </p>
            <span className="summary-subtitle">Total patents: {formatNumber(summary.total_patents)}</span>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading research analytics…</p>
          </div>
        )}

        {!loading && (
          <>
            <section className="chart-section">
              <div className="chart-header">
                <h2>Externally Funded Project Trend</h2>
                <p className="chart-description">
                  Annual count of externally funded projects with the selected filters.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={projectTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="projects" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Consultancy Revenue Trend</h2>
                <p className="chart-description">
                  Year-wise sanctioned consultancy revenue (₹), showcasing industry engagement momentum.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={consultancyTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>MoUs Signed Per Year</h2>
                <p className="chart-description">
                  Timeline of research and industry collaboration agreements formalised through MoUs.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={mouTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Patents Filed vs Granted (Year-wise)</h2>
                <p className="chart-description">
                  Stacked breakdown of innovation outputs across filing, granting, and publication stages.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={patentTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  {PATENT_STATUS_ORDER.map((status) => (
                    <Bar
                      key={status}
                      dataKey={status}
                      stackId="patents"
                      fill={PATENT_COLORS[status]}
                      radius={status === 'Published' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>

              <div className="patent-summary-grid">
                {patentOverall.map((item) => (
                  <div key={item.status} className="patent-summary-card">
                    <span className="patent-dot" style={{ backgroundColor: item.color }} />
                    <div>
                      <h4>{item.status}</h4>
                      <p>{formatNumber(item.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="dual-grid">
              <section className="grievance-table-wrapper">
                <h2>Key Research & Consultancy Projects</h2>
                <p className="chart-description">
                  Detailed snapshot of currently selected projects filtered by department, year, and status.
                </p>
                <div className="table-responsive">
                  <table className="grievance-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Principal Investigator</th>
                        <th>Type</th>
                        <th>Department</th>
                        <th>Funding / Client</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th>Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectList.length === 0 && (
                        <tr>
                          <td colSpan={8}>No projects match the selected filters.</td>
                        </tr>
                      )}
                      {projectList.map((project) => (
                        <tr key={project.project_id}>
                          <td>{project.project_title}</td>
                          <td>{project.principal_investigator || '—'}</td>
                          <td>{project.project_type}</td>
                          <td>{project.department || '—'}</td>
                          <td>{project.project_type === 'Consultancy' ? project.client_organization || '—' : project.funding_agency || '—'}</td>
                          <td>{formatCurrency(project.amount_sanctioned || 0)}</td>
                          <td>{project.status}</td>
                          <td>
                            {formatDate(project.start_date)} → {formatDate(project.end_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grievance-table-wrapper">
                <h2>Memoranda of Understanding (MoUs)</h2>
                <p className="chart-description">Strategic collaborations powering research and innovation.</p>
                <div className="table-responsive">
                  <table className="grievance-table">
                    <thead>
                      <tr>
                        <th>Partner</th>
                        <th>Collaboration Focus</th>
                        <th>Date Signed</th>
                        <th>Validity</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mouList.length === 0 && (
                        <tr>
                          <td colSpan={5}>No MoUs found for the selected filters.</td>
                        </tr>
                      )}
                      {mouList.map((mou) => (
                        <tr key={mou.mou_id}>
                          <td>{mou.partner_name}</td>
                          <td>{mou.collaboration_nature || '—'}</td>
                          <td>{formatDate(mou.date_signed)}</td>
                          <td>{formatDate(mou.validity_end)}</td>
                          <td>{mou.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <section className="grievance-table-wrapper">
              <h2>Patent Dossier</h2>
              <p className="chart-description">
                End-to-end tracking of patent filings, grants, and publications emerging from ICSR efforts.
              </p>
              <div className="table-responsive">
                <table className="grievance-table">
                  <thead>
                    <tr>
                      <th>Patent Title</th>
                      <th>Status</th>
                      <th>Inventors</th>
                      <th>Filing Date</th>
                      <th>Grant Date</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patentList.length === 0 && (
                      <tr>
                        <td colSpan={6}>No patent records found for the selected filters.</td>
                      </tr>
                    )}
                    {patentList.map((patent) => (
                      <tr key={patent.patent_id}>
                        <td>{patent.patent_title}</td>
                        <td>{patent.patent_status}</td>
                        <td>{patent.inventors}</td>
                        <td>{formatDate(patent.filing_date)}</td>
                        <td>{formatDate(patent.grant_date)}</td>
                        <td>{patent.remarks || '—'}</td>
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

export default ResearchIcsrSection;
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
  Bar
} from 'recharts';

import {
  fetchResearchFilterOptions,
  fetchResearchSummary,
  fetchFundedProjectTrend,
  fetchConsultancyRevenueTrend,
  fetchResearchProjects,
  fetchMouList,
  fetchPatentStats,
  fetchPatentList
} from '../services/researchModuleStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const PROJECT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
const PATENT_STATUS_COLORS = {
  Filed: '#6366f1',
  Granted: '#22c55e',
  Published: '#f97316'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return '₹0';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 1
  }).format(numeric);
};

const formatDate = (value) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

function ResearchIcsrSection() {
  const [filterOptions, setFilterOptions] = useState({
    project_departments: [],
    project_years: [],
    project_statuses: [],
    project_types: [],
    mou_years: [],
    patent_years: [],
    patent_statuses: []
  });

  const [filters, setFilters] = useState({
    department: 'All',
    project_year: 'All',
    status: 'All',
    project_type: 'All',
    mou_year: 'All',
    patent_year: 'All',
    patent_status: 'All'
  });

  const [summary, setSummary] = useState({
    funded_projects: 0,
    consultancy_projects: 0,
    total_projects: 0,
    total_mous: 0,
    total_patents: 0,
    consultancy_revenue: 0
  });
  const [fundedTrend, setFundedTrend] = useState([]);
  const [consultancyTrend, setConsultancyTrend] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [mouList, setMouList] = useState([]);
  const [patentStats, setPatentStats] = useState({ overall: {}, yearly: [] });
  const [patentList, setPatentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const options = await fetchResearchFilterOptions(token);
        setFilterOptions({
          project_departments: options?.project_departments ?? [],
          project_years: options?.project_years ?? [],
          project_statuses: options?.project_statuses ?? [],
          project_types: options?.project_types ?? [],
          mou_years: options?.mou_years ?? [],
          patent_years: options?.patent_years ?? [],
          patent_statuses: options?.patent_statuses ?? []
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

      const projectFilters = {
        department: filters.department,
        project_year: filters.project_year,
        status: filters.status
      };

      const projectListFilters = {
        ...projectFilters,
        project_type: filters.project_type
      };

      const mouFilters = {
        mou_year: filters.mou_year
      };

      const patentFilters = {
        patent_year: filters.patent_year,
        patent_status: filters.patent_status
      };

      try {
        const [
          summaryData,
          fundedData,
          consultancyData,
          projects,
          mous,
          patentStatsData,
          patents
        ] = await Promise.all([
          fetchResearchSummary(projectFilters, token),
          fetchFundedProjectTrend(projectFilters, token),
          fetchConsultancyRevenueTrend(projectFilters, token),
          fetchResearchProjects(projectListFilters, token),
          fetchMouList(mouFilters, token),
          fetchPatentStats(patentFilters, token),
          fetchPatentList(patentFilters, token)
        ]);

        if (summaryData) {
          setSummary(summaryData);
        }
        setFundedTrend(fundedData || []);
        setConsultancyTrend(consultancyData || []);
        setProjectList(projects || []);
        setMouList(mous || []);
        setPatentStats(
          patentStatsData || {
            overall: {},
            yearly: []
          }
        );
        setPatentList(patents || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, token]);

  const patentOverallArray = useMemo(() => {
    if (!patentStats?.overall) {
      return [];
    }
    return Object.entries(patentStats.overall).map(([statusLabel, total]) => ({
      status: statusLabel,
      total
    }));
  }, [patentStats]);

  const patentYearlySeries = useMemo(() => {
    const yearly = patentStats?.yearly ?? [];
    const keys = new Set();
    yearly.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key !== 'year') {
          keys.add(key);
        }
      });
    });
    return { data: yearly, keys: Array.from(keys) };
  }, [patentStats]);

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
        <h1>ICSR – Industrial Consultancy &amp; Sponsored Research</h1>
        <p>
          Track externally funded projects, consultancy engagements, strategic MoUs, and patent outcomes that power IIT
          Palakkad&apos;s research ecosystem.
        </p>

        <div className="section-filters">
          <div className="filter-group">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={filters.department} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.project_departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="project_year">Project Year</label>
            <select id="project_year" name="project_year" value={filters.project_year} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.project_years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Project Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.project_statuses.map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="project_type">Project Type</label>
            <select id="project_type" name="project_type" value={filters.project_type} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.project_types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="mou_year">MoU Year</label>
            <select id="mou_year" name="mou_year" value={filters.mou_year} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.mou_years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="patent_year">Patent Year</label>
            <select id="patent_year" name="patent_year" value={filters.patent_year} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.patent_years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="patent_status">Patent Status</label>
            <select id="patent_status" name="patent_status" value={filters.patent_status} onChange={handleFilterChange}>
              <option value="All">All</option>
              {filterOptions.patent_statuses.map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading-indicator">Loading analytics...</div>}

        <div className="stats-summary-grid">
          <div className="stat-card accent">
            <span className="stat-label">Externally Funded Projects</span>
            <span className="stat-value">{formatNumber(summary.funded_projects)}</span>
          </div>
          <div className="stat-card accent">
            <span className="stat-label">Consultancy Projects</span>
            <span className="stat-value">{formatNumber(summary.consultancy_projects)}</span>
            <span className="stat-subtitle">Consultancy Revenue: {formatCurrency(summary.consultancy_revenue)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Projects</span>
            <span className="stat-value">{formatNumber(summary.total_projects)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">MoUs Signed</span>
            <span className="stat-value">{formatNumber(summary.total_mous)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Patents Portfolio</span>
            <span className="stat-value">{formatNumber(summary.total_patents)}</span>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-card wide">
            <h2>Externally Funded Projects Trend</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={fundedTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="Funded Projects" stroke="#6366f1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card wide">
            <h2>Consultancy Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={consultancyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Consultancy Revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card wide">
            <h2>Patents Filed vs Granted</h2>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={patentYearlySeries.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                {patentYearlySeries.keys.map((statusKey, index) => (
                  <Bar
                    key={statusKey}
                    dataKey={statusKey}
                    stackId="patents"
                    fill={PATENT_STATUS_COLORS[statusKey] || PROJECT_COLORS[index % PROJECT_COLORS.length]}
                    radius={index === patentYearlySeries.keys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div className="inline-stat-grid">
              {patentOverallArray.map((entry) => (
                <div key={entry.status} className="inline-stat-card">
                  <span className="inline-label">{entry.status}</span>
                  <span className="inline-value">{formatNumber(entry.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h2>Project Portfolio</h2>
          <div className="table-responsive">
            <table className="grievance-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Principal Investigator</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Funding Agency / Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {projectList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No projects found for the selected filters.
                    </td>
                  </tr>
                )}
                {projectList.map((project) => (
                  <tr key={project.project_id}>
                    <td>{project.project_title}</td>
                    <td>{project.principal_investigator}</td>
                    <td>{project.department}</td>
                    <td>{project.project_type}</td>
                    <td>{project.funding_agency || project.client_organization || '—'}</td>
                    <td>{formatCurrency(project.amount_sanctioned)}</td>
                    <td>{project.status}</td>
                    <td>
                      {formatDate(project.start_date)} – {formatDate(project.end_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-section">
          <h2>Strategic Collaborations – MoUs</h2>
          <div className="table-responsive">
            <table className="grievance-table">
              <thead>
                <tr>
                  <th>Partner Institution / Industry</th>
                  <th>Collaboration Focus</th>
                  <th>Date Signed</th>
                  <th>Valid Until</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {mouList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No MoU records found for the selected filters.
                    </td>
                  </tr>
                )}
                {mouList.map((mou) => (
                  <tr key={mou.mou_id}>
                    <td>{mou.partner_name}</td>
                    <td>{mou.collaboration_nature || '—'}</td>
                    <td>{formatDate(mou.date_signed)}</td>
                    <td>{formatDate(mou.validity_end)}</td>
                    <td>{mou.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-section">
          <h2>Patent Dossier</h2>
          <div className="table-responsive">
            <table className="grievance-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Inventors</th>
                  <th>Status</th>
                  <th>Filed On</th>
                  <th>Granted On</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {patentList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No patent records found for the selected filters.
                    </td>
                  </tr>
                )}
                {patentList.map((patent) => (
                  <tr key={patent.patent_id}>
                    <td>{patent.patent_title}</td>
                    <td>{patent.inventors || '—'}</td>
                    <td>{patent.patent_status}</td>
                    <td>{formatDate(patent.filing_date)}</td>
                    <td>{formatDate(patent.grant_date)}</td>
                    <td>{patent.remarks || '—'}</td>
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

export default ResearchIcsrSection;

import './Page.css';

function ResearchIcsrSection() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>ICSR Section</h1>
        <p>Dashboards for industrial consultancy & sponsored research will appear here.</p>
        <p className="coming-soon">Implementation in progress…</p>
      </div>
    </div>
  );
}

export default ResearchIcsrSection;
