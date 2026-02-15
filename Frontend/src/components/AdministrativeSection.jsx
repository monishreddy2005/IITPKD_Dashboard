import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchFilterOptions, fetchEmployeeOverview } from '../services/administrativeStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb'];

const BAR_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 700,
  animationEasing: 'ease-out',
  animationBegin: 80
};

function AdministrativeSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    department: [],
    designation: [],
    gender: [],
    category: [],
    cadre: [],
    employee_type: [] // Faculty, Staff
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

  // Get token from localStorage
  const token = localStorage.getItem('authToken');

  // Fetch filter options on mount
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

  // Fetch employee overview data when filters change
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!token) {
        return;
      }

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
    <div className="academic-section">
      <div className="academic-content">
        {!isPublicView && (
          <div className="section-actions">
            <button onClick={() => setIsUploadModalOpen(true)} className="upload-button">
              Upload Employee Data
            </button>
          </div>
        )}

        {/* Employee Overview Section */}
        <div className="chart-view active">
          <div className="chart-header">
            <h2>Employee Overview</h2>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>
              Comprehensive breakdown of all employees by department and gender
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Filters</h3>
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear All Filters
              </button>
            </div>

            <div className="filter-grid">
              {/* Employee Type Filter */}
              <div className="filter-group">
                <label htmlFor="employee-type-filter">Employee Type</label>
                <select
                  id="employee-type-filter"
                  value={filters.employee_type || 'All'}
                  onChange={(e) => handleFilterChange('employee_type', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.employee_type?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="filter-group">
                <label htmlFor="department-filter">Department</label>
                <select
                  id="department-filter"
                  value={filters.department || 'All'}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.department?.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Designation Filter */}
              <div className="filter-group">
                <label htmlFor="designation-filter">Designation</label>
                <select
                  id="designation-filter"
                  value={filters.designation || 'All'}
                  onChange={(e) => handleFilterChange('designation', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.designation?.map(desig => (
                    <option key={desig} value={desig}>{desig}</option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="filter-group">
                <label htmlFor="gender-filter">Gender</label>
                <select
                  id="gender-filter"
                  value={filters.gender || 'All'}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.gender?.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label htmlFor="category-filter">Category</label>
                <select
                  id="category-filter"
                  value={filters.category || 'All'}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.category?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Cadre Filter */}
              <div className="filter-group">
                <label htmlFor="cadre-filter">Cadre</label>
                <select
                  id="cadre-filter"
                  value={filters.cadre || 'All'}
                  onChange={(e) => handleFilterChange('cadre', e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  {filterOptions.cadre?.map(cadre => (
                    <option key={cadre} value={cadre}>{cadre}</option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div className="filter-group">
                <label htmlFor="active-filter">Employment Status</label>
                <select
                  id="active-filter"
                  value={filters.isactive === true ? 'Active' : filters.isactive === false ? 'Inactive' : 'All'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('isactive', value === 'All' ? null : value === 'Active');
                  }}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employee Overview Chart */}
          <div className={`bar-chart-container trend-chart ${hasData ? '' : 'has-empty'}`}>
            <h3 className="chart-heading">Employee Distribution by Department</h3>

            <div className={`trend-empty-state ${hasData ? 'hidden' : ''}`}>
              <p>No information available for the selected filters</p>
            </div>

            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={120}
                />
                <YAxis />
                <Tooltip content={<StackedBarTooltip total={total} />} />
                <Legend />
                <Bar dataKey="Male" stackId="a" fill="#667eea" {...BAR_ANIMATION} />
                <Bar dataKey="Female" stackId="a" fill="#764ba2" {...BAR_ANIMATION} />
                <Bar dataKey="Transgender" stackId="a" fill="#43e97b" {...BAR_ANIMATION} />
                <Bar dataKey="Other" stackId="a" fill="#f093fb" {...BAR_ANIMATION} />
              </BarChart>
            </ResponsiveContainer>

            {hasData && (
              <div className="chart-info">
                <strong>Total Employees: {total}</strong>
              </div>
            )}
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
          <p style={{ color: '#667eea', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Male: {data.Male || 0}
          </p>
          <p style={{ color: '#764ba2', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Female: {data.Female || 0}
          </p>
          <p style={{ color: '#43e97b', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Transgender: {data.Transgender || 0}
          </p>
          <p style={{ color: '#f093fb', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Other: {data.Other || 0}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default AdministrativeSection;