import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchFilterOptions, fetchGenderDistributionFiltered, fetchStudentStrengthFiltered, fetchGenderTrends, fetchProgramTrends } from '../services/academicStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb'];
const TREND_COLORS = ['#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#ff9a9e', '#fbc2eb', '#a18cd1', '#fad0c4', '#ffd1ff', '#a6c1ee'];

const AREA_COLORS = {
  Total:       { stroke: '#667eea', fill: 'url(#colorTotal)' },
  Male:        { stroke: '#667eea', fill: 'url(#colorMale)' },
  Female:      { stroke: '#764ba2', fill: 'url(#colorFemale)' },
  Transgender: { stroke: '#f093fb', fill: 'url(#colorTransgender)' },
};

const BAR_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 700,
  animationEasing: 'ease-out',
  animationBegin: 80
};

const AreaGradients = () => (
  <defs>
    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#667eea" stopOpacity={0.75} />
      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#667eea" stopOpacity={0.75} />
      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#764ba2" stopOpacity={0.75} />
      <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="colorTransgender" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#f093fb" stopOpacity={0.75} />
      <stop offset="95%" stopColor="#f093fb" stopOpacity={0} />
    </linearGradient>
  </defs>
);

// Shared custom legend: colour swatches + optional total count on the right
const InlineLegend = ({ payload, totalLabel, totalValue }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.1rem',
    fontSize: '0.8rem',
    flexWrap: 'wrap',
    paddingBottom: '6px',
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
    {totalValue !== undefined && (
      <span style={{
        borderLeft: '1px solid #d0d0d0',
        paddingLeft: '1rem',
        fontWeight: 700,
        color: '#1a1a1a',
        whiteSpace: 'nowrap',
      }}>
        {totalLabel ?? 'Total'}: {totalValue}
      </span>
    )}
  </div>
);

function AcademicSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    yearofadmission: [], program: [], batch: [], branch: [],
    department: [], category: [], state: [], latest_year: null
  });

  const [filters, setFilters] = useState({
    yearofadmission: null, program: null, batch: null, branch: null,
    department: null, category: null, pwd: null
  });

  const [genderData, setGenderData] = useState({ Male: 0, Female: 0, Transgender: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // Student Strength
  const [studentStrengthData, setStudentStrengthData] = useState([]);
  const [strengthFilters, setStrengthFilters] = useState({ yearofadmission: null, category: null, state: null });
  const [strengthLoading, setStrengthLoading] = useState(false);
  const [strengthError, setStrengthError] = useState(null);
  const [strengthTotal, setStrengthTotal] = useState(0);

  // Gender Trend
  const [selectedGender, setSelectedGender] = useState('Total');
  const [chartType, setChartType] = useState('Trend');
  const [trendYears, setTrendYears] = useState(5);
  const [genderTrendData, setGenderTrendData] = useState([]);
  const [genderTrendLoading, setGenderTrendLoading] = useState(true);
  const [genderTrendFilters, setGenderTrendFilters] = useState({
    program: null, batch: null, department: null, category: null, pwd: null
  });
  const [trendTotal, setTrendTotal] = useState(0);

  // Program Trend
  const [programTrendData, setProgramTrendData] = useState([]);
  const [programTrendPrograms, setProgramTrendPrograms] = useState([]);
  const [programTrendLoading, setProgramTrendLoading] = useState(true);
  const [programTrendFilters, setProgramTrendFilters] = useState({ category: null, state: null });

  const [activeChart, setActiveChart] = useState('genderTrend');
  const token = localStorage.getItem('authToken');

  // Whether the upload button should be shown
  const showUploadBtn = !isPublicView && user && (user.role_id === 3 || user.role_id === 4);

  useEffect(() => {
    const load = async () => {
      if (!token) { setError('Authentication token not found. Please log in again.'); setLoading(false); return; }
      try {
        setLoading(true); setError(null);
        const options = await fetchFilterOptions(token);
        setFilterOptions(options);
        if (options.latest_year) {
          setFilters(prev => ({ ...prev, yearofadmission: options.latest_year }));
          setStrengthFilters(prev => ({ ...prev, yearofadmission: options.latest_year }));
        }
      } catch { setError('Failed to load filter options. Please try again.'); }
      finally { setLoading(false); }
    };
    load();
  }, [token]);

  const displayGenderTrendData = useMemo(() => {
    if (!genderTrendData || genderTrendData.length === 0) return [];
    const sliced = genderTrendData.slice(-trendYears);
    if (selectedGender === 'Total') {
      return sliced.map(d => ({ year: d.year, Total: (d.Male || 0) + (d.Female || 0) + (d.Transgender || 0) }));
    }
    return sliced;
  }, [genderTrendData, trendYears, selectedGender]);

  useEffect(() => {
    const sum = displayGenderTrendData.reduce((acc, d) => {
      if (selectedGender === 'Total') return acc + (d.Total || 0);
      if (selectedGender === 'All') return acc + (d.Male || 0) + (d.Female || 0) + (d.Transgender || 0);
      return acc + (d[selectedGender] || 0);
    }, 0);
    setTrendTotal(sum);
  }, [displayGenderTrendData, selectedGender]);

  const hasTrendData = displayGenderTrendData.some(
    d => (d.Total || 0) > 0 || (d.Male || 0) > 0 || (d.Female || 0) > 0 || (d.Transgender || 0) > 0
  );
  const hasProgramTrendData = programTrendData.length > 0 && programTrendData.slice(-5).some(
    d => programTrendPrograms.some(p => (d[p] || 0) > 0)
  );
  const hasStrengthData = strengthTotal > 0 && studentStrengthData.some(
    d => (d.Male || 0) > 0 || (d.Female || 0) > 0 || (d.Transgender || 0) > 0
  );

  useEffect(() => {
    const load = async () => {
      if (!token || filters.yearofadmission === null) return;
      try { setLoading(true); setError(null); const r = await fetchGenderDistributionFiltered(filters, token); setGenderData(r.data); setTotal(r.total); }
      catch { setError('Failed to load gender distribution data.'); }
      finally { setLoading(false); }
    };
    load();
  }, [filters, token]);

  useEffect(() => {
    const load = async () => {
      if (!token || strengthFilters.yearofadmission === null) return;
      try { setStrengthLoading(true); setStrengthError(null); const r = await fetchStudentStrengthFiltered(strengthFilters, token); setStudentStrengthData(r.data); setStrengthTotal(r.total); }
      catch { setStrengthError('Failed to load student strength data.'); }
      finally { setStrengthLoading(false); }
    };
    load();
  }, [strengthFilters, token]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try { setGenderTrendLoading(true); const r = await fetchGenderTrends(genderTrendFilters, token); setGenderTrendData(r.data); }
      catch (err) { console.error(err); }
      finally { setGenderTrendLoading(false); }
    };
    load();
  }, [genderTrendFilters, token]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try { setProgramTrendLoading(true); const r = await fetchProgramTrends(programTrendFilters, token); setProgramTrendData(r.data); setProgramTrendPrograms(r.programs); }
      catch (err) { console.error(err); }
      finally { setProgramTrendLoading(false); }
    };
    load();
  }, [programTrendFilters, token]);

  const handleFilterChange = (n, v) => setFilters(prev => ({ ...prev, [n]: v === 'All' ? (n === 'yearofadmission' ? 'All' : null) : v }));
  const handleClearFilters = () => setFilters({ yearofadmission: filterOptions.latest_year || null, program: null, batch: null, branch: null, department: null, category: null, pwd: null });
  const handleStrengthFilterChange = (n, v) => setStrengthFilters(prev => ({ ...prev, [n]: v === 'All' ? (n === 'yearofadmission' ? 'All' : null) : v }));
  const handleClearStrengthFilters = () => setStrengthFilters({ yearofadmission: filterOptions.latest_year || null, category: null, state: null });
  const handleGenderTrendFilterChange = (n, v) => setGenderTrendFilters(prev => ({ ...prev, [n]: v === 'All' ? null : v }));
  const handleClearGenderTrendFilters = () => { setGenderTrendFilters({ program: null, batch: null, department: null, category: null, pwd: null }); setTrendYears(5); setSelectedGender('Total'); setChartType('Trend'); };
  const handleProgramTrendFilterChange = (n, v) => setProgramTrendFilters(prev => ({ ...prev, [n]: v === 'All' ? null : v }));
  const handleClearProgramTrendFilters = () => setProgramTrendFilters({ category: null, state: null });

  const areaKeys = selectedGender === 'All' ? ['Male', 'Female', 'Transgender'] : [selectedGender];
  const fs = { padding: '0.28rem 1.6rem 0.28rem 0.45rem', fontSize: '0.75rem', borderRadius: '7px' };

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>

        {/* ✅ Only render section-header when the upload button is actually shown.
            This removes the empty gap that appeared for non-admin logged-in users. */}
        {showUploadBtn && (
          <div className="section-header">
            <div className="header-left" />
            <button className="upload-data-btn" onClick={() => setIsUploadModalOpen(true)}>
              Upload Data
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="chart-section">

          {/* ── 1. Gender Trend ── */}
          <div className={`chart-view ${activeChart === 'genderTrend' ? 'active' : ''}`}>
            <div className="chart-header" style={{ marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 0 }}>Student Overview</h2>
            </div>

            {/* Compact inline filters — 8 columns */}
            <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem', paddingBottom: '0.45rem', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a' }}>Filters</span>
                <button className="clear-filters-btn" onClick={handleClearGenderTrendFilters} style={{ padding: '0.28rem 0.8rem', fontSize: '0.76rem', borderRadius: '6px' }}>Clear All Filters</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.5rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>Graph Type</label>
                  <select value={chartType} onChange={e => setChartType(e.target.value)} className="filter-select" style={fs}>
                    <option value="Trend">Trend</option>
                    <option value="Bar">Bar Chart</option>
                  </select>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>Gender</label>
                  <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} className="filter-select" style={fs}>
                    <option value="Total">Total</option>
                    <option value="All">M : F : T</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>Program</label>
                  <select value={genderTrendFilters.program || 'All'} onChange={e => handleGenderTrendFilterChange('program', e.target.value)} className="filter-select" style={fs}>
                    <option value="All">All</option>
                    {filterOptions.program.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>Batch</label>
                  <select value={genderTrendFilters.batch || 'All'} onChange={e => handleGenderTrendFilterChange('batch', e.target.value)} className="filter-select" style={fs}>
                    <option value="All">All</option>
                    {filterOptions.batch.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>Department</label>
                  <select value={genderTrendFilters.department || 'All'} onChange={e => handleGenderTrendFilterChange('department', e.target.value)} className="filter-select" style={fs}>
                    <option value="All">All</option>
                    {filterOptions.department.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>Category</label>
                  <select value={genderTrendFilters.category || 'All'} onChange={e => handleGenderTrendFilterChange('category', e.target.value)} className="filter-select" style={fs}>
                    <option value="All">All</option>
                    {filterOptions.category.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>No. of Years</label>
                  <select value={trendYears} onChange={e => setTrendYears(parseInt(e.target.value, 10))} className="filter-select" style={fs}>
                    <option value={1}>Last 1 Yr</option>
                    <option value={2}>Last 2 Yrs</option>
                    <option value={3}>Last 3 Yrs</option>
                    <option value={5}>Last 5 Yrs</option>
                    <option value={10}>Last 10 Yrs</option>
                  </select>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'#1a1a1a' }}>PWD</label>
                  <select
                    value={genderTrendFilters.pwd === true ? 'true' : genderTrendFilters.pwd === false ? 'false' : 'All'}
                    onChange={e => { const v = e.target.value; handleGenderTrendFilterChange('pwd', v === 'true' ? true : v === 'false' ? false : null); }}
                    className="filter-select" style={fs}>
                    <option value="All">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`bar-chart-container trend-chart ${hasTrendData ? '' : 'has-empty'}`} style={{ padding: '0.75rem 1rem' }}>
              <div className={`trend-empty-state ${hasTrendData ? 'hidden' : ''}`}>
                <p>No information available for the selected filter</p>
              </div>

              {/* Area Chart */}
              <div className={`chart-wrapper ${chartType === 'Trend' ? 'active' : 'inactive'}`}>
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={displayGenderTrendData} margin={{ top: 8, right: 24, left: 40, bottom: 50 }}>
                    <AreaGradients />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis
                      dataKey="year" interval={0} angle={-45} textAnchor="end" height={60}
                      stroke="#000" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
                      label={{ value: 'Year', position: 'insideBottom', offset: -4, style: { textAnchor: 'middle', fill: '#555', fontSize: 13, fontWeight: 'bold' } }}
                    />
                    <YAxis
                      domain={[0, 'dataMax + 5']} allowDecimals={false}
                      stroke="#000" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
                      label={{ value: 'Students', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#555', fontSize: 13, fontWeight: 'bold' } }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#e0e0e0', borderRadius: '8px', fontSize: '0.82rem' }}
                      cursor={{ strokeDasharray: '4 2', stroke: '#667eea' }}
                    />
                    <Legend
                      verticalAlign="top" align="center"
                      content={(props) => <InlineLegend {...props} totalLabel="Total Students" totalValue={trendTotal} />}
                    />
                    {areaKeys.map(key => (
                      <Area
                        key={key} type="monotone" dataKey={key}
                        stroke={AREA_COLORS[key]?.stroke || '#667eea'}
                        fill={AREA_COLORS[key]?.fill || 'url(#colorTotal)'}
                        strokeWidth={2.5}
                        dot={{ fill: AREA_COLORS[key]?.stroke || '#667eea', r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={800} animationEasing="ease-in-out"
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className={`chart-wrapper ${chartType === 'Bar' ? 'active' : 'inactive'}`}>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={displayGenderTrendData} margin={{ top: 8, right: 24, left: 40, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis dataKey="year" interval={0} angle={-45} textAnchor="end" height={60} stroke="#000" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} />
                    <YAxis domain={[0, 'dataMax + 5']} allowDecimals={false} stroke="#000" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} />
                    <Tooltip />
                    <Legend
                      verticalAlign="top" align="center"
                      content={(props) => <InlineLegend {...props} totalLabel="Total Students" totalValue={trendTotal} />}
                    />
                    {selectedGender === 'Total'       && <Bar dataKey="Total"       fill="#667eea" isAnimationActive animationDuration={800} animationEasing="ease-in-out" />}
                    {selectedGender === 'All'         && <><Bar dataKey="Male" fill={COLORS[0]} isAnimationActive animationDuration={800} animationEasing="ease-in-out" /><Bar dataKey="Female" fill={COLORS[1]} isAnimationActive animationDuration={800} animationEasing="ease-in-out" /><Bar dataKey="Transgender" fill={COLORS[2]} isAnimationActive animationDuration={800} animationEasing="ease-in-out" /></>}
                    {selectedGender === 'Male'        && <Bar dataKey="Male"        fill={COLORS[0]} isAnimationActive animationDuration={800} animationEasing="ease-in-out" />}
                    {selectedGender === 'Female'      && <Bar dataKey="Female"      fill={COLORS[1]} isAnimationActive animationDuration={800} animationEasing="ease-in-out" />}
                    {selectedGender === 'Transgender' && <Bar dataKey="Transgender" fill={COLORS[2]} isAnimationActive animationDuration={800} animationEasing="ease-in-out" />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── 2. Student Strength by Program Trend ── */}
          <div className={`chart-view ${activeChart === 'programTrend' ? 'active' : ''}`}>
            <div className="chart-header">
              <h2>Student Strength by Program (Trend)</h2>
              <p className="chart-description">Student strength trends by program over the last 5 years.</p>
            </div>
            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="clear-filters-btn" onClick={handleClearProgramTrendFilters}>Clear All Filters</button>
              </div>
              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="program-trend-category-filter">Category</label>
                  <select id="program-trend-category-filter" value={programTrendFilters.category || 'All'} onChange={e => handleProgramTrendFilterChange('category', e.target.value)} className="filter-select">
                    <option value="All">All</option>
                    {filterOptions.category.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="program-trend-state-filter">State</label>
                  <select id="program-trend-state-filter" value={programTrendFilters.state || 'All'} onChange={e => handleProgramTrendFilterChange('state', e.target.value)} className="filter-select">
                    <option value="All">All</option>
                    {filterOptions.state.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className={`bar-chart-container trend-chart ${hasProgramTrendData ? '' : 'has-empty'}`}>
              <h3 className="chart-heading">Student Strength by Program (Trend)</h3>
              <div className={`trend-empty-state ${hasProgramTrendData ? 'hidden' : ''}`}>
                <p>No information available for the selected filter</p>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={programTrendData.slice(-5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="year" angle={-45} height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {programTrendPrograms.map((program, index) => (
                    <Bar key={program} dataKey={program} stackId="a" fill={TREND_COLORS[index % TREND_COLORS.length]} {...BAR_ANIMATION} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── 3. Student Strength by Program ── */}
          <div className={`chart-view ${activeChart === 'programStrength' ? 'active' : ''}`}>
            <div className="chart-header">
              <h2>Student Strength by Program</h2>
            </div>
            {strengthError && <div className="error-message">{strengthError}</div>}
            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="clear-filters-btn" onClick={handleClearStrengthFilters}>Clear All Filters</button>
              </div>
              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="strength-year-filter">Year of Admission</label>
                  <select id="strength-year-filter"
                    value={strengthFilters.yearofadmission === 'All' ? 'All' : strengthFilters.yearofadmission || ''}
                    onChange={e => { const v = e.target.value; handleStrengthFilterChange('yearofadmission', v === 'All' ? 'All' : v === '' ? null : parseInt(v)); }}
                    className="filter-select">
                    <option value="">Select Year</option>
                    <option value="All">All</option>
                    {filterOptions.yearofadmission.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="strength-category-filter">Category</label>
                  <select id="strength-category-filter" value={strengthFilters.category || 'All'} onChange={e => handleStrengthFilterChange('category', e.target.value)} className="filter-select">
                    <option value="All">All</option>
                    {filterOptions.category.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="strength-state-filter">State</label>
                  <select id="strength-state-filter" value={strengthFilters.state || 'All'} onChange={e => handleStrengthFilterChange('state', e.target.value)} className="filter-select">
                    <option value="All">All</option>
                    {filterOptions.state.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className={`bar-chart-container trend-chart ${hasStrengthData ? '' : 'has-empty'}`}>
              <h3 className="chart-heading">Student Strength by Program</h3>
              <div className={`trend-empty-state ${hasStrengthData ? 'hidden' : ''}`}>
                <p>No information available for the selected filter</p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={studentStrengthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} />
                  <YAxis />
                  <Tooltip content={<StackedBarTooltip total={strengthTotal} />} />
                  <Legend
                    verticalAlign="top" align="center"
                    content={(props) => <InlineLegend {...props} totalLabel="Total Students" totalValue={strengthTotal} />}
                  />
                  <Bar dataKey="Male"        stackId="a" fill="#667eea" {...BAR_ANIMATION} />
                  <Bar dataKey="Female"      stackId="a" fill="#764ba2" {...BAR_ANIMATION} />
                  <Bar dataKey="Transgender" stackId="a" fill="#f093fb" {...BAR_ANIMATION} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <DataUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} tableName="student" token={token} />
      </div>
    </div>
  );
}

const StackedBarTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const programTotal = (data.Male || 0) + (data.Female || 0) + (data.Transgender || 0);
    const percentage = total > 0 ? ((programTotal / total) * 100).toFixed(1) : 0;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`${data.name}: ${programTotal}`}</p>
        <p className="tooltip-percentage">{percentage}% of total</p>
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #555' }}>
          <p style={{ color: '#667eea', margin: '0.25rem 0', fontSize: '0.9rem' }}>Male: {data.Male || 0}</p>
          <p style={{ color: '#764ba2', margin: '0.25rem 0', fontSize: '0.9rem' }}>Female: {data.Female || 0}</p>
          <p style={{ color: '#f093fb', margin: '0.25rem 0', fontSize: '0.9rem' }}>Transgender: {data.Transgender || 0}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default AcademicSection;