import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchCompaniesDetails } from '../services/placementStats';
import './Page.css';
import './AcademicSection.css';

function PlacementCompaniesDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  
  // Get filters from location state or URL params
  const [filters, setFilters] = useState({
    year: location.state?.year || new URLSearchParams(location.search).get('year') || 'All',
    sector: location.state?.sector || new URLSearchParams(location.search).get('sector') || 'All',
    is_top_recruiter: location.state?.is_top_recruiter || new URLSearchParams(location.search).get('is_top_recruiter') || null,
  });
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    const loadCompanies = async () => {
      if (!token) {
        setError('Authentication required');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchCompaniesDetails(
          filters,
          pagination.page,
          pagination.per_page,
          token
        );
        setCompanies(result.data || []);
        setPagination(result.pagination || pagination);
      } catch (err) {
        console.error('Error loading companies:', err);
        setError(err.message || 'Failed to load company details');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [filters, pagination.page, token]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

  return (
    <div className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1>Placement Companies Details</h1>
            <p>Detailed list of companies that recruited from IIT Palakkad</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="filter-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Year</label>
              <select
                className="filter-select"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              >
                <option value="All">All Years</option>
                {/* Add year options dynamically if needed */}
              </select>
            </div>
            <div className="filter-group">
              <label>Sector</label>
              <select
                className="filter-select"
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
              >
                <option value="All">All Sectors</option>
                {/* Add sector options dynamically if needed */}
              </select>
            </div>
            <div className="filter-group">
              <label>Top Recruiters Only</label>
              <select
                className="filter-select"
                value={filters.is_top_recruiter || 'All'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  is_top_recruiter: e.target.value === 'All' ? null : e.target.value 
                }))}
              >
                <option value="All">All Companies</option>
                <option value="true">Top Recruiters Only</option>
                <option value="false">Non-Top Recruiters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading companies...</p>
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="grievance-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Year</th>
                    <th>Sector</th>
                    <th>Offers</th>
                    <th>Hires</th>
                    <th>Top Recruiter</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, index) => (
                    <tr key={company.company_id || index}>
                      <td>{company.company_name}</td>
                      <td>{company.year}</td>
                      <td>{company.sector || 'N/A'}</td>
                      <td>{formatNumber(company.offers)}</td>
                      <td>{formatNumber(company.hires)}</td>
                      <td>{company.is_top_recruiter ? '✓ Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: pagination.page === 1 ? '#ccc' : '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.total_pages} 
                  ({formatNumber(pagination.total)} total companies)
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: pagination.page >= pagination.total_pages ? '#ccc' : '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: pagination.page >= pagination.total_pages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-data">
            <p>No companies found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlacementCompaniesDetail;

