import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  fetchIcsrSummary,
  fetchIcsrYearlyDistribution,
  fetchIcsrEventTypes,
  fetchIcsrEvents,
  fetchIcsrFilterOptions
} from '../services/industryConnectStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

const EVENT_TYPE_COLORS = ['#4f46e5', '#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15', '#fb7185', '#14b8a6', '#ec4899', '#8b5cf6'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function IcsrSection({ user, isPublicView = false }) {
  const token = localStorage.getItem('authToken');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [summary, setSummary] = useState({
    total_events: 0,
    total_funding: 0
  });

  const [yearlyDistribution, setYearlyDistribution] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    event_types: [],
    departments: [],
    years: []
  });

  // View type selection with radio buttons
  const [viewType, setViewType] = useState('yearly'); // 'yearly' | 'eventTypes' | 'eventsDirectory'

  const [filters, setFilters] = useState({
    event_type: 'All',
    department: 'All',
    year: 'All',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload Modal State
  const [activeUploadTable] = useState('industry_events');

  // Data loading functions
  const loadSummary = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchIcsrSummary(filters, token);
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Failed to load summary data');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  const loadYearlyDistribution = useCallback(async () => {
    if (!token) return;
    try {
      const result = await fetchIcsrYearlyDistribution(filters, token);
      setYearlyDistribution(result.data || []);
    } catch (err) {
      console.error('Error loading yearly distribution:', err);
    }
  }, [token, filters]);

  const loadEventTypes = useCallback(async () => {
    if (!token) return;
    try {
      const result = await fetchIcsrEventTypes(filters, token);
      setEventTypes(result.data || []);
    } catch (err) {
      console.error('Error loading event types:', err);
    }
  }, [token, filters]);

  const loadEvents = useCallback(async () => {
    if (!token) return;
    try {
      const result = await fetchIcsrEvents(
        filters,
        pagination.page,
        pagination.per_page,
        token
      );
      setEventsList(result.data || []);
      setPagination(prev => result.pagination || prev);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  }, [token, filters, pagination.page, pagination.per_page]);

  const loadFilterOptions = useCallback(async () => {
    if (!token) return;
    try {
      const options = await fetchIcsrFilterOptions(token);
      setFilterOptions({
        event_types: options?.event_types || [],
        departments: options?.departments || [],
        years: options?.years || []
      });
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  }, [token]);

  const refreshData = () => {
    loadSummary();
    loadYearlyDistribution();
    loadEventTypes();
    loadEvents();
    loadFilterOptions();
  };

  // Initial Data Load (Filter options only once, summary/charts on filters)
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Load summary and chart data when filters change
  useEffect(() => {
    loadSummary();
    loadYearlyDistribution();
    loadEventTypes();
  }, [loadSummary, loadYearlyDistribution, loadEventTypes, filters]);

  // Load events when filters/pagination change
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      event_type: 'All',
      department: 'All',
      year: 'All',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Chart data
  const yearlyChartData = useMemo(() => {
    return yearlyDistribution.map(row => ({
      year: row.year,
      events: row.event_count || 0
    }));
  }, [yearlyDistribution]);

  const eventTypesPieData = useMemo(() => {
    return eventTypes.map(row => ({
      name: row.event_type,
      value: row.count || 0
    }));
  }, [eventTypes]);

  // Custom Tooltip
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
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '0', color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
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
        {!isPublicView && <h1>ICSR Section - Industry Interaction Events</h1>}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Track and analyze industry engagement events, workshops, seminars, and networking activities
          coordinated by the Industrial Consultancy & Sponsored Research (ICSR) section.
        </p>

        {error && <div className="error-message" style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>{error}</div>}

        {/* Modern Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Total Industry Events Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-40px',
              width: '180px',
              height: '180px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <span style={{
                  fontSize: '32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '10px',
                  borderRadius: '12px'
                }}>🏭</span>
                <h3 style={{
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>Total Industry Events</h3>
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                lineHeight: '1.2'
              }}>
                {formatNumber(summary.total_events)}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  background: '#4ade80',
                  borderRadius: '50%'
                }} />
                <span style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Total industry interactions
                </span>
              </div>
            </div>
          </div>

          {/* Departments Involved Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 15px 35px rgba(240, 147, 251, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-40px',
              width: '180px',
              height: '180px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <span style={{
                  fontSize: '32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '10px',
                  borderRadius: '12px'
                }}>🏢</span>
                <h3 style={{
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>Total Funding Generated</h3>
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                lineHeight: '1.2'
              }}>
                ₹{formatNumber(summary.total_funding)}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  background: '#4ade80',
                  borderRadius: '50%'
                }} />
                <span style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Amount sanctioned from events
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Single View Section based on radio selection */}
        <div className="chart-section" style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* ── Compact filter bar ── */}
          <div style={{
            background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '20px'
          }}>
            {/* Header row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '0.75rem', paddingBottom: '0.6rem', borderBottom: '1px solid #e0e0e0',
              flexWrap: 'wrap', gap: '0.5rem'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a' }}>Filters &amp; View</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={handleClearFilters}
                  style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }}>
                  Clear Filters
                </button>
                {!isPublicView && user && user.role_id === 3 && (
                  <button onClick={() => setIsUploadModalOpen(true)}
                    style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer' }}>
                    Upload Data
                  </button>
                )}
              </div>
            </div>

            {/* View type selector */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {[
                { value: 'yearly',          label: '📊 Year-wise',        color: '#667eea' },
                { value: 'eventTypes',      label: '🥧 Event Types',      color: '#22c55e' },
                { value: 'eventsDirectory', label: '📋 Events Directory', color: '#f97316' },
              ].map(({ value, label, color }) => (
                <button key={value} onClick={() => setViewType(value)}
                  style={{
                    padding: '0.3rem 0.9rem', fontSize: '0.78rem', borderRadius: '6px', cursor: 'pointer',
                    border: `2px solid ${color}`,
                    backgroundColor: viewType === value ? color : '#fff',
                    color: viewType === value ? '#fff' : color,
                    fontWeight: viewType === value ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Filter dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a1a1a' }}>Event Type</label>
                <select value={filters.event_type} onChange={(e) => handleFilterChange('event_type', e.target.value)}
                  className="filter-select"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid #ced4da' }}>
                  <option value="All">All Types</option>
                  {filterOptions.event_types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a1a1a' }}>Year</label>
                <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="filter-select"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid #ced4da' }}>
                  <option value="All">All Years</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a1a1a' }}>Search Events</label>
                <input type="text"
                  placeholder="Search by title, industry partner..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="filter-select"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>
          </div>
          {/* Yearly Distribution Chart */}
          {viewType === 'yearly' && (
            <div>
              <div className="chart-header" style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span> Year-wise Event Distribution
                </h2>
                <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                  Distribution of industry events and participating departments over time.
                </p>
              </div>

              {loading ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner" />
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <>
                  {yearlyChartData.length > 0 ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={yearlyChartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis
                            dataKey="year"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{
                              value: 'Year',
                              position: 'insideBottom',
                              offset: -10,
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                          />
                          <YAxis
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            label={{
                              value: 'Count',
                              angle: -90,
                              position: 'insideLeft',
                              style: { fill: '#666', fontSize: 14, fontWeight: 'bold' }
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }}
                            iconType="rect"
                          />
                          <Bar
                            dataKey="events"
                            name="Events"
                            fill="#667eea"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Chart Statistics */}
                      <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '15px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '24px' }}>
                            {yearlyChartData.reduce((sum, item) => sum + item.events, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Total Events</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                            {yearlyChartData.length > 0 ? Math.max(...yearlyChartData.map(item => item.events)) : 0}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Peak Events in Year</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {yearlyChartData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Years Covered</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-data" style={{
                      textAlign: 'center',
                      padding: '60px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No yearly distribution data available.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Event Types Distribution Chart */}
          {viewType === 'eventTypes' && (
            <div>
              <div className="chart-header" style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🥧</span> Event Types Distribution
                </h2>
                <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                  Frequency of different types of industry interaction events.
                </p>
              </div>

              {loading ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner" />
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <>
                  {eventTypesPieData.length > 0 ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={450}>
                        <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                          <Pie
                            data={eventTypesPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            labelLine={{ stroke: '#666', strokeWidth: 1 }}
                          >
                            {eventTypesPieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={EVENT_TYPE_COLORS[index % EVENT_TYPE_COLORS.length]}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`${value} events`, name]}
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{
                              paddingLeft: '20px',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Chart Statistics */}
                      <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '15px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '24px' }}>
                            {eventTypesPieData.length}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Event Types</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                            {eventTypesPieData.reduce((sum, item) => sum + item.value, 0)}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Total Events</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                            {eventTypesPieData.length > 0
                              ? Math.max(...eventTypesPieData.map(item => item.value))
                              : 0}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>Most Common</div>
                        </div>
                      </div>

                      {/* Event Type Details Cards */}
                      <div style={{
                        marginTop: '20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '10px'
                      }}>
                        {eventTypesPieData.map((type, index) => (
                          <div key={type.name} style={{
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '10px',
                            border: `1px solid ${EVENT_TYPE_COLORS[index % EVENT_TYPE_COLORS.length]}`,
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{type.name}</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: EVENT_TYPE_COLORS[index % EVENT_TYPE_COLORS.length] }}>
                              {type.value}
                            </div>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                              {((type.value / eventTypesPieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-data" style={{
                      textAlign: 'center',
                      padding: '60px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🥧</span>
                      <p style={{ color: '#666', fontSize: '16px' }}>No event types data available.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Events Directory Table */}
          {viewType === 'eventsDirectory' && (
            <div>
              <div className="chart-header" style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📋</span> Industry Events Directory
                </h2>
                <p className="chart-description" style={{ color: '#666', margin: '0' }}>
                  Search and filter through all industry interaction events.
                </p>
              </div>

              {eventsList.length > 0 ? (
                <div>
                  <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="grievance-table" style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f97316', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Event Title</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Industry Partner</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Duration (hrs)</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventsList.map((event, index) => (
                          <tr
                            key={event.event_id}
                            style={{
                              backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            <td style={{ padding: '12px', fontWeight: '500' }}>{event.event_title}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                backgroundColor: '#e0e7ff',
                                color: '#4f46e5',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                display: 'inline-block'
                              }}>
                                {event.event_type}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{event.industry_partner || '—'}</td>
                            <td style={{ padding: '12px' }}>{event.event_date ? new Date(event.event_date).toLocaleDateString() : '—'}</td>
                            <td style={{ padding: '12px' }}>{event.duration_hours ? `${event.duration_hours}` : '—'}</td>
                            <td style={{ padding: '12px' }}>{event.department || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Statistics */}
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '15px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>
                        {eventsList.length}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Showing</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '20px' }}>
                        {new Set(eventsList.map(e => e.event_type)).size}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Event Types</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '20px' }}>
                        {new Set(eventsList.map(e => e.department).filter(Boolean)).size}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Departments</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '20px' }}>
                        {eventsList.reduce((sum, e) => sum + (e.duration_hours || 0), 0)}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Total Hours</div>
                    </div>
                  </div>

                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1rem',
                      marginTop: '2rem',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: pagination.page === 1 ? '#ccc' : '#f97316',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ← Previous
                      </button>
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        Page <strong>{pagination.page}</strong> of <strong>{pagination.total_pages}</strong>
                        <span style={{ marginLeft: '8px', color: '#999' }}>
                          ({formatNumber(pagination.total)} total events)
                        </span>
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.total_pages}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: pagination.page >= pagination.total_pages ? '#ccc' : '#f97316',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: pagination.page >= pagination.total_pages ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data" style={{
                  textAlign: 'center',
                  padding: '60px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
                  <p style={{ color: '#666', fontSize: '16px' }}>No events found for the selected filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <DataUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tableName={activeUploadTable}
          token={token}
          onUploadSuccess={refreshData}
        />
      </div>
    </div>
  );
}

export default IcsrSection;