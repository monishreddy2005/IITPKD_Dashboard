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

function UbaSection({ user }) {
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
    return (
      <div className="page-container">
        <div className="page-content">
          <h1>UBA (Unnat Bharat Abhiyan)</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1>UBA (Unnat Bharat Abhiyan)</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>UBA (Unnat Bharat Abhiyan) – Faculty Coordinator</h1>



        {user && user.role_id === 3 && (
          <div className="upload-buttons-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              className="upload-data-btn"
              onClick={() => { setActiveUploadTable('uba_projects'); setIsUploadModalOpen(true); }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Upload Projects
            </button>
            <button
              className="upload-data-btn"
              onClick={() => { setActiveUploadTable('uba_events'); setIsUploadModalOpen(true); }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Upload Events
            </button>
          </div>
        )}

        {/* Impact Summary */}
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Projects</h3>
            <p className="summary-value">{formatNumber(summary.total_projects)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Events</h3>
            <p className="summary-value">{formatNumber(summary.total_events)}</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="chart-section">
          <h2>UBA Projects</h2>
          <div className="projects-grid">
            {projects.length === 0 ? (
              <p>No projects found</p>
            ) : (
              projects.map((project) => (
                <div key={project.project_id} className="project-card">
                  <h3>{project.project_title}</h3>
                  <p><strong>Coordinator:</strong> {project.coordinator_name}</p>
                  <p><strong>Status:</strong> {project.project_status}</p>
                  {project.start_date && (
                    <p><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}</p>
                  )}
                  {project.end_date && (
                    <p><strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString()}</p>
                  )}
                  <p><strong>Events:</strong> {project.event_count || 0}</p>
                  {project.intervention_description && (
                    <p><strong>Description:</strong> {project.intervention_description}</p>
                  )}
                  {project.collaboration_partners && (
                    <p><strong>Partners:</strong> {project.collaboration_partners}</p>
                  )}
                  <button
                    onClick={() => handleProjectClick(project.project_id)}
                    className="view-events-btn"
                  >
                    {selectedProject === project.project_id ? 'Hide Events' : 'View Events'}
                  </button>

                  {/* Events for this project */}
                  {selectedProject === project.project_id && projectEvents.length > 0 && (
                    <div className="project-events">
                      <h4>Events</h4>
                      {projectEvents.map((event) => (
                        <div key={event.event_id} className="event-item">
                          <h5>{event.event_title}</h5>
                          <p><strong>Type:</strong> {event.event_type || '-'}</p>
                          <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                          {event.location && <p><strong>Location:</strong> {event.location}</p>}
                          {event.description && <p>{event.description}</p>}
                          {event.photos_url && (
                            <p>
                              <a href={event.photos_url} target="_blank" rel="noopener noreferrer">
                                View Photos
                              </a>
                            </p>
                          )}
                          {event.brochure_url && (
                            <p>
                              <a href={event.brochure_url} target="_blank" rel="noopener noreferrer">
                                View Brochure
                              </a>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName={activeUploadTable}
        token={token}
      />
    </div>
  );
}

export default UbaSection;

