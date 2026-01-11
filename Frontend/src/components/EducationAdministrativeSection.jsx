import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  fetchFilterOptions,
  fetchSummary,
  fetchDepartmentBreakdown,
  fetchYearTrend,
  fetchTypeDistribution,
  fetchFacultyEngagementList
} from '../services/educationStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';

const ENGAGEMENT_COLORS = {
  Adjunct: '#667eea',
  Honorary: '#764ba2',
  Visiting: '#f093fb',
  FacultyFellow: '#4facfe',
  PoP: '#00f2fe'
};

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

function EducationAdministrativeSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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

  const [summary, setSummary] = useState({
    summary: [],
    overall_total: 0,
    overall_active: 0
  });

  const [departmentData, setDepartmentData] = useState([]);
  const [yearTrendData, setYearTrendData] = useState([]);
  const [typeDistributionData, setTypeDistributionData] = useState([]);
  const [engagementList, setEngagementList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  // Fetch filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      try {
        const options = await fetchFilterOptions(token);
        setFilterOptions({
          years: Array.isArray(options?.years) ? [...options.years].sort((a, b) => b - a) : [],
          departments: Array.isArray(options?.departments) ? options.departments : [],
          engagement_types: Array.isArray(options?.engagement_types) ? options.engagement_types : []
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  // Fetch all data
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const filterParams = {};
        if (filters.year !== 'All') filterParams.year = filters.year;
        if (filters.department !== 'All') filterParams.department = filters.department;
        if (filters.engagement_type !== 'All') filterParams.engagement_type = filters.engagement_type;

        const [summaryResp, deptResp, trendResp, distResp, listResp] = await Promise.all([
          fetchSummary(filterParams, token),
          fetchDepartmentBreakdown(filterParams, token),
          fetchYearTrend(filterParams, token),
          fetchTypeDistribution(filterParams, token),
          fetchFacultyEngagementList(filterParams, token)
        ]);

        setSummary({
          summary: Array.isArray(summaryResp?.data?.summary) ? summaryResp.data.summary : [],
          overall_total: summaryResp?.data?.overall_total || 0,
          overall_active: summaryResp?.data?.overall_active || 0
        });
        setDepartmentData(Array.isArray(deptResp?.data) ? deptResp.data : []);
        setYearTrendData(Array.isArray(trendResp?.data) ? trendResp.data : []);
        setTypeDistributionData(Array.isArray(distResp?.data) ? distResp.data : []);
        setEngagementList(Array.isArray(listResp?.data) ? listResp.data : []);
      } catch (err) {
        console.error('Failed to load faculty engagement data:', err);
        setError(err.message || 'Failed to load faculty engagement data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, token]);

  // Prepare summary cards data
  const summaryCards = useMemo(() => {
    return summary.summary.map((item) => ({
      type: item.engagement_type,
      total: Number(item.total) || 0,
      active: Number(item.active) || 0
    }));
  }, [summary.summary]);

  // Prepare department chart data
  const departmentChartData = useMemo(() => {
    if (!departmentData.length) return [];
    return departmentData.map((dept) => {
      const entry = { department: dept.department || 'Unknown' };
      summary.summary.forEach((item) => {
        const type = item.engagement_type;
        entry[type] = Number(dept[`${type}_total`]) || 0;
      });
      entry.total = Number(dept.total) || 0;
      return entry;
    });
  }, [departmentData, summary.summary]);

  // Prepare year trend chart data
  const yearTrendChartData = useMemo(() => {
    if (!yearTrendData.length) return [];
    return yearTrendData.map((entry) => {
      const item = { year: entry.year || 'Unknown' };
      summary.summary.forEach((sumItem) => {
        const type = sumItem.engagement_type;
        item[type] = Number(entry[type]) || 0;
      });
      return item;
    });
  }, [yearTrendData, summary.summary]);

  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    if (!typeDistributionData.length) return [];
    return typeDistributionData.map((item) => ({
      name: item.engagement_type,
      value: Number(item.total) || 0
    }));
  }, [typeDistributionData]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      year: 'All',
      department: 'All',
      engagement_type: 'All'
    });
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {`${entry.name}: ${formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1>Administrative Section - External Academic Engagement</h1>
            {user && user.role_id === 3 && (
              <button
                className="upload-data-btn"
                onClick={() => setIsUploadModalOpen(true)}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
              >
                Upload Data
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Filter Panel */}
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear All Filters
            </button>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="year-filter">Year</label>
              <select
                id="year-filter"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="filter-select"
              >
                <option value="All">All Years</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="department-filter">Department</label>
              <select
                id="department-filter"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="filter-select"
              >
                <option value="All">All Departments</option>
                {filterOptions.departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="engagement-type-filter">Engagement Type</label>
              <select
                id="engagement-type-filter"
                value={filters.engagement_type}
                onChange={(e) => handleFilterChange('engagement_type', e.target.value)}
                className="filter-select"
              >
                <option value="All">All Types</option>
                {filterOptions.engagement_types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Summary Indicators */}
            <div className="chart-section">
              <div className="chart-header">
                <h2>Summary Indicators</h2>
                <p className="chart-description">
                  Total counts by faculty engagement type
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem'
              }}>
                {summaryCards.map((card) => (
                  <div
                    key={card.type}
                    style={{
                      backgroundColor: '#fff',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      {card.type}
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: ENGAGEMENT_COLORS[card.type] || '#667eea',
                      marginBottom: '0.25rem'
                    }}>
                      {formatNumber(card.total)}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}>
                      Active: {formatNumber(card.active)}
                    </div>
                  </div>
                ))}
                {summaryCards.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-muted)'
                  }}>
                    No data available
                  </div>
                )}
              </div>

              {summary.overall_total > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <strong style={{ fontSize: '1.1rem' }}>
                    Overall Total: {formatNumber(summary.overall_total)} | 
                    Active: {formatNumber(summary.overall_active)}
                  </strong>
                </div>
              )}
            </div>

            {/* Department-wise Breakdown */}
            <div className="chart-section" style={{ marginTop: '3rem' }}>
              <div className="chart-header">
                <h2>Department-wise Breakdown</h2>
                <p className="chart-description">
                  Distribution of external academic engagement by department
                </p>
              </div>

              {departmentChartData.length > 0 ? (
                <div className="bar-chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={departmentChartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis
                        dataKey="department"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        stroke="#000000"
                        tick={{ fill: '#000000', fontSize: 12, fontWeight: 'bold' }}
                        label={{ value: 'Department', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#000000', fontSize: 14, fontWeight: 'bold' } }}
                      />
                      <YAxis
                        stroke="#000000"
                        tick={{ fill: '#000000', fontSize: 12, fontWeight: 'bold' }}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 14, fontWeight: 'bold' } }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }}
                        iconType="rect"
                      />
                      {summary.summary.map((item, index) => {
                        const type = item.engagement_type;
                        return (
                          <Bar
                            key={type}
                            dataKey={type}
                            stackId="a"
                            fill={ENGAGEMENT_COLORS[type] || COLORS[index % COLORS.length]}
                            radius={index === summary.summary.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="no-data">
                  <p>No department data available for the selected filters.</p>
                </div>
              )}
            </div>

            {/* Year-wise Trends */}
            <div className="chart-section" style={{ marginTop: '3rem' }}>
              <div className="chart-header">
                <h2>Year-wise Trends</h2>
                <p className="chart-description">
                  Growth in external academic engagement over time
                </p>
              </div>

              {yearTrendChartData.length > 0 ? (
                <div className="bar-chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={yearTrendChartData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis
                        dataKey="year"
                        stroke="#000000"
                        tick={{ fill: '#000000', fontSize: 12, fontWeight: 'bold' }}
                        label={{ value: 'Year', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#000000', fontSize: 14, fontWeight: 'bold' } }}
                      />
                      <YAxis
                        stroke="#000000"
                        tick={{ fill: '#000000', fontSize: 12, fontWeight: 'bold' }}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 14, fontWeight: 'bold' } }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }}
                        iconType="line"
                      />
                      {summary.summary.map((item, index) => {
                        const type = item.engagement_type;
                        return (
                          <Line
                            key={type}
                            type="monotone"
                            dataKey={type}
                            stroke={ENGAGEMENT_COLORS[type] || COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="no-data">
                  <p>No year trend data available for the selected filters.</p>
                </div>
              )}
            </div>

            {/* Pie Chart - Distribution by Faculty Type */}
            <div className="chart-section" style={{ marginTop: '3rem' }}>
              <div className="chart-header">
                <h2>Distribution by Faculty Type</h2>
                <p className="chart-description">
                  Proportion of each engagement type
                </p>
              </div>

              {pieChartData.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={ENGAGEMENT_COLORS[entry.name] || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="no-data">
                  <p>No distribution data available for the selected filters.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* External Academic Engagement Details Table */}
        <div className="chart-section" style={{ marginTop: '3rem' }}>
          <div className="chart-header">
            <h2>External Academic Engagement Details</h2>
            <p className="chart-description">
              Detailed list of all external academic engagements
            </p>
          </div>

          {engagementList.length > 0 ? (
            <div className="table-responsive" style={{
              height: '300px',
              maxHeight: '300px',
              overflowY: 'auto',
              overflowX: 'auto',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  backgroundColor: '#fff7ed'
                }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Sl No</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Academia or Industry</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Organisation Name</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Discipline</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementList.map((item, index) => {
                    // Determine Academia or Industry based on engagement type
                    const isAcademia = ['Honorary', 'Adjunct', 'FacultyFellow'].includes(item.engagement_type);
                    const sector = isAcademia ? 'Academia' : 'Industry';
                    
                    // Use remarks as organisation name, or create a default
                    const organisationName = item.remarks || `${item.engagement_type} Faculty`;
                    
                    return (
                      <tr key={item.engagement_code} style={{
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{index + 1}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{item.faculty_name || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{sector}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{organisationName}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{item.department || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No engagement data available for the selected filters.</p>
            </div>
          )}
        </div>

        {/* Honorary Professor Details Table */}
        <div className="chart-section" style={{ marginTop: '3rem' }}>
          <div className="chart-header">
            <h2 style={{ color: '#f97316' }}>Honorary Professor Details</h2>
            <p className="chart-description">
              List of honorary professors
            </p>
          </div>

          {engagementList.filter(item => item.engagement_type === 'Honorary').length > 0 ? (
            <div className="table-responsive" style={{
              height: '300px',
              maxHeight: '300px',
              overflowY: 'auto',
              overflowX: 'auto',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  backgroundColor: '#fff7ed'
                }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Sl No</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Designation</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #f3e8ff', color: '#92400e', fontWeight: '600' }}>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementList
                    .filter(item => item.engagement_type === 'Honorary')
                    .map((item, index) => (
                      <tr key={item.engagement_code} style={{
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{index + 1}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{item.faculty_name || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>Professor</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111111' }}>{item.department || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No honorary professor data available for the selected filters.</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {!isPublicView && user && user.role_id === 3 && (
          <DataUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            tableName="faculty_engagement"
            token={token}
          />
        )}
      </div>
    </div>
  );
}

export default EducationAdministrativeSection;

