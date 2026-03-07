import { useState, useEffect } from 'react';
import {
  fetchUbaSummary,
  fetchUbaProjects,
  fetchUbaProjectEvents
} from '../services/outreachExtensionStats';
import './Page.css';
import './AcademicSection.css';
import DataUploadModal from './DataUploadModal';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

function UbaSection({ user, isPublicView = false }) {
  const token = localStorage.getItem('authToken');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadTable, setActiveUploadTable] = useState('');

  const [summary, setSummary] = useState({
    total_projects: 0,
    total_events: 0
  });

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectEvents, setProjectEvents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchUbaSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [token]);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      if (!token) return;
      try {
        const result = await fetchUbaProjects(token);
        setProjects(result.projects || []);
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    };
    loadProjects();
  }, [token]);

  // Load events for selected project
  useEffect(() => {
    const loadEvents = async () => {
      if (!token || !selectedProject) return;
      try {
        const result = await fetchUbaProjectEvents(token, selectedProject);
        setProjectEvents(result.events || []);
      } catch (err) {
        console.error('Error loading project events:', err);
      }
    };
    loadEvents();
  }, [token, selectedProject]);

  const handleProjectClick = (projectId) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  if (loading && projects.length === 0) {
    return isPublicView ? (
      <p>Loading...</p>
    ) : (
      <div className="page-container">
        <div className="page-content">
          <h1>UBA (Unnat Bharat Abhiyan)</h1>
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
          <h1>UBA (Unnat Bharat Abhiyan)</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const content = (
    <>
      {!isPublicView && <h1>UBA (Unnat Bharat Abhiyan)</h1>}

      {isPublicView ? null : (user && user.role_id === 3 && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            className="upload-data-btn"
            onClick={() => { setActiveUploadTable('uba_projects'); setIsUploadModalOpen(true); }}
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
            <span>📤</span> Upload Projects
          </button>
          <button
            className="upload-data-btn"
            onClick={() => { setActiveUploadTable('uba_events'); setIsUploadModalOpen(true); }}
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
            <span>📅</span> Upload Events
          </button>
        </div>
      ))}

      {/* Impact Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Total Projects Card */}
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
          {/* Decorative elements */}
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
              }}>📊</span>
              <h3 style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: '500'
              }}>Total Projects</h3>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {formatNumber(summary.total_projects)}
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
                Active UBA initiatives
              </span>
            </div>
          </div>
        </div>

        {/* Total Events Card */}
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
          {/* Decorative elements */}
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
              }}>📅</span>
              <h3 style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: '500'
              }}>Total Events</h3>
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
                Community engagement activities
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="chart-section" style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>UBA Projects</h2>
          <span style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {projects.length} Projects
          </span>
        </div>

        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            color: '#666'
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
            <p style={{ fontSize: '16px' }}>No projects found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {projects.map((project) => (
              <div
                key={project.project_id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  border: '1px solid #e9ecef',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: selectedProject === project.project_id 
                    ? '0 10px 30px rgba(102, 126, 234, 0.2)' 
                    : '0 2px 10px rgba(0,0,0,0.05)',
                  transform: selectedProject === project.project_id ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Project Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '20px',
                  color: 'white'
                }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    lineHeight: '1.4'
                  }}>{project.project_title}</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {project.project_status}
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      background: '#f0f0f0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#667eea'
                    }}>👤</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Coordinator</div>
                      <div style={{ fontWeight: '500', color: '#333' }}>{project.coordinator_name}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    {project.start_date && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Start Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          {new Date(project.start_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {project.end_date && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999' }}>End Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          {new Date(project.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      color: '#667eea'
                    }}>📊</span>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                        {project.event_count || 0}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Total Events</div>
                    </div>
                  </div>

                  {project.intervention_description && (
                    <div style={{
                      marginBottom: '16px',
                      padding: '12px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.5'
                    }}>
                      {project.intervention_description}
                    </div>
                  )}

                  {project.collaboration_partners && (
                    <div style={{
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      <span>🤝</span>
                      <span><strong>Partners:</strong> {project.collaboration_partners}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleProjectClick(project.project_id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '8px',
                      background: selectedProject === project.project_id ? '#dc3545' : '#667eea',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{selectedProject === project.project_id ? '👆' : '👁️'}</span>
                    {selectedProject === project.project_id ? 'Hide Events' : 'View Events'}
                  </button>
                </div>

                {/* Events for this project */}
                {selectedProject === project.project_id && (
                  <div style={{
                    borderTop: '1px solid #e9ecef',
                    padding: '20px',
                    background: '#f8f9fa'
                  }}>
                    <h4 style={{
                      margin: '0 0 16px 0',
                      color: '#333',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>📅</span> Events
                    </h4>
                    
                    {projectEvents.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        background: 'white',
                        borderRadius: '8px',
                        color: '#999'
                      }}>
                        No events found for this project
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gap: '12px'
                      }}>
                        {projectEvents.map((event) => (
                          <div
                            key={event.event_id}
                            style={{
                              background: 'white',
                              borderRadius: '12px',
                              padding: '16px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                          >
                            <h5 style={{
                              margin: '0 0 12px 0',
                              color: '#333',
                              fontSize: '15px',
                              fontWeight: '600'
                            }}>{event.event_title}</h5>
                            
                            <div style={{
                              display: 'grid',
                              gap: '8px',
                              marginBottom: '12px'
                            }}>
                              {event.event_type && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '13px'
                                }}>
                                  <span style={{ color: '#667eea' }}>📌</span>
                                  <span><strong>Type:</strong> {event.event_type}</span>
                                </div>
                              )}
                              
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px'
                              }}>
                                <span style={{ color: '#667eea' }}>📅</span>
                                <span><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</span>
                              </div>
                              
                              {event.location && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '13px'
                                }}>
                                  <span style={{ color: '#667eea' }}>📍</span>
                                  <span><strong>Location:</strong> {event.location}</span>
                                </div>
                              )}
                            </div>

                            {event.description && (
                              <p style={{
                                fontSize: '13px',
                                color: '#666',
                                lineHeight: '1.5',
                                margin: '0 0 12px 0',
                                padding: '8px',
                                background: '#f8f9fa',
                                borderRadius: '6px'
                              }}>
                                {event.description}
                              </p>
                            )}

                            <div style={{
                              display: 'flex',
                              gap: '12px',
                              marginTop: '8px'
                            }}>
                              {event.photos_url && (
                                <a
                                  href={event.photos_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#667eea',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  📸 Photos
                                </a>
                              )}
                              {event.brochure_url && (
                                <a
                                  href={event.brochure_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#667eea',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  📄 Brochure
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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

export default UbaSection;