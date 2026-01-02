import { useState, useEffect } from 'react';
import {
  fetchConclaveSummary,
  fetchConclaveList
} from '../services/industryConnectStats';
import './Page.css';
import './AcademicSection.css';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function ConclaveSection() {
  const token = localStorage.getItem('authToken');
  
  const [summary, setSummary] = useState({
    total_conclaves: 0,
    total_companies: 0
  });

  const [conclaves, setConclaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchConclaveSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  // Load conclaves list
  useEffect(() => {
    const loadConclaves = async () => {
      if (!token) return;
      try {
        const result = await fetchConclaveList(token);
        setConclaves(result.data || []);
      } catch (err) {
        console.error('Error loading conclaves:', err);
      }
    };
    loadConclaves();
  }, [token]);

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Industry-Academia Conclave</h1>
        <p>
          Explore the annual Industry-Academia Conclave events, themes, participating companies,
          and key highlights from each edition.
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Summary Cards */}
        <div className="summary-cards" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div className="summary-card">
            <div className="summary-card-label">Total Conclaves</div>
            <div className="summary-card-value">{formatNumber(summary.total_conclaves)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Total Companies Participated</div>
            <div className="summary-card-value">{formatNumber(summary.total_companies)}</div>
          </div>
        </div>

        {/* Conclave Cards */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading conclave information...</p>
          </div>
        ) : conclaves.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {conclaves.map((conclave) => (
              <div
                key={conclave.conclave_id}
                style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{
                    margin: 0,
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>
                    {conclave.year}
                  </h2>
                  <div style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {formatNumber(conclave.number_of_companies)} Companies
                  </div>
                </div>

                <h3 style={{
                  margin: '0 0 1rem 0',
                  color: '#9aa5ff',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  {conclave.theme}
                </h3>

                {conclave.focus_area && (
                  <p style={{
                    margin: '0 0 1rem 0',
                    color: '#d1d5db',
                    fontSize: '0.95rem',
                    lineHeight: '1.6'
                  }}>
                    <strong style={{ color: '#9ca3af' }}>Focus Area:</strong> {conclave.focus_area}
                  </p>
                )}

                {conclave.description && (
                  <p style={{
                    margin: '0 0 1rem 0',
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    {conclave.description}
                  </p>
                )}

                {conclave.sessions_held && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Sessions:</strong>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      color: '#d1d5db',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}>
                      {conclave.sessions_held}
                    </p>
                  </div>
                )}

                {conclave.key_speakers && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Key Speakers:</strong>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      color: '#d1d5db',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}>
                      {conclave.key_speakers}
                    </p>
                  </div>
                )}

                {(conclave.brochure_url || conclave.event_photos_url) && (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #444'
                  }}>
                    {conclave.brochure_url && (
                      <a
                        href={conclave.brochure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#4f46e5',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}
                      >
                        📄 View Brochure
                      </a>
                    )}
                    {conclave.event_photos_url && (
                      <a
                        href={conclave.event_photos_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#4f46e5',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}
                      >
                        📷 View Photos
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No conclave data available.</div>
        )}
      </div>
    </div>
  );
}

export default ConclaveSection;

