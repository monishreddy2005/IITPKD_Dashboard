import { useState, useEffect } from 'react';
import {
  fetchNptelSummary,
  fetchNptelEnrollmentsOverTime,
  fetchNptelCourseCategories,
  fetchNptelCertificationRatio
} from '../services/outreachExtensionStats';
import './Page.css';
import './AcademicSection.css';
import DataUploadModal from './DataUploadModal';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function NptelSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');
  const token = localStorage.getItem('authToken');

  const [summary, setSummary] = useState({
    total_courses: 0,
    total_enrollments: 0,
    certifications_completed: 0,
    local_chapters: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load summary data only
  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchNptelSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  if (loading) {
    return isPublicView ? (
      <p>Loading...</p>
    ) : (
      <div className="page-container">
        <div className="page-content">
          <h1>NPTEL – CCE</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return isPublicView ? (
      <p className="error-message">{error}</p>
    ) : (
      <div className="page-container">
        <div className="page-content">
          <h1>NPTEL – CCE</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        {!isPublicView && <h1 style={{ margin: 0 }}>NPTEL – CCE (Centre for Continuing Education)</h1>}

        {!isPublicView && user && user.role_id === 3 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="upload-data-btn"
              onClick={() => { setActiveUploadTable('nptel_local_chapters'); setIsUploadModalOpen(true); }}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(40, 167, 69, 0.3)'
              }}
            >
              <span>📚</span> Upload Local Chapters
            </button>
            <button
              className="upload-data-btn"
              onClick={() => { setActiveUploadTable('nptel_courses'); setIsUploadModalOpen(true); }}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(40, 167, 69, 0.3)'
              }}
            >
              <span>📖</span> Upload Courses
            </button>
            <button
              className="upload-data-btn"
              onClick={() => { setActiveUploadTable('nptel_enrollments'); setIsUploadModalOpen(true); }}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(40, 167, 69, 0.3)'
              }}
            >
              <span>📊</span> Upload Enrollments
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards - Modern Design */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Total Courses Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)'
          }
        }}>
          {/* Decorative circles */}
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
              }}>📚</span>
              <h3 style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: '500'
              }}>Total Courses Offered</h3>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {formatNumber(summary.total_courses)}
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
                Active NPTEL courses
              </span>
            </div>
          </div>
        </div>

        {/* Total Enrollments Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 15px 35px rgba(240, 147, 251, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px rgba(240, 147, 251, 0.4)'
          }
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
              }}>👥</span>
              <h3 style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: '500'
              }}>Total Enrollments</h3>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {formatNumber(summary.total_enrollments)}
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
                Student registrations
              </span>
            </div>
          </div>
        </div>

        {/* Certifications Completed Card */}
        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 15px 35px rgba(67, 233, 123, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px rgba(67, 233, 123, 0.4)'
          }
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
              }}>🎓</span>
              <h3 style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: '500'
              }}>Certifications Completed</h3>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {formatNumber(summary.certifications_completed)}
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
                Successful completions
              </span>
            </div>
          </div>
        </div>

        {/* Local Chapters Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 15px 35px rgba(249, 115, 22, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px rgba(249, 115, 22, 0.4)'
          }
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
              }}>🏛️</span>
              <h3 style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: '500'
              }}>Local Chapters</h3>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {formatNumber(summary.local_chapters)}
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
                Active student chapters
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Section - Optional
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>Quick Stats</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Average Courses per Chapter</span>
            <span style={{ fontWeight: 'bold', color: '#667eea' }}>
              {summary.local_chapters > 0 
                ? (summary.total_courses / summary.local_chapters).toFixed(1) 
                : '0'}
            </span>
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>Certification Rate</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Certifications vs Enrollments</span>
            <span style={{ fontWeight: 'bold', color: '#22c55e' }}>
              {summary.total_enrollments > 0 
                ? `${((summary.certifications_completed / summary.total_enrollments) * 100).toFixed(1)}%` 
                : '0%'}
            </span>
          </div>
        </div> 
      </div> */}

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName={activeUploadTable}
        token={token}
      />
    </>
  );

  // If public view, return content without wrappers
  if (isPublicView) {
    return content;
  }

  // If not public view, wrap in page-container and page-content
  return (
    <div className="page-container">
      <div className="page-content">
        {content}
      </div>
    </div>
  );
}

export default NptelSection;