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
  fetchTechinSummary,
  fetchTechinPrograms,
  fetchTechinSkillDev,
  fetchTechinStartups,
  fetchTechinFilterOptions
} from '../services/techinStats';
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
      backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc',
      borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>Year: {label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: 0, color: entry.color }}>Count: {formatNumber(entry.value)}</p>
      ))}
    </div>
  );
}

// ─── Shared trend chart (Bar or Line) ─────────────────────────────────────────
function TrendChart({ data, color, chartType }) {
  if (!data?.length) return null;
  const margin = { top: 20, right: 30, left: 40, bottom: 20 };

  if (chartType === 'Bar') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 12 }} />
          <YAxis stroke="#666" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="count" name="Count" fill={color} radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
        <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 12 }} />
        <YAxis stroke="#666" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone" dataKey="count" name="Count"
          stroke={color} strokeWidth={3}
          dot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Data directory table ─────────────────────────────────────────────────────
function DataTable({ tableData, viewType, viewColor }) {
  if (!tableData?.length) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
      <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📋</span>
      <p style={{ fontSize: '16px' }}>No records found for the selected filters.</p>
    </div>
  );

  const thStyle = { padding: '14px 12px', textAlign: 'left', fontSize: '14px', backgroundColor: viewColor, color: 'white' };

  return (
    <div style={{ maxHeight: '550px', overflowY: 'auto', overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fff' }}>
      <table className="grievance-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <tr>
            {viewType === 'programs' && (
              <>
                <th style={thStyle}>Program Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Association</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Attendees</th>
              </>
            )}
            {viewType === 'skillDev' && (
              <>
                <th style={thStyle}>Program Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Association</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Attendees</th>
              </>
            )}
            {viewType === 'startups' && (
              <>
                <th style={thStyle}>Startup Name</th>
                <th style={thStyle}>Domain</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Jobs</th>
                <th style={thStyle}>Revenue</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              {viewType === 'programs' && (
                <>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{row.program_name}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.type}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.association}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.event_date || row.start_end ? new Date(row.event_date || row.start_end).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.no_of_attendess || '0'}</td>
                </>
              )}
              {viewType === 'skillDev' && (
                <>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{row.program_name}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.category}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.association}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.event_date || row.start_end ? new Date(row.event_date || row.start_end).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.no_of_attendess || '0'}</td>
                </>
              )}
              {viewType === 'startups' && (
                <>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{row.startup_name}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.domain}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      backgroundColor: row.status === 'Active' ? '#dcfce7' : '#fef3c7',
                      color: row.status === 'Active' ? '#166534' : '#92400e',
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-block'
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{row.number_of_jobs || '0'}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                    {row.revenue ? `₹${formatNumber(row.revenue)}` : '-'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function TechinSection({ user, isPublicView = false }) {
  const uploadVersion = useUploadRefresh();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [viewType, setViewType]   = useState('programs');
  const [chartType, setChartType] = useState('Bar');    // 'Bar' | 'Trend'
  const [repoMode, setRepoMode]   = useState(false);    // true = full directory from summary card

  const [programFilters, setProgramFilters]   = useState({ type: 'All', association: 'All' });
  const [skillDevFilters, setSkillDevFilters] = useState({ category: 'All', association: 'All' });
  const [startupFilters, setStartupFilters]   = useState({ domain: 'All', status: 'All' });

  const [summary, setSummary] = useState({
    total_programs: 0, total_skill_dev_programs: 0, total_startups: 0,
    total_startup_revenue: 0, highest_revenue: 0, lowest_revenue: 0, average_revenue: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    programs:  { types: [], associations: [] },
    skill_dev: { categories: [], associations: [] },
    startups:  { domains: [], statuses: [] }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Initial load
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [sumData, filterOps] = await Promise.all([
          fetchTechinSummary(token),
          fetchTechinFilterOptions(token)
        ]);
        if (sumData)    setSummary(sumData);
        if (filterOps)  setFilterOptions(filterOps);
      } catch (err) {
        setError(err.message || 'Failed to initialize TechIn data');
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
        if (viewType === 'programs')  result = await fetchTechinPrograms(programFilters, token);
        if (viewType === 'skillDev')  result = await fetchTechinSkillDev(skillDevFilters, token);
        if (viewType === 'startups')  result = await fetchTechinStartups(startupFilters, token);
        if (alive && result) {
          setTrendData(result.trend || []);
          setTableData(result.data  || []);
        }
      } catch (err) {
        if (alive) setError(err.message || `Failed to load ${viewType} data`);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token, viewType, programFilters, skillDevFilters, startupFilters, uploadVersion]);

  const switchView = (type) => { setViewType(type); setChartType('Bar'); setRepoMode(false); };
  const openRepo   = (type) => { setViewType(type); setChartType('Bar'); setRepoMode(true); };

  const handleFilterChange = (field, value) => {
    if (viewType === 'programs')  setProgramFilters(p => ({ ...p, [field]: value }));
    if (viewType === 'skillDev')  setSkillDevFilters(p => ({ ...p, [field]: value }));
    if (viewType === 'startups')  setStartupFilters(p => ({ ...p, [field]: value }));
  };

  const handleClearFilters = () => {
    if (viewType === 'programs')  setProgramFilters({ type: 'All', association: 'All' });
    if (viewType === 'skillDev')  setSkillDevFilters({ category: 'All', association: 'All' });
    if (viewType === 'startups')  setStartupFilters({ domain: 'All', status: 'All' });
  };

  // View config
  const VIEW_CONFIG = {
    programs: { color: '#667eea', emoji: '📊', label: 'Programs Trend',          repoLabel: 'All Programs'  },
    skillDev: { color: '#f093fb', emoji: '🎯', label: 'Skill Development Trend', repoLabel: 'All Skill Dev Programs' },
    startups: { color: '#43e97b', emoji: '🚀', label: 'Startups Growth',         repoLabel: 'All Startups'  },
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {!isPublicView && <h1 style={{ margin: 0 }}>TechIn</h1>}

          {/* Upload buttons */}
          {user?.role_id === 3 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { table: 'techin_program_table',             label: 'Upload Programs'  },
                { table: 'techin_skill_development_program', label: 'Upload Skill Dev' },
                { table: 'techin_startup_table',             label: 'Upload Startups'  },
              ].map(({ table, label }) => (
                <button
                  key={table}
                  onClick={() => { setActiveUploadTable(table); setIsUploadModalOpen(true); }}
                  style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  📤 {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* ── Top summary cards (clickable → repo) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px', marginBottom: '30px' }}>
          {[
            { key: 'programs', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', shadow: 'rgba(102,126,234,0.25)', emoji: '📚', label: 'Total Programs',       value: summary.total_programs,          subtitle: 'Active programs'  },
            { key: 'skillDev', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', shadow: 'rgba(240,147,251,0.25)', emoji: '🎯', label: 'Skill Dev Programs',  value: summary.total_skill_dev_programs, subtitle: 'Active programs'  },
            { key: 'startups', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', shadow: 'rgba(67,233,123,0.25)',  emoji: '🚀', label: 'Total Startups',       value: summary.total_startups,          subtitle: 'Active startups'  },
          ].map(({ key, gradient, shadow, emoji, label, value, subtitle }) => (
            <div
              key={key}
              onClick={() => openRepo(key)}
              title={`Click to view ${label} directory`}
              style={{
                background: gradient, borderRadius: '20px', padding: '28px',
                boxShadow: `0 15px 30px ${shadow}`, color: 'white',
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 36px ${shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 15px 30px ${shadow}`; }}
            >
              {/* decorative circle */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '28px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>{emoji}</span>
                  <span style={{ fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>{label}</span>
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>{formatNumber(value)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>{subtitle}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.65 }}>Click for directory →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue metrics (non-clickable, kept as-is) ── */}
        <h3 style={{ marginTop: '0', marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: '600' }}>Startup Revenue Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Revenue',   value: summary.total_startup_revenue, gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)', shadow: 'rgba(59,130,246,0.2)'   },
            { label: 'Highest Revenue', value: summary.highest_revenue,       gradient: 'linear-gradient(135deg,#10b981,#059669)', shadow: 'rgba(16,185,129,0.2)'  },
            { label: 'Average Revenue', value: summary.average_revenue,       gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', shadow: 'rgba(245,158,11,0.2)'  },
            { label: 'Lowest Revenue',  value: summary.lowest_revenue,        gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', shadow: 'rgba(239,68,68,0.2)'   },
          ].map(({ label, value, gradient, shadow }) => (
            <div key={label} style={{ background: gradient, borderRadius: '16px', padding: '24px', boxShadow: `0 8px 20px ${shadow}`, color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '12px' }}>{label}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>₹{formatNumber(value)}</div>
              </div>
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

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading data…</p>
          </div>
        ) : (
          <div style={{ marginBottom: '30px', padding: '24px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>

            {repoMode ? (
              /* ── Repo / directory mode ── */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setRepoMode(false)}
                    style={{ padding: '6px 14px', border: `1.5px solid ${cfg.color}`, borderRadius: '20px', background: '#fff', color: cfg.color, cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    ← Back to {cfg.label}
                  </button>
                  <h3 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '600' }}>
                    <span style={{ fontSize: '24px' }}>{cfg.emoji}</span>
                    {cfg.repoLabel} Directory
                  </h3>
                  <span style={{ color: '#888', fontSize: '13px' }}>{tableData.length} records</span>
                </div>
                <DataTable tableData={tableData} viewType={viewType} viewColor={cfg.color} />
              </div>
            ) : (
              /* ── Normal chart + filters + table mode ── */
              <>
                {/* Filters */}
                <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: '600' }}>
                      Filters for {viewType === 'programs' ? 'Programs' : viewType === 'skillDev' ? 'Skill Development' : 'Startups'}
                    </h4>
                    <button
                      onClick={handleClearFilters}
                      style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                    >
                      Clear Filters
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
                    {viewType === 'programs' && (
                      <>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Type</label>
                          <select value={programFilters.type} onChange={e => handleFilterChange('type', e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                            <option value="All">All Types</option>
                            {filterOptions.programs.types.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Association</label>
                          <select value={programFilters.association} onChange={e => handleFilterChange('association', e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                            <option value="All">All Associations</option>
                            {filterOptions.programs.associations.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                    {viewType === 'skillDev' && (
                      <>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Category</label>
                          <select value={skillDevFilters.category} onChange={e => handleFilterChange('category', e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                            <option value="All">All Categories</option>
                            {filterOptions.skill_dev.categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Association</label>
                          <select value={skillDevFilters.association} onChange={e => handleFilterChange('association', e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                            <option value="All">All Associations</option>
                            {filterOptions.skill_dev.associations.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                    {viewType === 'startups' && (
                      <>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Domain</label>
                          <select value={startupFilters.domain} onChange={e => handleFilterChange('domain', e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                            <option value="All">All Domains</option>
                            {filterOptions.startups.domains.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Status</label>
                          <select value={startupFilters.status} onChange={e => handleFilterChange('status', e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                            <option value="All">All Statuses</option>
                            {filterOptions.startups.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e9ecef', borderRadius: '8px', fontSize: '13px' }}>
                    <strong>Active Filters:</strong>{' '}
                    {viewType === 'programs' && (
                      <>
                        {programFilters.type        !== 'All' && <span style={{ marginRight: '10px' }}>📌 Type: {programFilters.type}</span>}
                        {programFilters.association !== 'All' && <span style={{ marginRight: '10px' }}>🏢 Assoc: {programFilters.association}</span>}
                        {programFilters.type === 'All' && programFilters.association === 'All' && <span>No filters applied</span>}
                      </>
                    )}
                    {viewType === 'skillDev' && (
                      <>
                        {skillDevFilters.category   !== 'All' && <span style={{ marginRight: '10px' }}>📌 Category: {skillDevFilters.category}</span>}
                        {skillDevFilters.association !== 'All' && <span style={{ marginRight: '10px' }}>🏢 Assoc: {skillDevFilters.association}</span>}
                        {skillDevFilters.category === 'All' && skillDevFilters.association === 'All' && <span>No filters applied</span>}
                      </>
                    )}
                    {viewType === 'startups' && (
                      <>
                        {startupFilters.domain !== 'All' && <span style={{ marginRight: '10px' }}>🎯 Domain: {startupFilters.domain}</span>}
                        {startupFilters.status !== 'All' && <span style={{ marginRight: '10px' }}>✅ Status: {startupFilters.status}</span>}
                        {startupFilters.domain === 'All' && startupFilters.status === 'All' && <span>No filters applied</span>}
                      </>
                    )}
                  </div>
                </div>

                {/* Chart section */}
                {trendData.length > 0 ? (
                  <div style={{ marginBottom: '40px' }}>
                    <div className="chart-header" style={{ marginBottom: '20px' }}>
                      <h2 style={{ margin: '0 0 8px', color: '#333', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
                        <span style={{ fontSize: '28px' }}>{cfg.emoji}</span>
                        {cfg.label}
                      </h2>
                      <ChartToggle value={chartType} onChange={setChartType} accentColor={cfg.color} />
                    </div>

                    <TrendChart data={trendData} color={cfg.color} chartType={chartType} />

                    {/* Stats strip */}
                    <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e0e0e0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: cfg.color, fontWeight: 'bold', fontSize: '32px' }}>{trendData.reduce((s, d) => s + d.count, 0)}</div>
                        <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Total</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '32px' }}>{trendData.length}</div>
                        <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Years Covered</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '32px' }}>{trendData.length > 0 ? Math.max(...trendData.map(d => d.count)) : 0}</div>
                        <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Peak Year</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                    <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📈</span>
                    <p style={{ fontSize: '16px' }}>No trend data available for the selected filters.</p>
                  </div>
                )}

                {/* Detailed data table */}
                <div style={{ marginTop: '30px' }}>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333', fontSize: '20px', fontWeight: '600' }}>Detailed Data</h3>
                    <p style={{ color: '#666', margin: '5px 0 0', fontSize: '14px' }}>{tableData.length} records found</p>
                  </div>
                  <DataTable tableData={tableData} viewType={viewType} viewColor={cfg.color} />
                </div>
              </>
            )}
          </div>
        )}
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

export default TechinSection;
