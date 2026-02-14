import { useState, useEffect, useMemo } from 'react';
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
    departments_involved: 0
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
  const [activeUploadTable, setActiveUploadTable] = useState('industry_events');

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) return;
      try {
        const options = await fetchIcsrFilterOptions(token);
        setFilterOptions(options);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadFilterOptions();
  }, [token]);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchIcsrSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  // Load yearly distribution
  useEffect(() => {
    const loadYearlyDistribution = async () => {
      if (!token) return;
      try {
        const result = await fetchIcsrYearlyDistribution(token);
        setYearlyDistribution(result.data || []);
      } catch (err) {
        console.error('Error loading yearly distribution:', err);
      }
    };
    loadYearlyDistribution();
  }, [token]);

  // Load event types distribution
  useEffect(() => {
    const loadEventTypes = async () => {
      if (!token) return;
      try {
        const result = await fetchIcsrEventTypes(token);
        setEventTypes(result.data || []);
      } catch (err) {
        console.error('Error loading event types:', err);
      }
    };
    loadEventTypes();
  }, [token]);

  // Load events list
  useEffect(() => {
    const loadEvents = async () => {
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
    };
    loadEvents();
  }, [filters, pagination.page, pagination.per_page, token]);

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
      events: row.event_count || 0,
      departments: row.departments_count || 0
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
              {entry.name}: {entry.value}
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

        {/* Summary Cards */}
        <div className="summary-cards" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div className="summary-card" style={{
            padding: '20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)'
          }}>
            <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
              Total Industry Events
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {formatNumber(summary.total_events)}
            </div>
          </div>
          <div className="summary-card" style={{
            padding: '20px',
            backgroundColor: '#22c55e',
            color: 'white',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)'
          }}>
            <div className="summary-card-label" style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>
              Departments Involved
            </div>
            <div className="summary-card-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {formatNumber(summary.departments_involved)}
            </div>
          </div>
        </div>

        {/* Filter Panel with Radio Buttons for View Selection */}
        <div className="filter-panel" style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div className="filter-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: '0', color: '#333' }}>Filters & Visualization Options</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="clear-filters-btn"
                onClick={handleClearFilters}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Filters
              </button>
              {!isPublicView && user && user.role_id === 3 && (
                <button
                  className="upload-data-btn"
                  onClick={() => setIsUploadModalOpen(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Upload Industry Events
                </button>
              )}
            </div>
          </div>

          {/* View Type Selection - Radio Buttons */}
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#e9ecef',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#333',
              fontSize: '14px'
            }}>
              Select View Type:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'yearly' ? '#4f46e5' : 'white',
                color: viewType === 'yearly' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'yearly' ? '2px solid #4f46e5' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="yearly"
                  checked={viewType === 'yearly'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{
                    accentColor: '#4f46e5',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'yearly' ? 'bold' : 'normal' }}>
                  📊 Year-wise Distribution
                </span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'eventTypes' ? '#22c55e' : 'white',
                color: viewType === 'eventTypes' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'eventTypes' ? '2px solid #22c55e' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="eventTypes"
                  checked={viewType === 'eventTypes'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{
                    accentColor: '#22c55e',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'eventTypes' ? 'bold' : 'normal' }}>
                  🥧 Event Types Distribution
                </span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: viewType === 'eventsDirectory' ? '#f97316' : 'white',
                color: viewType === 'eventsDirectory' ? 'white' : '#333',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                border: viewType === 'eventsDirectory' ? '2px solid #f97316' : '2px solid #ced4da'
              }}>
                <input
                  type="radio"
                  name="viewType"
                  value="eventsDirectory"
                  checked={viewType === 'eventsDirectory'}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{
                    accentColor: '#f97316',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: viewType === 'eventsDirectory' ? 'bold' : 'normal' }}>
                  📋 Events Directory
                </span>
              </label>
            </div>

            <div className="filter-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div className="filter-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                  Event Type
                </label>
                <select
                  className="filter-select"
                  value={filters.event_type}
                  onChange={(e) => handleFilterChange('event_type', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                >
                  <option value="All">All Types</option>
                  {filterOptions.event_types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                  Department
                </label>
                <select
                  className="filter-select"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                >
                  <option value="All">All Departments</option>
                  {filterOptions.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                  Year
                </label>
                <select
                  className="filter-select"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                >
                  <option value="All">All Years</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                  Search Events
                </label>
                <input
                  type="text"
                  placeholder="Search by event title, industry partner, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="filter-select"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <strong>Active Filters:</strong>{' '}
              {filters.event_type !== 'All' && <span style={{ marginRight: '10px' }}>📌 Type: {filters.event_type}</span>}
              {filters.department !== 'All' && <span style={{ marginRight: '10px' }}>🏢 Dept: {filters.department}</span>}
              {filters.year !== 'All' && <span style={{ marginRight: '10px' }}>📅 Year: {filters.year}</span>}
              {filters.search && <span style={{ marginRight: '10px' }}>🔍 Search: "{filters.search}"</span>}
              {filters.event_type === 'All' && filters.department === 'All' && filters.year === 'All' && !filters.search &&
                <span>No filters applied (showing all events)</span>
              }
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
                              fill="#4f46e5"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="departments"
                              name="Departments"
                              fill="#22c55e"
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
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '15px'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '24px' }}>
                              {yearlyChartData.reduce((sum, item) => sum + item.events, 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Total Events</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                              {yearlyChartData.reduce((sum, item) => sum + item.departments, 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Total Department Involvements</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                              {yearlyChartData.length}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Years Covered</div>
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
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '15px'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '24px' }}>
                              {eventTypesPieData.length}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Event Types</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                              {eventTypesPieData.reduce((sum, item) => sum + item.value, 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Total Events</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                              {eventTypesPieData.length > 0
                                ? Math.max(...eventTypesPieData.map(item => item.value))
                                : 0}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Most Common Type Count</div>
                          </div>
                        </div>

                        {/* Event Type Details */}
                        <div style={{
                          marginTop: '15px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '10px'
                        }}>
                          {eventTypesPieData.map((type, index) => (
                            <div key={type.name} style={{
                              padding: '10px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '6px',
                              border: `1px solid ${EVENT_TYPE_COLORS[index % EVENT_TYPE_COLORS.length]}`,
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '12px', color: '#666' }}>{type.name}</div>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: EVENT_TYPE_COLORS[index % EVENT_TYPE_COLORS.length] }}>
                                {type.value} events
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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '15px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                          {eventsList.length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Showing</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '24px' }}>
                          {new Set(eventsList.map(e => e.event_type)).size}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Event Types</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '24px' }}>
                          {new Set(eventsList.map(e => e.department).filter(Boolean)).size}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Departments</div>
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
          />
        </div>


      </div>
    </div>
  );
}

export default IcsrSection;