import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  fetchFilterOptions,
  fetchEmployeeOverview,
  fetchYearwiseStrength,
  fetchGenderDistribution,
} from '../services/administrativeStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';

// ── Constants ──────────────────────────────────────────────────────────────

const BAR_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 700,
  animationEasing: 'ease-out',
  animationBegin: 80
};

const GENDER_COLORS = {
  Male: '#667eea',
  Female: '#764ba2',
  Transgender: '#43e97b',
  Other: '#f093fb',
};

// Same colour scheme as ICC for visual parity
const SERIES_META = [
  { key: 'Total',  color: '#667eea', gradientId: 'colorEmpTotal',  label: 'Total'  },
  { key: 'Male',   color: '#43e97b', gradientId: 'colorEmpMale',   label: 'Male'   },
  { key: 'Female', color: '#fa709a', gradientId: 'colorEmpFemale', label: 'Female' },
  { key: 'Other',  color: '#f093fb', gradientId: 'colorEmpOther',  label: 'Other'  },
];

const VIEWS = [
  { value: 'yearwise',   label: 'Yearwise Strength',  icon: '📈' },
  { value: 'department', label: 'Department Strength', icon: '📊' },
  { value: 'gender',     label: 'Gender Ratio',        icon: '🥧' },
];

const NUM_YEARS_OPTIONS = [
  { value: 1,  label: 'Last 1 Yr'  },
  { value: 2,  label: 'Last 2 Yrs' },
  { value: 3,  label: 'Last 3 Yrs' },
  { value: 5,  label: 'Last 5 Yrs' },
  { value: 10, label: 'Last 10 Yrs' },
];

// Chart white-box style — identical to ICC
const CHART_BOX = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
};

// ── Sub-components ─────────────────────────────────────────────────────────

const CustomXAxisTick = ({ x, y, payload }) => {
  const label = payload.value || '';
  const truncated = label.length > 18 ? label.slice(0, 16) + '…' : label;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={6} textAnchor="end" fill="#555" fontSize={11}
        fontWeight={500} transform="rotate(-38)">
        {truncated}
      </text>
    </g>
  );
};

const CustomLegend = ({ payload, total }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '1.2rem', fontSize: '0.8rem', flexWrap: 'wrap', paddingBottom: '6px',
  }}>
    {payload.map((entry) => (
      <span key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          display: 'inline-block', width: 10, height: 10,
          borderRadius: 2, background: entry.color, flexShrink: 0,
        }} />
        <span style={{ color: entry.color, fontWeight: 600 }}>{entry.value}</span>
      </span>
    ))}
    <span style={{
      borderLeft: '1px solid #d0d0d0', paddingLeft: '1rem',
      fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap',
    }}>
      Total Employees: {total}
    </span>
  </div>
);

const StackedBarTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const deptTotal = (data.Male || 0) + (data.Female || 0) + (data.Transgender || 0) + (data.Other || 0);
  const pct = total > 0 ? ((deptTotal / total) * 100).toFixed(1) : 0;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{`${data.name}: ${deptTotal}`}</p>
      <p className="tooltip-percentage">{pct}% of total</p>
      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #555' }}>
        <p style={{ color: '#667eea', margin: '0.2rem 0', fontSize: '0.85rem' }}>Male: {data.Male || 0}</p>
        <p style={{ color: '#764ba2', margin: '0.2rem 0', fontSize: '0.85rem' }}>Female: {data.Female || 0}</p>
        <p style={{ color: '#43e97b', margin: '0.2rem 0', fontSize: '0.85rem' }}>Transgender: {data.Transgender || 0}</p>
        <p style={{ color: '#f093fb', margin: '0.2rem 0', fontSize: '0.85rem' }}>Other: {data.Other || 0}</p>
      </div>
    </div>
  );
};

const PieTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{payload[0].name}</p>
      <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: payload[0].payload.fill }}>
        {payload[0].value} ({pct}%)
      </p>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────

