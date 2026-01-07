import { useState } from 'react';
import { Link } from 'react-router-dom';
import OutreachPublicView from './OutreachPublicView';

import './Page.css';
import './PeopleCampus.css';

const OUTREACH_EXTENSION_SECTIONS = [
  {
    code: 'O',
    title: 'Open House',
    description: 'Faculty coordinator: Open House events, themes, and visitor statistics',
    route: '/outreach-extension/open-house'
  },
  {
    code: 'N',
    title: 'NPTEL – CCE',
    description: 'NPTEL local chapters, courses, enrollments, and certifications',
    route: '/outreach-extension/nptel'
  },
  {
    code: 'U',
    title: 'UBA',
    description: 'Unnat Bharat Abhiyan: Projects, events, and rural interventions',
    route: '/outreach-extension/uba'
  }
];

function OutreachExtension({ user }) { // Added user prop
  const [showPublicView, setShowPublicView] = useState(false);
  const roleId = user?.role_id;

  if (roleId === 1) {
    return <OutreachPublicView user={user} />;
  }

  if (showPublicView) {
    return (
      <div className="page-container">
        <div className="page-content">
          <button
            className="upload-data-btn"
            onClick={() => setShowPublicView(false)}
            style={{ marginBottom: '1rem' }}
          >
            ← Back to Outreach Modules
          </button>
          <OutreachPublicView user={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Outreach & Extension Examples</h1> {/* Modified h1 text */}
        <p>
          Discover how IIT Palakkad connects with the community and extends knowledge beyond the campus.
          Select a module to view detailed activities and impact metrics. {/* Modified p text */}
        </p>

        {roleId === 3 && (
          <div style={{ marginBottom: '2rem' }}>
            <button className="upload-data-btn" onClick={() => setShowPublicView(true)}>
              View Public Page
            </button>
          </div>
        )}

        <div className="people-campus-grid">
          {OUTREACH_EXTENSION_SECTIONS.map((section) => (
            <Link key={section.route} to={section.route} className="people-campus-card">
              <div className="card-icon">{section.code}</div>
              <div className="card-content">
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>);
}

export default OutreachExtension;
