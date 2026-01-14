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
    route: '/outreach-extension/open-house',
    allowedRoles: [3] // Super admin and another role
  },
  {
    code: 'N',
    title: 'NPTEL – CCE',
    description: 'NPTEL local chapters, courses, enrollments, and certifications',
    route: '/outreach-extension/nptel',
    allowedRoles: [3] // Only super admin
  },
  {
    code: 'U',
    title: 'UBA',
    description: 'Unnat Bharat Abhiyan: Projects, events, and rural interventions',
    route: '/outreach-extension/uba',
    allowedRoles: [3] // Only super admin
  }
];

function OutreachExtension({ user }) {
  const [showPublicView, setShowPublicView] = useState(false);
  const roleId = user?.role_id;

  // If public user → always show public view
  if (roleId === 1) {
    return <OutreachPublicView user={user} />;
  }

  // If non-public user explicitly chooses public view
  if (showPublicView) {
    return (
      <div className="page-container">
        <div className="page-content">
          <button
            className="upload-data-btn"
            onClick={() => setShowPublicView(false)}
            style={{ marginBottom: '1rem' }}
          >
            ← Back to Admin View
          </button>
          <OutreachPublicView user={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Outreach & Extension Examples</h1>
        <p>
          Discover how IIT Palakkad connects with the community and extends knowledge beyond the campus.
          Select a module to view detailed activities and impact metrics.
        </p>

        {/* Public view button for non-public users */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            className="upload-data-btn"
            onClick={() => setShowPublicView(true)}
          >
            View Public Page
          </button>
        </div>

        <div className="people-campus-grid">
          {OUTREACH_EXTENSION_SECTIONS.map((section) => {
            // Role-based visibility logic
            const isSuperAdmin = roleId === 3;
            const isAllowed =
              isSuperAdmin ||
              (section.allowedRoles && section.allowedRoles.includes(roleId));

            if (!isAllowed) {
              return null;
            }

            return (
              <Link key={section.route} to={section.route} className="people-campus-card">
                <div className="card-icon">{section.code}</div>
                <h3 className="card-title">{section.title}</h3>
                <p className="card-description">{section.description}</p>
                <div className="card-arrow">→</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OutreachExtension;