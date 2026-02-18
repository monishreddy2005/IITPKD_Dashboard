import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchFilterOptions, fetchEmployeeOverview } from '../services/administrativeStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';

const BAR_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 700,
  animationEasing: 'ease-out',
  animationBegin: 80
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const label = payload.value || '';
  const truncated = label.length > 18 ? label.slice(0, 16) + '…' : label;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={6}
        textAnchor="end"
        fill="#555"
        fontSize={11}
        fontWeight={500}
        transform="rotate(-38)"
      >
        {truncated}
      </text>
    </g>
  );
};

// Custom legend: colour swatches + total count on the same row
const CustomLegend = ({ payload, total }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.2rem',
    fontSize: '0.8rem',
    flexWrap: 'wrap',
    paddingBottom: '6px',
  }}>
    {payload.map((entry) => (
      <span key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          display: 'inline-block',
          width: 10, height: 10,
          borderRadius: 2,
          background: entry.color,
          flexShrink: 0,
        }} />
        <span style={{ color: entry.color, fontWeight: 600 }}>{entry.value}</span>
      </span>
    ))}
    <span style={{
      borderLeft: '1px solid #d0d0d0',
      paddingLeft: '1rem',
      fontWeight: 700,
      color: '#1a1a1a',
      whiteSpace: 'nowrap',
    }}>
      Total Employees: {total}
    </span>
  </div>
);

function AdministrativeSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    department: [],
    designation: [],
    gender: [],
    category: [],
    cadre: [],
    employee_type: []
  });

  const [filters, setFilters] = useState({
    department: null,
    designation: null,
    gender: null,
    category: null,
    cadre: null,
    employee_type: null,
    isactive: true
  });

  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const options = await fetchFilterOptions(token);
        setFilterOptions(options);
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Failed to load filter options. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const result = await fetchEmployeeOverview(filters, token);
        setEmployeeData(result.data);
        setTotal(result.total);
      } catch (err) {
        console.error('Error loading employee overview:', err);
        setError('Failed to load employee overview data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployeeData();
  }, [filters, token]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? null : value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: null,
      designation: null,
      gender: null,
      category: null,
      cadre: null,
      employee_type: null,
      isactive: true
    });
  };

  const hasData = total > 0 && employeeData.some(
    d => (d.Male || 0) > 0 || (d.Female || 0) > 0 || (d.Transgender || 0) > 0 || (d.Other || 0) > 0
  );

  return (
    // ✅ Mirror AcademicSection: use page-container/page-content for non-public, plain div for public
    <div className={isPublicView ? '' : 'page-container'}>
      <div className={isPublicView ? '' : 'page-content'}>

        {/* Upload button — top-right, matching AcademicSection pattern */}
        {!isPublicView && (
          <div className="section-header">
            <div className="header-left" />
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Employee Data
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {/* Chart section card */}
        <div className="chart-section">
          <div className="chart-view active">

            {/* Page-level header */}
            <div className="chart-header" style={{ marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Employee Overview</h2>
            </div>

            {/* Chart card */}
            <div
              className={`bar-chart-container trend-chart ${hasData ? '' : 'has-empty'}`}
              style={{ padding: '1rem 1.25rem' }}
            >

              {/* Compact Filters */}
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.6rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a' }}>Filters</span>
                  <button
                    className="clear-filters-btn"
                    onClick={handleClearFilters}
                    style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px' }}
                  >
                    Clear All Filters
                  </button>
                </div>

                {/* All 7 filters in one row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem' }}>
                  {[
                    { id: 'employee-type-filter', label: 'Employee Type', key: 'employee_type', options: filterOptions.employee_type },
                    { id: 'department-filter',    label: 'Department',    key: 'department',    options: filterOptions.department },
                    { id: 'designation-filter',   label: 'Designation',   key: 'designation',   options: filterOptions.designation },
                    { id: 'gender-filter',        label: 'Gender',        key: 'gender',        options: filterOptions.gender },
                    { id: 'category-filter',      label: 'Category',      key: 'category',      options: filterOptions.category },
                    { id: 'cadre-filter',         label: 'Cadre',         key: 'cadre',         options: filterOptions.cadre },
                  ].map(({ id, label, key, options }) => (
                    <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label htmlFor={id} style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a1a1a' }}>{label}</label>
                      <select
                        id={id}
                        value={filters[key] || 'All'}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="filter-select"
                        style={{ padding: '0.3rem 1.8rem 0.3rem 0.5rem', fontSize: '0.78rem', borderRadius: '7px' }}
                      >
                        <option value="All">All</option>
                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}

                  {/* Employment Status — boolean logic */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="active-filter" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a1a1a' }}>Emp. Status</label>
                    <select
                      id="active-filter"
                      value={filters.isactive === true ? 'Active' : filters.isactive === false ? 'Inactive' : 'All'}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleFilterChange('isactive', v === 'All' ? null : v === 'Active');
                      }}
                      className="filter-select"
                      style={{ padding: '0.3rem 1.8rem 0.3rem 0.5rem', fontSize: '0.78rem', borderRadius: '7px' }}
                    >
                      <option value="All">All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              <div className={`trend-empty-state ${hasData ? 'hidden' : ''}`}>
                <p>No information available for the selected filters</p>
              </div>

              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={employeeData}
                  margin={{ top: 5, right: 16, left: 0, bottom: 130 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={<CustomXAxisTick />} interval={0} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<StackedBarTooltip total={total} />} />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    content={(props) => <CustomLegend {...props} total={total} />}
                  />
                  <Bar dataKey="Male"        stackId="a" fill="#667eea" {...BAR_ANIMATION} />
                  <Bar dataKey="Female"      stackId="a" fill="#764ba2" {...BAR_ANIMATION} />
                  <Bar dataKey="Transgender" stackId="a" fill="#43e97b" {...BAR_ANIMATION} />
                  <Bar dataKey="Other"       stackId="a" fill="#f093fb" {...BAR_ANIMATION} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tableName="employee"
          token={token}
        />
      </div>
    </div>
  );
}

const StackedBarTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const deptTotal = (data.Male || 0) + (data.Female || 0) + (data.Transgender || 0) + (data.Other || 0);
    const percentage = total > 0 ? ((deptTotal / total) * 100).toFixed(1) : 0;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`${data.name}: ${deptTotal}`}</p>
        <p className="tooltip-percentage">{percentage}% of total</p>
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #555' }}>
          <p style={{ color: '#667eea', margin: '0.2rem 0', fontSize: '0.85rem' }}>Male: {data.Male || 0}</p>
          <p style={{ color: '#764ba2', margin: '0.2rem 0', fontSize: '0.85rem' }}>Female: {data.Female || 0}</p>
          <p style={{ color: '#43e97b', margin: '0.2rem 0', fontSize: '0.85rem' }}>Transgender: {data.Transgender || 0}</p>
          <p style={{ color: '#f093fb', margin: '0.2rem 0', fontSize: '0.85rem' }}>Other: {data.Other || 0}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default AdministrativeSection;