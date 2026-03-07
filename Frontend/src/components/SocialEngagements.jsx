import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Page.css';
import './AcademicSection.css';
import DataUploadModal from './DataUploadModal';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function SocialEngagementsSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');
  const token = localStorage.getItem('authToken');

  // Mock data for other events/activities
  const [otherEvents, setOtherEvents] = useState([
    { id: 1, name: 'Community Workshop on Digital Literacy', type: 'Workshop', date: '2024-02-15', participants: 85, status: 'Completed' },
    { id: 2, name: 'Public Lecture: Sustainable Development', type: 'Lecture', date: '2024-03-10', participants: 120, status: 'Completed' },
    { id: 3, name: 'Village Adoption Program', type: 'Outreach', date: '2024-01-20', participants: 45, status: 'Completed' },
    { id: 4, name: 'Science Exhibition for School Students', type: 'Exhibition', date: '2024-04-05', participants: 200, status: 'Upcoming' },
    { id: 5, name: 'Health Awareness Camp', type: 'Camp', date: '2024-04-15', participants: 150, status: 'Upcoming' },
    { id: 6, name: 'Environmental Cleanliness Drive', type: 'Drive', date: '2024-03-25', participants: 75, status: 'Completed' },
  ]);

  // Mock data for quick stats
  const openHouseStats = {
    total_events: 12,
    total_visitors: 2450,
    departments: 8
  };

  const ubaStats = {
    total_projects: 15,
    total_events: 28,
    villages_adopted: 5
  };

  // Calculate summary stats for other events
  const summary = {
    total_events: otherEvents.length,
    total_participants: otherEvents.reduce((sum, event) => sum + event.participants, 0),
    completed_events: otherEvents.filter(e => e.status === 'Completed').length,
    upcoming_events: otherEvents.filter(e => e.status === 'Upcoming').length
  };

  const content = (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Social Engagements</h1>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Community outreach: Open House, UBA projects, workshops, and public lectures
        </p>
      </div>

      {!isPublicView && user && user.role_id === 3 && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            className="upload-data-btn"
            onClick={() => { setActiveUploadTable('social_engagements'); setIsUploadModalOpen(true); }}
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
            <span>📤</span> Upload Engagement Data
          </button>
        </div>
      )}

      {/* Two Main Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Open House Section Card */}
        <Link 
          to="/outreach-extension/open-house" 
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
          }}>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: '250px',
              height: '250px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%'
            }} />
            
            <div style={{ 
              position: 'relative', 
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              {/* Centered Header Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <span style={{
                  fontSize: '64px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '20px',
                  borderRadius: '24px',
                  marginBottom: '16px',
                  display: 'inline-block'
                }}>🏛️</span>
                <div>
                  <h2 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    Open House
                  </h2>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '14px',
                    maxWidth: '280px'
                  }}>
                    Annual showcase of research, innovation, and academic excellence
                  </p>
                </div>
              </div>

              {/* Description - Centered */}
              <p style={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '30px',
                textAlign: 'center',
                padding: '0 10px'
              }}>
                Explore Open House events, visitor statistics, departmental participation, 
                and key highlights from each edition of this prestigious annual event.
              </p>

              {/* Stats Section - Centered */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '30px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '20px 0',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{openHouseStats.total_events}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Events</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{formatNumber(openHouseStats.total_visitors)}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Visitors</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{openHouseStats.departments}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Depts</div>
                </div>
              </div>

              {/* Button Container - Centered */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 24px',
                  borderRadius: '40px',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                    View Open House Dashboard
                  </span>
                  <span style={{
                    fontSize: '20px',
                    color: 'white',
                    transition: 'transform 0.3s ease'
                  }}>→</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* UBA Section Card */}
        <Link 
          to="/outreach-extension/uba" 
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(240, 147, 251, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(240, 147, 251, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(240, 147, 251, 0.3)';
          }}>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: '250px',
              height: '250px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%'
            }} />
            
            <div style={{ 
              position: 'relative', 
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              {/* Centered Header Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <span style={{
                  fontSize: '64px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '20px',
                  borderRadius: '24px',
                  marginBottom: '16px',
                  display: 'inline-block'
                }}>🌾</span>
                <div>
                  <h2 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    UBA
                  </h2>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '14px',
                    maxWidth: '280px'
                  }}>
                    Unnat Bharat Abhiyan - Rural Development Initiatives
                  </p>
                </div>
              </div>

              {/* Description - Centered */}
              <p style={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '30px',
                textAlign: 'center',
                padding: '0 10px'
              }}>
                Track UBA projects, community engagement events, village adoption programs,
                and the impact of rural development initiatives.
              </p>

              {/* Stats Section - Centered */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '30px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '20px 0',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{ubaStats.total_projects}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Projects</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{ubaStats.total_events}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Events</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{ubaStats.villages_adopted}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Villages</div>
                </div>
              </div>

              {/* Button Container - Centered */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 24px',
                  borderRadius: '40px',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                    View UBA Dashboard
                  </span>
                  <span style={{
                    fontSize: '20px',
                    color: 'white',
                    transition: 'transform 0.3s ease'
                  }}>→</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Other Events Section */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
        marginTop: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '28px',
              background: '#f0f0f0',
              padding: '8px',
              borderRadius: '12px'
            }}>🎉</span>
            <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Other Community Events</h2>
          </div>
          <span style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {otherEvents.length} Events
          </span>
        </div>

        {/* Quick Stats for Other Events */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '15px',
            color: 'white'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.total_events}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Events</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            padding: '15px',
            color: 'white'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.total_participants}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Participants</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '12px',
            padding: '15px',
            color: 'white'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.completed_events}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Completed</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
            borderRadius: '12px',
            padding: '15px',
            color: 'white'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.upcoming_events}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Upcoming</div>
          </div>
        </div>

        {/* Events Table */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Event Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Participants</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {otherEvents.map((event) => (
                <tr key={event.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{event.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: 
                        event.type === 'Workshop' ? '#e0e7ff' :
                        event.type === 'Lecture' ? '#fce7f3' :
                        event.type === 'Exhibition' ? '#fff3e0' : '#e0f2fe',
                      color:
                        event.type === 'Workshop' ? '#4f46e5' :
                        event.type === 'Lecture' ? '#ec4899' :
                        event.type === 'Exhibition' ? '#f97316' : '#0284c7'
                    }}>
                      {event.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#22c55e' }}>
                    {event.participants}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      backgroundColor: event.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                      color: event.status === 'Completed' ? '#166534' : '#92400e',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

export default SocialEngagementsSection;