import { useState, useEffect, useMemo } from 'react';
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
  fetchIptifSummary,
  fetchIptifProjects,
  fetchIptifPrograms,
  fetchIptifStartups,
  fetchIptifFacilities,
  fetchIptifFilterOptions
} from '../services/iptifStats';
import './Page.css';
import './PeopleCampus.css';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function IptifSection({ user }) {
  const token = localStorage.getItem('authToken');

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('projects'); // projects, programs, startups, facilities

  const [summary, setSummary] = useState({
    total_projects: 0,
    total_programs: 0,
    total_startups: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [tableData, setTableData] = useState([]);
  
  const [filterOptions, setFilterOptions] = useState({
    projects: { schemes: [], statuses: [], years: [] },
    programs: { types: [], associations: [] },
    startups: { domains: [], statuses: [] },
    facilities: { types: [] }
  });

  // Filters state broken down by view to preserve state across views
  const [projectFilters, setProjectFilters] = useState({ scheme: 'All', status: 'All', year: 'All' });
  const [programFilters, setProgramFilters] = useState({ type: 'All', association: 'All' });
  const [startupFilters, setStartupFilters] = useState({ domain: 'All', status: 'All' });
  const [facilityFilters, setFacilityFilters] = useState({ facility_type: 'All' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial Data Load
  useEffect(() => {
    if (!token) return;
    const initialLoad = async () => {
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
        if (viewType === 'projects') {
          result = await fetchIptifProjects(projectFilters, token);
        } else if (viewType === 'programs') {
          result = await fetchIptifPrograms(programFilters, token);
        } else if (viewType === 'startups') {
          result = await fetchIptifStartups(startupFilters, token);
        } else if (viewType === 'facilities') {
          result = await fetchIptifFacilities(facilityFilters, token);
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
  }, [token, viewType, projectFilters, programFilters, startupFilters, facilityFilters]);

  // Handlers
  const handleFilterChange = (setter) => (field, value) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    if (viewType === 'projects') setProjectFilters({ scheme: 'All', status: 'All', year: 'All' });
    if (viewType === 'programs') setProgramFilters({ type: 'All', association: 'All' });
    if (viewType === 'startups') setStartupFilters({ domain: 'All', status: 'All' });
    if (viewType === 'facilities') setFacilityFilters({ facility_type: 'All' });
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
              Count/Revenue: {formatNumber(entry.value)}
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
        <h1 style={{ marginBottom: '5px' }}>IPTIF</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Overview of IIT Palakkad Technology IHub Foundation initiatives.
        </p>

        {error && <div className="error-message" style={{ 
          padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' 
        }}>{error}</div>}

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 10px 20px rgba(102, 126, 234, 0.2)', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Projects</h3>
            <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{formatNumber(summary.total_projects)}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 10px 20px rgba(240, 147, 251, 0.2)', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Programs</h3>
            <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{formatNumber(summary.total_programs)}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 10px 20px rgba(67, 233, 123, 0.2)', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Startups</h3>
            <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{formatNumber(summary.total_startups)}</div>
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
              { id: 'projects', label: 'Projects Trend', color: '#667eea' },
              { id: 'programs', label: 'Programs Trend', color: '#f093fb' },
              { id: 'startups', label: 'Startups Trend', color: '#43e97b' },
              { id: 'facilities', label: 'Facilities Revenue', color: '#f97316' }
            ].map(type => (
              <label key={type.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px',
                backgroundColor: viewType === type.id ? type.color : 'white',
                color: viewType === type.id ? 'white' : '#333',
                borderRadius: '6px', border: `2px solid ${type.color}`, transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio" name="iptifViewType" value={type.id}
                  checked={viewType === type.id} onChange={(e) => setViewType(e.target.value)}
                  style={{ accentColor: type.color }}
                />
                <span style={{ fontWeight: viewType === type.id ? 'bold' : 'normal' }}>{type.label}</span>
              </label>
            ))}
          </div>

          {/* Dynamic Filters Area */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            
            {viewType === 'projects' && (
              <>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Scheme</label>
                  <select
                    className="filter-select" value={projectFilters.scheme}
                    onChange={(e) => handleFilterChange(setProjectFilters)('scheme', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Schemes</option>
                    {filterOptions.projects.schemes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
                  <select
                    className="filter-select" value={projectFilters.status}
                    onChange={(e) => handleFilterChange(setProjectFilters)('status', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Statuses</option>
                    {filterOptions.projects.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Year</label>
                  <select
                    className="filter-select" value={projectFilters.year}
                    onChange={(e) => handleFilterChange(setProjectFilters)('year', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Years</option>
                    {filterOptions.projects.years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            )}

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

            {viewType === 'facilities' && (
              <>
                <div className="filter-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Facility Type</label>
                  <select
                    className="filter-select" value={facilityFilters.facility_type}
                    onChange={(e) => handleFilterChange(setFacilityFilters)('facility_type', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  >
                    <option value="All">All Facility Types</option>
                    {filterOptions.facilities.types.map(t => <option key={t} value={t}>{t}</option>)}
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
                    {viewType === 'projects' ? 'Projects Trend' : 
                     viewType === 'programs' ? 'Programs Trend' : 
                     viewType === 'startups' ? 'Startups Growth' : 'Revenue Growth'}
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
                        name={viewType === 'facilities' ? 'Revenue' : 'Count'} 
                        stroke="#667eea" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: '#667eea', strokeWidth: 2, stroke: '#fff' }} 
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
                        <tr style={{ backgroundColor: viewType === 'facilities' ? '#f97316' : viewType === 'startups' ? '#43e97b' : viewType === 'programs' ? '#f093fb' : '#667eea', color: 'white' }}>
                          {viewType === 'projects' && (
                            <><th style={{ padding: '12px', textAlign: 'left' }}>Project Name</th><th style={{ padding: '12px', textAlign: 'left' }}>Scheme</th><th style={{ padding: '12px', textAlign: 'left' }}>Status</th><th style={{ padding: '12px', textAlign: 'left' }}>Start Date</th></>
                          )}
                          {viewType === 'programs' && (
                            <><th style={{ padding: '12px', textAlign: 'left' }}>Program Name</th><th style={{ padding: '12px', textAlign: 'left' }}>Type</th><th style={{ padding: '12px', textAlign: 'left' }}>Association</th><th style={{ padding: '12px', textAlign: 'left' }}>Target Audience</th><th style={{ padding: '12px', textAlign: 'left' }}>Attendees</th></>
                          )}
                          {viewType === 'startups' && (
                            <><th style={{ padding: '12px', textAlign: 'left' }}>Startup Name</th><th style={{ padding: '12px', textAlign: 'left' }}>Domain</th><th style={{ padding: '12px', textAlign: 'left' }}>Status</th><th style={{ padding: '12px', textAlign: 'left' }}>Jobs</th><th style={{ padding: '12px', textAlign: 'left' }}>Revenue</th></>
                          )}
                          {viewType === 'facilities' && (
                            <><th style={{ padding: '12px', textAlign: 'left' }}>Facility Name</th><th style={{ padding: '12px', textAlign: 'left' }}>Type</th><th style={{ padding: '12px', textAlign: 'left' }}>Availability</th><th style={{ padding: '12px', textAlign: 'left' }}>Financial Year</th><th style={{ padding: '12px', textAlign: 'left' }}>Revenue (₹)</th></>
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
                            {viewType === 'projects' && (
                              <>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{row.project_name}</td>
                                <td style={{ padding: '12px' }}>{row.scheme}</td>
                                <td style={{ padding: '12px' }}><span className="status-badge" style={{ backgroundColor: row.status === 'Ongoing' ? '#e0f2fe' : '#f1f5f9', color: row.status === 'Ongoing' ? '#0284c7' : '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>{row.status}</span></td>
                                <td style={{ padding: '12px' }}>{row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A'}</td>
                              </>
                            )}
                            {viewType === 'programs' && (
                              <>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{row.program_name}</td>
                                <td style={{ padding: '12px' }}>{row.type}</td>
                                <td style={{ padding: '12px' }}>{row.association}</td>
                                <td style={{ padding: '12px' }}>{row.targetted_audi}</td>
                                <td style={{ padding: '12px' }}>{row.no_of_attendees}</td>
                              </>
                            )}
                            {viewType === 'startups' && (
                              <>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{row.startup_name}</td>
                                <td style={{ padding: '12px' }}>{row.domain}</td>
                                <td style={{ padding: '12px' }}>{row.status}</td>
                                <td style={{ padding: '12px' }}>{row.number_of_jobs}</td>
                                <td style={{ padding: '12px' }}>{row.revenue ? `₹${formatNumber(row.revenue)}` : '-'}</td>
                              </>
                            )}
                            {viewType === 'facilities' && (
                              <>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{row.facility_name}</td>
                                <td style={{ padding: '12px' }}>{row.facility_type}</td>
                                <td style={{ padding: '12px' }}>{row.availability_status}</td>
                                <td style={{ padding: '12px' }}>{row.financial_year}</td>
                                <td style={{ padding: '12px' }}>{row.revenue_made ? formatNumber(row.revenue_made) : '0'}</td>
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

export default IptifSection;
