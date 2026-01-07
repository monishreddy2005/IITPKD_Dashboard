import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

import {
  fetchFilterOptions,
  fetchSummary,
  fetchIndustryCourseTrend,
  fetchIndustryCourses,
  fetchProgramLaunchStats,
  fetchProgramList
} from '../services/academicModuleStats';

import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import DataUploadModal from './DataUploadModal';

const PROGRAM_COLORS = ['#6366f1', '#22d3ee', '#f97316', '#a855f7'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function EducationAcademicSection({ user }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    course_years: [],
    program_types: [],
    program_years: []
  });
  const [filters, setFilters] = useState({
    department: 'All',
    course_year: 'All',
    program_type: 'All',
    program_year: 'All'
  });

  const [summary, setSummary] = useState({
    total_courses: 0,
    distinct_departments: 0,
    total_programs: 0,
    distinct_program_types: 0,
    total_oelp_students: 0
  });
  const [courseTrend, setCourseTrend] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [programStats, setProgramStats] = useState([]);
  const [programList, setProgramList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      try {
        const options = await fetchFilterOptions(token);
        setFilterOptions({
          departments: Array.isArray(options?.departments) ? options.departments : [],
          course_years: Array.isArray(options?.course_years) ? options.course_years : [],
          program_types: Array.isArray(options?.program_types) ? options.program_types : [],
          program_years: Array.isArray(options?.program_years) ? options.program_years : []
        });
      } catch (err) {
        console.error('Failed to load academic module filter options:', err);
        setError(err.message || 'Failed to load filter options.');
      }
    };

    loadFilterOptions();
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const [summaryResp, trendResp, courseResp, programStatsResp, programListResp] = await Promise.all([
          fetchSummary(filters, token),
          fetchIndustryCourseTrend(filters, token),
          fetchIndustryCourses(filters, token),
          fetchProgramLaunchStats(filters, token),
          fetchProgramList(filters, token)
        ]);

        setSummary(summaryResp?.data || summary);
        setCourseTrend(trendResp?.data || []);
        setCourseList(courseResp?.data || []);
        setProgramStats(programStatsResp?.data || []);
        setProgramList(programListResp?.data || []);
      } catch (err) {
        console.error('Failed to load academic module data:', err);
        setError(err.message || 'Failed to load academic analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const courseTrendChartData = useMemo(() => {
    if (!courseTrend.length) return [];
    return courseTrend.map((row) => ({
      year: row.year,
      course_count: row.course_count || 0
    }));
  }, [courseTrend]);

  const programStatsChartData = useMemo(() => {
    if (!programStats.length) return [];
    return programStats.map((row) => {
      const entry = { year: row.year, total: row.total || 0 };
      filterOptions.program_types.forEach((type, idx) => {
        entry[type] = row[type] || 0;
      });
      return entry;
    });
  }, [programStats, filterOptions.program_types]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'All',
      course_year: 'All',
      program_type: 'All',
      program_year: 'All'
    });
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Academic Section · Industry Collaboration & Program Launches</h1>
        <p>
          Review how departments collaborate with industry to offer specialised courses and track the launch of new
          academic programmes across IIT Palakkad.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-panel">
          <div className="filter-header">
            <h2>Filters</h2>
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>

          {user && user.role_id === 3 && (
            <div className="upload-buttons-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                className="upload-data-btn"
                onClick={() => { setActiveUploadTable('industry_courses'); setIsUploadModalOpen(true); }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Upload Industry Courses
              </button>
              <button
                className="upload-data-btn"
                onClick={() => { setActiveUploadTable('academic_program_launch'); setIsUploadModalOpen(true); }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Upload Programs
              </button>
            </div>
          )}

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="department-filter">Department</label>
              <select
                id="department-filter"
                className="filter-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="course-year-filter">Course Year</label>
              <select
                id="course-year-filter"
                className="filter-select"
                value={filters.course_year}
                onChange={(e) => handleFilterChange('course_year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.course_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="program-type-filter">Program Type</label>
              <select
                id="program-type-filter"
                className="filter-select"
                value={filters.program_type}
                onChange={(e) => handleFilterChange('program_type', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.program_types.map((ptype) => (
                  <option key={ptype} value={ptype}>
                    {ptype}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="program-year-filter">Program Launch Year</label>
              <select
                id="program-year-filter"
                className="filter-select"
                value={filters.program_year}
                onChange={(e) => handleFilterChange('program_year', e.target.value)}
              >
                <option value="All">All</option>
                {filterOptions.program_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading academic insights...</p>
          </div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Industry-linked Courses</h3>
                <p className="summary-value">{formatNumber(summary.total_courses)}</p>
                <span className="summary-subtitle">Total courses available with industry collaboration</span>
              </div>
              <div className="summary-card">
                <h3>Departments Involved</h3>
                <p className="summary-value">{formatNumber(summary.distinct_departments)}</p>
                <span className="summary-subtitle">Departments offering industry courses</span>
              </div>
              <div className="summary-card">
                <h3>Programmes Launched</h3>
                <p className="summary-value">{formatNumber(summary.total_programs)}</p>
                <span className="summary-subtitle">New academic offerings introduced</span>
              </div>
              <div className="summary-card">
                <h3>Programme Types</h3>
                <p className="summary-value">{formatNumber(summary.distinct_program_types)}</p>
                <span className="summary-subtitle">Range of programme categories</span>
              </div>
              <div className="summary-card">
                <h3>OELP Students Benefitted</h3>
                <p className="summary-value">{formatNumber(summary.total_oelp_students)}</p>
                <span className="summary-subtitle">Opportunities for experiential learning programmes</span>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Industry-linked Courses · Yearly Trend</h2>
                  <p className="chart-description">
                    Track how many courses were offered with industry collaboration across academic years.
                  </p>
                </div>
              </div>

              {!courseTrendChartData.length ? (
                <div className="no-data">No industry course data available for the selected filters.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={courseTrendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                      <Line type="monotone" dataKey="course_count" name="Courses" stroke="#6366f1" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>New Academic Programmes Introduced</h2>
                  <p className="chart-description">
                    Visualise programme launches by year and type to understand growth in offerings.
                  </p>
                </div>
              </div>

              {!programStatsChartData.length ? (
                <div className="no-data">No programme launch data available for the selected filters.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={programStatsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }} />
                      <Legend />
                      {filterOptions.program_types.map((ptype, idx) => (
                        <Bar key={ptype} dataKey={ptype} name={ptype} stackId="a" fill={PROGRAM_COLORS[idx % PROGRAM_COLORS.length]} />
                      ))}
                      <Bar dataKey="total" name="Total" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Industry Collaboration Course Catalogue</h2>
                  <p className="chart-description">
                    Detailed view of active industry-partnered courses across departments and years.
                  </p>
                </div>
              </div>

              {!courseList.length ? (
                <div className="no-data">No industry courses found for the selected filters.</div>
              ) : (
                <div className="table-responsive">
                  <table className="grievance-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Course Title</th>
                        <th>Department</th>
                        <th>Industry Partner</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseList.map((course) => (
                        <tr key={course.course_id}>
                          <td>{course.year_offered}</td>
                          <td>{course.course_title}</td>
                          <td>{course.department}</td>
                          <td>{course.industry_partner || '—'}</td>
                          <td>{course.is_active ? 'Active' : 'Inactive'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grievance-table-wrapper">
              <div className="chart-header">
                <div>
                  <h2>Academic Programme Launches</h2>
                  <p className="chart-description">
                    Catalogue of newly introduced programmes with launch year, type, and OELP details.
                  </p>
                </div>
              </div>

              {!programList.length ? (
                <div className="no-data">No programme launch records found for the selected filters.</div>
              ) : (
                <div className="table-responsive">
                  <table className="grievance-table">
                    <thead>
                      <tr>
                        <th>Launch Year</th>
                        <th>Programme</th>
                        <th>Type</th>
                        <th>Department</th>
                        <th>OELP Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programList.map((program) => (
                        <tr key={program.program_code}>
                          <td>{program.launch_year}</td>
                          <td>{program.program_name}</td>
                          <td>{program.program_type}</td>
                          <td>{program.department || '—'}</td>
                          <td>{formatNumber(program.oelp_students)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName={activeUploadTable}
        token={token}
      />
    </div >
  );
}

export default EducationAcademicSection;
