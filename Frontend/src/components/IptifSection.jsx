import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  fetchIptifSummary,
  fetchIptifProjects,
  fetchIptifPrograms,
  fetchIptifStartups,
  fetchIptifFacilities,
  fetchIptifFilterOptions
} from '../services/iptifStats';
import { useUploadRefresh } from '../hooks/useUploadRefresh';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './PeopleCampus.css';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

// ─── Chart-type toggle ────────────────────────────────────────────────────────
function ChartToggle({ value, onChange, accentColor }) {
  const btn = (type, label) => (
    <button
      onClick={() => onChange(type)}
      style={{
        padding: '5px 16px',
        fontSize: '13px',
        fontWeight: value === type ? 700 : 400,
        border: `1.5px solid ${value === type ? accentColor : '#ddd'}`,
        borderRadius: '20px',
        background: value === type ? accentColor : '#fff',
        color: value === type ? '#fff' : '#555',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {btn('Bar', 'Bar')}
      {btn('Trend', 'Trend')}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', padding: '10px', border: '1px solid #ccc',
      borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#333' }}>Year: {label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: 0, color: entry.color }}>
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Shared trend / bar chart ─────────────────────────────────────────────────
function TrendChart({ data, dataKey, name, color, chartType }) {
  if (!data?.length) return null;
  const margin = { top: 20, right: 30, left: 40, bottom: 20 };

  if (chartType === 'Bar') {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" stroke="#666" padding={{ left: 30, right: 30 }} />
        <YAxis stroke="#666" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={3}
          dot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Filters block ────────────────────────────────────────────────────────────
function FiltersBlock({ children, onClear, activeFiltersDisplay }) {
  return (
    <div style={{
      marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa',
      borderRadius: '8px', border: '1px solid #e9ecef'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Filters</h4>
        <button
          onClick={onClear}
          style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          Clear Filters
        </button>
      </div>
      {children}
      <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '12px' }}>
        <strong>Active Filters:</strong> {activeFiltersDisplay}
      </div>
    </div>
  );
}

// ─── Directory tables ─────────────────────────────────────────────────────────
function ProjectsDirectory({ data, color }) {
  if (!data?.length) return null;
  const cols = ['2fr', '1.5fr', '1fr', '1.2fr'];
  const hdrs = ['Project Name', 'Scheme', 'Status', 'Start Date'];
  return (
    <div>
      <h3 style={{ marginBottom: '15px' }}>Projects Directory</h3>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: color, color: 'white', display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', fontWeight: 'bold', fontSize: '13px' }}>
          {hdrs.map(h => <div key={h}>{h}</div>)}
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {data.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #e0e0e0', fontSize: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: '500' }}>{row.project_name}</div>
              <div>{row.scheme}</div>
              <div>
                <span style={{ backgroundColor: row.status === 'Ongoing' ? '#e0f2fe' : '#f1f5f9', color: row.status === 'Ongoing' ? '#0284c7' : '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
                  {row.status}
                </span>
              </div>
              <div>{row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramsDirectory({ data, color }) {
  if (!data?.length) return null;
  const cols = ['2fr', '1.2fr', '1.2fr', '1.5fr', '1fr'];
  const hdrs = ['Program Name', 'Type', 'Association', 'Target Audience', 'Attendees'];
  return (
    <div>
      <h3 style={{ marginBottom: '15px' }}>Programs Directory</h3>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: color, color: 'white', display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', fontWeight: 'bold', fontSize: '13px' }}>
          {hdrs.map(h => <div key={h}>{h}</div>)}
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {data.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #e0e0e0', fontSize: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: '500' }}>{row.program_name}</div>
              <div>{row.type}</div>
              <div>{row.association}</div>
              <div>{row.targetted_audi}</div>
              <div>{row.no_of_attendees}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StartupsDirectory({ data, color }) {
  if (!data?.length) return null;
  const cols = ['1.8fr', '1.5fr', '1fr', '1fr', '1.2fr'];
  const hdrs = ['Startup Name', 'Domain', 'Status', 'Jobs Created', 'Revenue (₹)'];
  return (
    <div>
      <h3 style={{ marginBottom: '15px' }}>Startups Directory</h3>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: color, color: 'white', display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', fontWeight: 'bold', fontSize: '13px' }}>
          {hdrs.map(h => <div key={h}>{h}</div>)}
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {data.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #e0e0e0', fontSize: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: '500' }}>{row.startup_name}</div>
              <div>{row.domain}</div>
              <div>{row.status}</div>
              <div>{row.number_of_jobs}</div>
              <div>{row.revenue ? `₹${formatNumber(row.revenue)}` : '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FacilitiesDirectory({ data, color }) {
  if (!data?.length) return null;
  const cols = ['2fr', '1.5fr', '1.2fr', '1.2fr', '1.2fr'];
  const hdrs = ['Facility Name', 'Type', 'Availability', 'Financial Year', 'Revenue (₹)'];
  return (
    <div>
      <h3 style={{ marginBottom: '15px' }}>Facilities Directory</h3>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: color, color: 'white', display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', fontWeight: 'bold', fontSize: '13px' }}>
          {hdrs.map(h => <div key={h}>{h}</div>)}
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {data.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: cols.join(' '), gap: '8px', padding: '12px', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #e0e0e0', fontSize: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: '500' }}>{row.facility_name}</div>
              <div>{row.facility_type}</div>
              <div>{row.availability_status}</div>
              <div>{row.financial_year}</div>
              <div>{row.revenue_made ? formatNumber(row.revenue_made) : '0'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function IptifSection({ user, isPublicView = false }) {
  const uploadVersion = useUploadRefresh();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [viewType, setViewType] = useState('projects');
  const [chartType, setChartType] = useState('Bar');   // 'Bar' | 'Trend'
  const [repoMode, setRepoMode] = useState(false);     // true = show full directory from summary card click

  const [summary, setSummary] = useState({ total_projects: 0, total_programs: 0, total_startups: 0 });
  const [trendData, setTrendData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [filterOptions, setFilterOptions] = useState({
    projects: { schemes: [], statuses: [], years: [] },
    programs: { types: [], associations: [] },
    startups: { domains: [], statuses: [] },
    facilities: { types: [] }
  });

  const [projectFilters, setProjectFilters] = useState({ scheme: 'All', status: 'All', year: 'All' });
  const [programFilters, setProgramFilters] = useState({ type: 'All', association: 'All' });
  const [startupFilters, setStartupFilters] = useState({ domain: 'All', status: 'All' });
  const [facilityFilters, setFacilityFilters] = useState({ facility_type: 'All' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial load
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const [sumData, filterOps] = await Promise.all([
          fetchIptifSummary(token),
          fetchIptifFilterOptions(token)
        ]);
        if (sumData) setSummary(sumData);
        if (filterOps) setFilterOptions(filterOps);
      } catch (err) {
        setError(err.message || 'Failed to initialize IPTIF data');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, uploadVersion]);

  // Load view data
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let result;
        if (viewType === 'projects')   result = await fetchIptifProjects(projectFilters, token);
        if (viewType === 'programs')   result = await fetchIptifPrograms(programFilters, token);
        if (viewType === 'startups')   result = await fetchIptifStartups(startupFilters, token);
        if (viewType === 'facilities') result = await fetchIptifFacilities(facilityFilters, token);
        if (alive && result) {
          setTrendData(result.trend || []);
          setTableData(result.data || []);
        }
      } catch (err) {
        if (alive) setError(err.message || `Failed to load ${viewType} data`);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token, viewType, projectFilters, programFilters, startupFilters, facilityFilters, uploadVersion]);

  const switchView = (type) => {
    setViewType(type);
    setChartType('Bar');
    setRepoMode(false);
  };

  const openRepo = (type) => {
    setViewType(type);
    setChartType('Bar');
    setRepoMode(true);
  };

  const handleFilterChange = (setter) => (field, value) => setter(prev => ({ ...prev, [field]: value }));

  const handleClearFilters = () => {
    if (viewType === 'projects')   setProjectFilters({ scheme: 'All', status: 'All', year: 'All' });
    if (viewType === 'programs')   setProgramFilters({ type: 'All', association: 'All' });
    if (viewType === 'startups')   setStartupFilters({ domain: 'All', status: 'All' });
    if (viewType === 'facilities') setFacilityFilters({ facility_type: 'All' });
  };

  // View config
  const VIEW_CONFIG = {
    projects:   { color: '#667eea', emoji: '📊', label: 'Projects Trend',    dataKey: 'count', name: 'Projects Count'  },
    programs:   { color: '#f093fb', emoji: '🎓', label: 'Programs Trend',    dataKey: 'count', name: 'Programs Count'  },
    startups:   { color: '#43e97b', emoji: '🚀', label: 'Startups Growth',   dataKey: 'count', name: 'Startups Count'  },
    facilities: { color: '#f97316', emoji: '🏭', label: 'Facilities Revenue', dataKey: 'count', name: 'Revenue (₹)'     },
  };
  const cfg = VIEW_CONFIG[viewType];

  return (
    <div className={isPublicView ? '' : 'page-container'}>
      <div className={isPublicView ? '' : 'page-content'}>
        {!isPublicView && (
          <button className="page-back-btn" onClick={() => navigate('/innovation-entrepreneurship')}>
            ← Back to Innovation &amp; Entrepreneurship
          </button>
        )}

        <h1 style={{ marginBottom: '5px' }}>IPTIF</h1>

        {/* Upload buttons */}
        {user?.role_id === 3 && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {[
              { table: 'iptif_projects_table',  label: 'Upload Projects',   bg: '#667eea' },
              { table: 'iptif_program_table',   label: 'Upload Programs',   bg: '#f093fb' },
              { table: 'iptif_startup_table',   label: 'Upload Startups',   bg: '#43e97b' },
              { table: 'iptif_facilities_table', label: 'Upload Facilities', bg: '#f97316' },
            ].map(({ table, label, bg }) => (
              <button
                key={table}
                onClick={() => { setActiveUploadTable(table); setIsUploadModalOpen(true); }}
                style={{ padding: '8px 16px', backgroundColor: bg, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                📤 {label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* ── Summary Cards (clickable → repo) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {[
            { key: 'projects',  label: 'Total Projects',  value: summary.total_projects,  gradient: 'linear-gradient(135deg,#667eea,#764ba2)', shadow: 'rgba(102,126,234,0.2)' },
            { key: 'programs',  label: 'Total Programs',  value: summary.total_programs,  gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', shadow: 'rgba(240,147,251,0.2)' },
            { key: 'startups',  label: 'Total Startups',  value: summary.total_startups,  gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', shadow: 'rgba(67,233,123,0.2)' },
          ].map(({ key, label, value, gradient, shadow }) => (
            <div
              key={key}
              onClick={() => openRepo(key)}
              title={`Click to view all ${label}`}
              style={{
                background: gradient, borderRadius: '20px', padding: '24px',
                boxShadow: `0 10px 20px ${shadow}`, color: 'white',
                cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 28px ${shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 10px 20px ${shadow}`; }}
            >
              <h3 style={{ margin: '0 0 10px', fontSize: '16px', opacity: 0.9 }}>{label}</h3>
              <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{formatNumber(value)}</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '6px' }}>Click to view directory →</div>
            </div>
          ))}
        </div>

        {/* ── View selector buttons ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {Object.entries(VIEW_CONFIG).map(([key, { color, emoji, label }]) => (
            <button
              key={key}
              onClick={() => switchView(key)}
              style={{
                padding: '12px 28px',
                backgroundColor: viewType === key && !repoMode ? color : 'white',
                color: viewType === key && !repoMode ? 'white' : '#333',
                border: `2px solid ${viewType === key && !repoMode ? color : '#dee2e6'}`,
                borderRadius: '50px', cursor: 'pointer', fontSize: '15px',
                fontWeight: viewType === key && !repoMode ? '600' : '500',
                transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: viewType === key && !repoMode ? `0 6px 16px ${color}40` : 'none'
              }}
            >
              <span style={{ fontSize: '18px' }}>{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ── Content panel ── */}
        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading data…</p>
            </div>
          ) : repoMode ? (
            /* ── Repo / directory mode ── */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => setRepoMode(false)}
                  style={{ padding: '6px 14px', border: `1.5px solid ${cfg.color}`, borderRadius: '20px', background: '#fff', color: cfg.color, cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  ← Back to {cfg.label}
                </button>
                <h2 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>{cfg.emoji}</span>
                  {viewType === 'projects' ? 'All Projects' : viewType === 'programs' ? 'All Programs' : 'All Startups'} Directory
                </h2>
              </div>
              {viewType === 'projects'  && <ProjectsDirectory  data={tableData} color={cfg.color} />}
              {viewType === 'programs'  && <ProgramsDirectory  data={tableData} color={cfg.color} />}
              {viewType === 'startups'  && <StartupsDirectory  data={tableData} color={cfg.color} />}
              {tableData.length === 0 && <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>No data available.</p>}
            </div>
          ) : (
            /* ── Normal chart + filtered table mode ── */
            <div>
              {/* View header */}
              <div className="chart-header" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{cfg.emoji}</span> {cfg.label}
                  </h2>
                </div>
                <ChartToggle value={chartType} onChange={setChartType} accentColor={cfg.color} />
              </div>

              {/* Filters */}
              {viewType === 'projects' && (
                <FiltersBlock
                  onClear={handleClearFilters}
                  activeFiltersDisplay={
                    <>
                      {projectFilters.scheme !== 'All' && <span style={{ marginRight: '8px' }}>📌 {projectFilters.scheme}</span>}
                      {projectFilters.status !== 'All' && <span style={{ marginRight: '8px' }}>⚡ {projectFilters.status}</span>}
                      {projectFilters.year   !== 'All' && <span style={{ marginRight: '8px' }}>📅 {projectFilters.year}</span>}
                      {projectFilters.scheme === 'All' && projectFilters.status === 'All' && projectFilters.year === 'All' && 'No filters applied'}
                    </>
                  }
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                    <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Scheme</label>
                      <select value={projectFilters.scheme} onChange={e => handleFilterChange(setProjectFilters)('scheme', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                        <option value="All">All Schemes</option>
                        {filterOptions.projects.schemes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Status</label>
                      <select value={projectFilters.status} onChange={e => handleFilterChange(setProjectFilters)('status', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                        <option value="All">All Statuses</option>
                        {filterOptions.projects.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Start Year</label>
                      <select value={projectFilters.year} onChange={e => handleFilterChange(setProjectFilters)('year', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                        <option value="All">All Years</option>
                        {filterOptions.projects.years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </FiltersBlock>
              )}

              {viewType === 'programs' && (
                <FiltersBlock
                  onClear={handleClearFilters}
                  activeFiltersDisplay={
                    <>
                      {programFilters.type        !== 'All' && <span style={{ marginRight: '8px' }}>📌 {programFilters.type}</span>}
                      {programFilters.association !== 'All' && <span style={{ marginRight: '8px' }}>🤝 {programFilters.association}</span>}
                      {programFilters.type === 'All' && programFilters.association === 'All' && 'No filters applied'}
                    </>
                  }
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                    <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Type</label>
                      <select value={programFilters.type} onChange={e => handleFilterChange(setProgramFilters)('type', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                        <option value="All">All Types</option>
                        {filterOptions.programs.types.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Association</label>
                      <select value={programFilters.association} onChange={e => handleFilterChange(setProgramFilters)('association', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                        <option value="All">All Associations</option>
                        {filterOptions.programs.associations.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                </FiltersBlock>
              )}

              {viewType === 'startups' && (
                <FiltersBlock
                  onClear={handleClearFilters}
                  activeFiltersDisplay={
                    <>
                      {startupFilters.domain !== 'All' && <span style={{ marginRight: '8px' }}>🌐 {startupFilters.domain}</span>}
                      {startupFilters.status !== 'All' && <span style={{ marginRight: '8px' }}>⚡ {startupFilters.status}</span>}
                      {startupFilters.domain === 'All' && startupFilters.status === 'All' && 'No filters applied'}
                    </>
                  }
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                    <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Domain</label>
                      <select value={startupFilters.domain} onChange={e => handleFilterChange(setStartupFilters)('domain', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                        <option value="All">All Domains</option>
                        {filterOptions.startups.domains.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Status</label>
                      <select value={startupFilters.status} onChange={e => handleFilterChange(setStartupFilters)('status', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                        <option value="All">All Statuses</option>
                        {filterOptions.startups.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </FiltersBlock>
              )}

              {viewType === 'facilities' && (
                <FiltersBlock
                  onClear={handleClearFilters}
                  activeFiltersDisplay={
                    facilityFilters.facility_type !== 'All'
                      ? <span>🏢 {facilityFilters.facility_type}</span>
                      : 'No filters applied'
                  }
                >
                  <div><label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Facility Type</label>
                    <select value={facilityFilters.facility_type} onChange={e => handleFilterChange(setFacilityFilters)('facility_type', e.target.value)} style={{ padding: '6px', fontSize: '13px', width: '100%' }}>
                      <option value="All">All Facility Types</option>
                      {filterOptions.facilities.types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </FiltersBlock>
              )}

              {/* Chart */}
              {trendData.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <TrendChart
                    data={trendData}
                    dataKey={cfg.dataKey}
                    name={cfg.name}
                    color={cfg.color}
                    chartType={chartType}
                  />
                </div>
              )}

              {/* Directory table */}
              {viewType === 'projects'  && <ProjectsDirectory  data={tableData} color={cfg.color} />}
              {viewType === 'programs'  && <ProgramsDirectory  data={tableData} color={cfg.color} />}
              {viewType === 'startups'  && <StartupsDirectory  data={tableData} color={cfg.color} />}
              {viewType === 'facilities' && <FacilitiesDirectory data={tableData} color={cfg.color} />}

              {trendData.length === 0 && tableData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                  <p>No data available for the selected filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName={activeUploadTable}
        token={token}
      />
    </div>
  );
}

export default IptifSection;