function AdministrativeSection({ isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeView, setActiveView]               = useState('yearwise');

  const [filterOptions, setFilterOptions] = useState({
    department: [], designation: [], gender: [], emp_type: [], group_name: [], appointed_category: []
  });
  const [filters, setFilters] = useState({
    department: null, designation: null, gender: null,
    emp_type: null, group_name: null, appointed_category: null, num_years: 5
  });

  const [employeeData, setEmployeeData] = useState([]);
  const [total, setTotal]               = useState(0);

  const [yearwiseData, setYearwiseData] = useState([]);
  const [visibleSeries, setVisibleSeries] = useState(
    Object.fromEntries(SERIES_META.map(s => [s.key, true]))
  );

  const [genderData, setGenderData]   = useState([]);
  const [genderTotal, setGenderTotal] = useState(0);

  // Summary card state (independent of filters)
  const [summaryTotals, setSummaryTotals] = useState({ all: 0, teaching: 0, nonTeaching: 0 });
  const [allYearwise, setAllYearwise]           = useState([]);
  const [teachingYearwise, setTeachingYearwise] = useState([]);
  const [nonTeachingYearwise, setNonTeachingYearwise] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  // ── data fetching ──────────────────────────────────────────────────────

  // ── summary cards — runs once on mount, independent of user filters ──────
  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetchYearwiseStrength({}, token),
      fetchYearwiseStrength({ emp_type: 'Teaching' }, token),
      fetchYearwiseStrength({ emp_type: 'Non Teaching' }, token),
    ]).then(([rAll, rTeaching, rNonTeaching]) => {
      const data = (r) => r.data || [];
      // Use the latest year's active headcount for summary cards
      const latestTotal = (arr) => arr.length > 0 ? (arr[arr.length - 1].Total || 0) : 0;
      const allData = data(rAll);
      setAllYearwise(allData);
      setTeachingYearwise(data(rTeaching));
      setNonTeachingYearwise(data(rNonTeaching));
      setSummaryTotals({
        all: latestTotal(allData),
        teaching: latestTotal(data(rTeaching)),
        nonTeaching: latestTotal(data(rNonTeaching)),
      });
      if (allData.length > 0) {
        setSelectedYear(String(allData[allData.length - 1].year));
      }
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) { setError('Authentication token not found. Please log in again.'); return; }
    fetchFilterOptions(token)
      .then(opts => setFilterOptions(opts))
      .catch(() => setError('Failed to load filter options.'));
  }, [token]);

  useEffect(() => {
    if (!token || activeView !== 'department') return;
    fetchEmployeeOverview(filters, token)
      .then(r => { setEmployeeData(r.data); setTotal(r.total); })
      .catch(() => setError('Failed to load employee overview data.'))
  }, [filters, token, activeView]);

  useEffect(() => {
    if (!token || activeView !== 'yearwise') return;
    fetchYearwiseStrength(filters, token)
      .then(r => { setYearwiseData(r.data); })
      .catch(() => setError('Failed to load yearwise strength data.'))
  }, [filters, token, activeView]);

  useEffect(() => {
    if (!token || activeView !== 'gender') return;
    fetchGenderDistribution(filters, null, token)
      .then(r => {
        const pie = Object.entries(r.data)
          .filter(([, v]) => v > 0)
          .map(([name, value]) => ({ name, value, fill: GENDER_COLORS[name] || '#ccc' }));
        setGenderData(pie);
        setGenderTotal(r.total);
      })
      .catch(() => setError('Failed to load gender distribution data.'))
  }, [filters, token, activeView]);

  // ── handlers ────────────────────────────────────────────────────────────

  const handleFilterChange = (key, value) => {
    if (key === 'num_years') {
      setFilters(prev => ({ ...prev, [key]: Number(value) }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value === 'All' ? null : value }));
    }
  };

  const handleClearFilters = () => {
    setFilters({ department: null, designation: null, gender: null, emp_type: null, group_name: null, appointed_category: null, num_years: 5 });
  };

  const toggleSeries = (key) => {
    setVisibleSeries(prev => {
      const next = { ...prev, [key]: !prev[key] };
      return Object.values(next).some(Boolean) ? next : prev;
    });
  };

  // ── derived ──────────────────────────────────────────────────────────────

  const hasDeptData = total > 0 && employeeData.some(
    d => (d.Male || 0) + (d.Female || 0) + (d.Transgender || 0) + (d.Other || 0) > 0
  );

  // ── shared filter panel (inlined to avoid remount issues) ─────────────

  const filterPanel = (
    <div style={{
      background: '#f8f9fa', border: '1px solid #e0e0e0',
      borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.6rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e0e0e0'
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a' }}>Filters</span>
        <button className="clear-filters-btn" onClick={handleClearFilters}
          style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px' }}>
          Clear All Filters
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem' }}>
        {[
          { id: 'emp-type-filter',    label: 'Employee Type', key: 'emp_type',           options: filterOptions.emp_type },
          { id: 'department-filter',  label: 'Department',    key: 'department',         options: filterOptions.department },
          { id: 'designation-filter', label: 'Designation',   key: 'designation',        options: filterOptions.designation },
          { id: 'gender-filter',      label: 'Gender',        key: 'gender',             options: filterOptions.gender },
          { id: 'group-filter',       label: 'Group',         key: 'group_name',         options: filterOptions.group_name },
          { id: 'category-filter',    label: 'Category',      key: 'appointed_category', options: filterOptions.appointed_category },
          { id: 'num-years-filter',   label: 'No. of Years',  key: 'num_years',          customOptions: NUM_YEARS_OPTIONS },
        ].map(({ id, label, key, options, customOptions }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor={id} style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a1a1a' }}>{label}</label>
            <select id={id}
              value={customOptions ? filters[key] : (filters[key] || 'All')}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className="filter-select"
              style={{ padding: '0.3rem 1.8rem 0.3rem 0.5rem', fontSize: '0.78rem', borderRadius: '7px' }}>
              {customOptions
                ? customOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                : (<>
                    <option value="All">All</option>
                    {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </>)
              }
            </select>
          </div>
        ))}
      </div>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className={isPublicView ? '' : 'page-container'}>
      <div className={isPublicView ? '' : 'page-content'}>

        {/* Page title + description — matches ICC structure */}
        {!isPublicView && <h1>Employee Overview</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Monitor employee strength trends, department-wise distribution, and gender ratio across IIT Palakkad.
        </p>

        {/* Upload button — styled like ICC */}
        {!isPublicView && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(40, 167, 69, 0.3)'
              }}
            >
              <span>📤</span> Upload Employee Data
            </button>
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px', backgroundColor: '#f8d7da',
            color: '#721c24', borderRadius: '4px', marginBottom: '20px'
          }}>{error}</div>
        )}

        {/* ══ Check Employee Overview by Year ═════════════════════════════ */}
        <h2 style={{ textDecoration: 'underline', color: '#000000ff', marginBottom: '16px' }}>
          Check Employee Overview by Year
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>

          {/* Year Filter Card */}
          <div style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            borderRadius: '16px', padding: '24px',
            boxShadow: '0 10px 20px rgba(168,85,247,0.3)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>📅</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600' }}>Filter by Year</span>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px',
                  border: 'none', fontSize: '14px', fontWeight: '500',
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                {[...allYearwise].reverse().map((row) => (
                  <option key={row.year} value={String(row.year)} style={{ color: '#333', background: '#fff' }}>
                    {row.year}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Focus on a specific year</span>
              </div>
            </div>
          </div>

          {/* Data Cards */}
          {[
            { label: 'Total Employees', icon: '👥', data: allYearwise,         grad: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102,126,234,0.2)' },
            { label: 'Faculty',         icon: '🎓', data: teachingYearwise,    grad: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)', shadow: 'rgba(34,211,238,0.2)' },
            { label: 'Staff',           icon: '🏢', data: nonTeachingYearwise, grad: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', shadow: 'rgba(249,115,22,0.2)' },
          ].map(({ label, icon, data, grad, shadow }) => {
            const row = data.find((r) => String(r.year) === selectedYear);
            const val = row ? (row.Total || 0) : 0;
            return (
              <div key={label} style={{
                background: grad, borderRadius: '16px', padding: '24px',
                boxShadow: `0 10px 20px ${shadow}`, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>{icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    {data.length === 0 ? '—' : val}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                      {selectedYear ? `In year ${selectedYear}` : 'Select a year'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── View selector buttons — OUTSIDE chart box, exactly like ICC ── */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          {VIEWS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => { setError(null); setActiveView(value); }}
              style={{
                padding: '10px 24px',
                backgroundColor: activeView === value ? '#667eea' : '#f8f9fa',
                color: activeView === value ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeView === value ? '600' : '500',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Yearwise Strength — chart identical in style to ICC's trend view
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'yearwise' && (
          <div style={CHART_BOX}>
            {filterPanel}

            {/* Chart header: title (left) + metric toggle buttons (right) — mirrors ICC */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '20px' }}>
                  Year-wise Employee Strength
                </h2>
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                  Overview of total employees and gender-wise breakdown year over year.
                </p>
              </div>
              {/* Toggle buttons — identical style to ICC's Total / Resolved / Pending */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {SERIES_META.map(({ key, color, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSeries(key)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: visibleSeries[key] ? color : '#f0f0f0',
                      color: visibleSeries[key] ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {yearwiseData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                <p style={{ color: '#666', fontSize: '16px' }}>No employee records available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={yearwiseData}
                  margin={{ top: 10, right: 20, left: 40, bottom: 30 }}
                >
                  {/* Gradients — identical structure to ICC (5 % → 0.8, 95 % → 0) */}
                  <defs>
                    {SERIES_META.map(({ gradientId, color }) => (
                      <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0}   />
                      </linearGradient>
                    ))}
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {/* Conditionally rendered Areas — same pattern as ICC */}
                  {SERIES_META.map(({ key, color, gradientId, label }) =>
                    visibleSeries[key] ? (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={label}
                        stroke={color}
                        fill={`url(#${gradientId})`}
                        strokeWidth={2}
                      />
                    ) : null
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            Department Strength — stacked bar chart
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'department' && (
          <div style={CHART_BOX}>
            {filterPanel}

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '20px' }}>
                Department-wise Employee Strength
              </h2>
              <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                Gender-wise employee distribution across departments.
              </p>
            </div>

            {!hasDeptData ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                <p style={{ color: '#666', fontSize: '16px' }}>No department data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={employeeData} margin={{ top: 5, right: 16, left: 0, bottom: 130 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={<CustomXAxisTick />} interval={0} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<StackedBarTooltip total={total} />} />
                  <Legend verticalAlign="top" align="center"
                    content={(props) => <CustomLegend {...props} total={total} />} />
                  <Bar dataKey="Male"        stackId="a" fill="#667eea" {...BAR_ANIMATION} />
                  <Bar dataKey="Female"      stackId="a" fill="#764ba2" {...BAR_ANIMATION} />
                  <Bar dataKey="Transgender" stackId="a" fill="#43e97b" {...BAR_ANIMATION} />
                  <Bar dataKey="Other"       stackId="a" fill="#f093fb" {...BAR_ANIMATION} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            Gender Ratio — pie chart
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'gender' && (
          <div style={CHART_BOX}>
            {filterPanel}

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '20px' }}>
                Gender Distribution
              </h2>
              <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                Gender ratio among employees at IIT Palakkad.
              </p>
            </div>

            {genderData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                <p style={{ color: '#666', fontSize: '16px' }}>No gender data available.</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={420}>
                  <PieChart>
                    <Pie
                      data={genderData} cx="50%" cy="48%" outerRadius={150}
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                      labelLine={true}
                      isAnimationActive={true}
                      animationDuration={700}
                    >
                      {genderData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip total={genderTotal} />} />
                    <Legend verticalAlign="bottom" align="center"
                      formatter={(value) => (
                        <span style={{ color: GENDER_COLORS[value] || '#555', fontWeight: 600, fontSize: '0.82rem' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.82rem', fontWeight: 700, color: '#1a1a1a' }}>
                  Total Employees: {genderTotal}
                </div>
              </>
            )}
          </div>
        )}

        <DataUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tableName="employees"
          token={token}
        />
      </div>
    </div>
  );
}

export default AdministrativeSection;
