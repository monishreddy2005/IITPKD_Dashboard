import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Page.css';
import './AcademicSection.css';
import DataUploadModal from './DataUploadModal';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function StudentsEngagementSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');
  const token = localStorage.getItem('authToken');

  // Mock data for other activities
  const [otherActivities, setOtherActivities] = useState([
    { id: 1, name: 'Pale Blue - Science Workshop', type: 'Outreach', date: '2024-01-15', participants: 120, status: 'Completed' },
    { id: 2, name: 'Pale Blue - Math Magic Show', type: 'Outreach', date: '2024-02-20', participants: 200, status: 'Completed' },
    { id: 3, name: 'Tech Fest 2024', type: 'Technical', date: '2024-02-01', participants: 500, status: 'Completed' },
    { id: 4, name: 'Cultural Night', type: 'Cultural', date: '2024-03-15', participants: 300, status: 'Upcoming' },
    { id: 5, name: 'Hackathon', type: 'Technical', date: '2024-04-20', participants: 120, status: 'Upcoming' },
    { id: 6, name: 'Sports Meet', type: 'Sports', date: '2024-01-10', participants: 400, status: 'Completed' },
    { id: 7, name: 'Pale Blue - Robotics Demo', type: 'Outreach', date: '2024-03-10', participants: 85, status: 'Completed' },
    { id: 8, name: 'Pale Blue - Environmental Awareness', type: 'Outreach', date: '2024-04-05', participants: 150, status: 'Upcoming' },
  ]);

  // Calculate summary stats for other activities
  const summary = {
    total_activities: otherActivities.length,
    total_participants: otherActivities.reduce((sum, act) => sum + act.participants, 0),
    outreach_events: otherActivities.filter(a => a.type === 'Outreach').length,
    upcoming_events: otherActivities.filter(a => a.status === 'Upcoming').length
  };

  const content = (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Students Engagement</h1>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Student-led outreach: Workshops, community projects, and activities
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
            onClick={() => { setActiveUploadTable('student_activities'); setIsUploadModalOpen(true); }}
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
            <span>📤</span> Upload Activities
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
        {/* NPTEL Section Card */}
        <Link 
          to="/outreach-extension/nptel" 
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
          }}
          >
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
                }}>📚</span>
                <div>
                  <h2 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    NPTEL
                  </h2>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '14px',
                    maxWidth: '280px'
                  }}>
                    National Programme on Technology Enhanced Learning
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
                Access NPTEL courses, certifications, local chapters, and student enrollment data. 
                Track student participation in online learning and certification programs.
              </p>

              
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
                    View NPTEL Dashboard
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

        {/* Other Activities Section Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(240, 147, 251, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
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
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <span style={{
                fontSize: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '16px',
                borderRadius: '20px'
              }}>🎯</span>
              <div>
                <h2 style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}>
                  Other Activities
                </h2>
                <p style={{
                  margin: '5px 0 0 0',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px'
                }}>
                  Pale Blue, Workshops, and Student Events
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '15px',
                backdropFilter: 'blur(5px)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                  {summary.total_activities}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Total Activities
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '15px',
                backdropFilter: 'blur(5px)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                  {summary.total_participants}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Total Participants
                </div>
              </div>
            </div>

            {/* Activities Table Preview */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '15px',
              backdropFilter: 'blur(5px)',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '16px' }}>
                Recent Activities
              </h3>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {otherActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ color: 'white', fontSize: '13px' }}>{activity.name}</span>
                    <span style={{
                      backgroundColor: activity.status === 'Completed' ? '#22c55e' : '#f97316',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: 'white'
                    }}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                    {summary.outreach_events}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Outreach Events
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                    {summary.upcoming_events}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Upcoming
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Activities Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
            📋 All Student Activities
          </h2>
          <span style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {otherActivities.length} Activities
          </span>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Activity Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Participants</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {otherActivities.map((activity) => (
                <tr key={activity.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{activity.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: 
                        activity.type === 'Technical' ? '#e0e7ff' :
                        activity.type === 'Cultural' ? '#fce7f3' :
                        activity.type === 'Sports' ? '#fff3e0' : '#e0f2fe',
                      color:
                        activity.type === 'Technical' ? '#4f46e5' :
                        activity.type === 'Cultural' ? '#ec4899' :
                        activity.type === 'Sports' ? '#f97316' : '#0284c7'
                    }}>
                      {activity.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {new Date(activity.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#22c55e' }}>
                    {activity.participants}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      backgroundColor: activity.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                      color: activity.status === 'Completed' ? '#166534' : '#92400e',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {activity.status}
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

export default StudentsEngagementSection;