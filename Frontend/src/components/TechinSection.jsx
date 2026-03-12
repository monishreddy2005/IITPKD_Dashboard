import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import './Page.css';
import './PeopleCampus.css';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function TechinSection({ user }) {
  const token = localStorage.getItem('authToken');

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('programs'); // programs, skillDev, startups

  const [summary, setSummary] = useState({
    total_programs: 0,
    total_skill_dev_programs: 0,
    total_startups: 0,
    total_startup_revenue: 0,
    highest_revenue: 0,
    lowest_revenue: 0,
    average_revenue: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [tableData, setTableData] = useState([]);
  
  const [filterOptions, setFilterOptions] = useState({
    programs: { types: [], associations: [] },
    skill_dev: { categories: [], associations: [] },
    startups: { domains: [], statuses: [] }
  });

  // Filters state broken down by view to preserve state across views
  const [programFilters, setProgramFilters] = useState({ type: 'All', association: 'All' });
  const [skillDevFilters, setSkillDevFilters] = useState({ category: 'All', association: 'All' });
  const [startupFilters, setStartupFilters] = useState({ domain: 'All', status: 'All' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial Data Load
  useEffect(() => {
    if (!token) return;
    const initialLoad = async () => {
      try {
        setLoading(true);
        const [sumData, filterOps] = await Promise.all([
          fetchTechinSummary(token),
          fetchTechinFilterOptions(token)
        ]);
        if (sumData) setSummary(sumData);
        if (filterOps) setFilterOptions(filterOps);
      } catch (err) {
        setError(err.message || 'Failed to initialize TechIn data');
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, [token]);

  // Load specific view data
  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    
    const loadViewData = async () => {
      setLoading(true);
      setError(null);
      try {
        let result;
        if (viewType === 'programs') {
          result = await fetchTechinPrograms(programFilters, token);
        } else if (viewType === 'skillDev') {
          result = await fetchTechinSkillDev(skillDevFilters, token);
        } else if (viewType === 'startups') {
          result = await fetchTechinStartups(startupFilters, token);
        }

        if (isMounted && result) {
          setTrendData(result.trend || []);
          setTableData(result.data || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || `Failed to load ${viewType} data`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadViewData();
    return () => { isMounted = false; };
  }, [token, viewType, programFilters, skillDevFilters, startupFilters]);

  // Handlers
  const handleFilterChange = (setter) => (field, value) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    if (viewType === 'programs') setProgramFilters({ type: 'All', association: 'All' });
    if (viewType === 'skillDev') setSkillDevFilters({ category: 'All', association: 'All' });
    if (viewType === 'startups') setStartupFilters({ domain: 'All', status: 'All' });
  };

  // Custom Line Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>Year: {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '0', color: entry.color }}>
              Count: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 style={{ marginBottom: '5px' }}>TechIn</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Overview of TechIn Entrepreneurship and Skill Development initiatives.
        </p>

        {error && <div className="error-message" style={{ 
          padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' 
        }}>{error}</div>}

        {/* First Row of Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 10px 20px rgba(102, 126, 234, 0.2)', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Programs</h3>
            <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{formatNumber(summary.total_programs)}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 10px 20px rgba(240, 147, 251, 0.2)', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Skill Dev Programs</h3>
            <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{formatNumber(summary.total_skill_dev_programs)}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 10px 20px rgba(67, 233, 123, 0.2)', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Startups</h3>
            <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{formatNumber(summary.total_startups)}</div>
          </div>
        </div>

        {/* Second Row of Summary Cards (Revenue) */}
        <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#333' }}>Startup Revenue Metrics</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Total Revenue</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>₹{formatNumber(summary.total_startup_revenue)}</div>
          </div>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Highest Revenue</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>₹{formatNumber(summary.highest_revenue)}</div>
          </div>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Average Revenue</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}>₹{formatNumber(summary.average_revenue)}</div>
          </div>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Lowest Revenue</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e11d48' }}>₹{formatNumber(summary.lowest_revenue)}</div>
          </div>
        </div>

        {/* View Selection & Filters Container */}
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Trends & Analysis</h3>
            <button
              onClick={handleClearFilters}
              style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Clear Current Filters
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
            {[
              { id: 'programs', label: 'Programs Trend', color: '#667eea' },
              { id: 'skillDev', label: 'Skill Dev Trend', color: '#f093fb' },
              { id: 'startups', label: 'Startups Trend', color: '#43e97b' }
            ].map(type => (
              <label key={type.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px',
                backgroundColor: viewType === type.id ? type.color : 'white',
                color: viewType === type.id ? 'white' : '#333',
                borderRadius: '6px', border: `2px solid ${type.color}`, transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio" name="techinViewType" value={type.id}
                  checked={viewType === type.id} onChange={(e) => setViewType(e.target.value)}
                  style={{ accentColor: type.color }}
                />
                <span style={{ fontWeight: viewType === type.id ? 'bold' : 'normal' }}>{type.label}</span>
              </label>
            ))}
          </div>

          {/* Dynamic Filters Area */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            
            {viewType === 'programs' && (
              <>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type</label>
                  <select
                    className="filter-select" value={programFilters.type}
                    onChange={(e) => handleFilterChange(setProgramFilters)('type', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Types</option>
                    {filterOptions.programs.types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Association</label>
                  <select
                    className="filter-select" value={programFilters.association}
                    onChange={(e) => handleFilterChange(setProgramFilters)('association', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Associations</option>
                    {filterOptions.programs.associations.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </>
            )}

            {viewType === 'skillDev' && (
              <>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
                  <select
                    className="filter-select" value={skillDevFilters.category}
                    onChange={(e) => handleFilterChange(setSkillDevFilters)('category', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Categories</option>
                    {filterOptions.skill_dev.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Association</label>
                  <select
                    className="filter-select" value={skillDevFilters.association}
                    onChange={(e) => handleFilterChange(setSkillDevFilters)('association', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Associations</option>
                    {filterOptions.skill_dev.associations.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </>
            )}

            {viewType === 'startups' && (
              <>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Domain</label>
                  <select
                    className="filter-select" value={startupFilters.domain}
                    onChange={(e) => handleFilterChange(setStartupFilters)('domain', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Domains</option>
                    {filterOptions.startups.domains.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
                  <select
                    className="filter-select" value={startupFilters.status}
                    onChange={(e) => handleFilterChange(setStartupFilters)('status', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Statuses</option>
                    {filterOptions.startups.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Dynamic Views: Charts and Tables */}
        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" /><p>Loading data...</p></div>
          ) : (
            <>
              {trendData.length > 0 ? (
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>
                    {viewType === 'programs' ? 'Programs Trend' : 
                     viewType === 'skillDev' ? 'Skill Development Trend' : 'Startups Growth'}
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" stroke="#666" padding={{ left: 30, right: 30 }} />
                      <YAxis stroke="#666" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name={'Count'} 
                        stroke={viewType === 'programs' ? '#667eea' : viewType === 'skillDev' ? '#f093fb' : '#43e97b'} 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: viewType === 'programs' ? '#667eea' : viewType === 'skillDev' ? '#f093fb' : '#43e97b', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>📈</span>
                  No trend data available for the selected filters.
                </div>
              )}

              {/* Data Table */}
              <div style={{ overflowX: 'auto', marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Detailed Data</h3>
                {tableData.length > 0 ? (
                  <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="grievance-table" style={{
                      width: '100%',
                      minWidth: '800px',
                      borderCollapse: 'collapse',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: viewType === 'startups' ? '#43e97b' : viewType === 'skillDev' ? '#f093fb' : '#667eea', color: 'white' }}>
                          {viewType === 'programs' && (
                            <><th style={{ padding: '12px', textAlign: 'left' }}>Program Name</th><th style={{ padding: '12px', textAlign: 'left' }}>Type</th><th style={{ padding: '12px', textAlign: 'left' }}>Association</th><th style={{ padding: '12px', textAlign: 'left' }}>Date</th><th style={{ padding: '12px', textAlign: 'left' }}>Attendees</th></>
                          )}
                          {viewType === 'skillDev' && (
                            <><th style={{ padding: '12px', textAlign: 'left' }}>Program Name</th><th style={{ padding: '12px', textAlign: 'left' }}>Category</th><th style={{ padding: '12px', textAlign: 'left' }}>Association</th><th style={{ padding: '12px', textAlign: 'left' }}>Date</th><th style={{ padding: '12px', textAlign: 'left' }}>Attendees</th></>
                          )}
                          {viewType === 'startups' && (
                            <><th style={{ padding: '12px', textAlign: 'left' }}>Startup Name</th><th style={{ padding: '12px', textAlign: 'left' }}>Domain</th><th style={{ padding: '12px', textAlign: 'left' }}>Status</th><th style={{ padding: '12px', textAlign: 'left' }}>Jobs</th><th style={{ padding: '12px', textAlign: 'left' }}>Revenue</th></>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            {viewType === 'programs' && (
                              <>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{row.program_name}</td>
                                <td style={{ padding: '12px' }}>{row.type}</td>
                                <td style={{ padding: '12px' }}>{row.association}</td>
                                <td style={{ padding: '12px' }}>{row.event_date || row.start_end ? new Date(row.event_date || row.start_end).toLocaleDateString() : 'N/A'}</td>
                                <td style={{ padding: '12px' }}>{row.no_of_attendess || '0'}</td>
                              </>
                            )}
                            {viewType === 'skillDev' && (
                              <>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{row.program_name}</td>
                                <td style={{ padding: '12px' }}>{row.category}</td>
                                <td style={{ padding: '12px' }}>{row.association}</td>
                                <td style={{ padding: '12px' }}>{row.event_date || row.start_end ? new Date(row.event_date || row.start_end).toLocaleDateString() : 'N/A'}</td>
                                <td style={{ padding: '12px' }}>{row.no_of_attendess || '0'}</td>
                              </>
                            )}
                            {viewType === 'startups' && (
                              <>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{row.startup_name}</td>
                                <td style={{ padding: '12px' }}>{row.domain}</td>
                                <td style={{ padding: '12px' }}><span className="status-badge" style={{ backgroundColor: row.status === 'Active' ? '#e0f2fe' : '#f1f5f9', color: row.status === 'Active' ? '#0284c7' : '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>{row.status}</span></td>
                                <td style={{ padding: '12px' }}>{row.number_of_jobs || '0'}</td>
                                <td style={{ padding: '12px' }}>{row.revenue ? `₹${formatNumber(row.revenue)}` : '-'}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No records found.</p>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default TechinSection;
