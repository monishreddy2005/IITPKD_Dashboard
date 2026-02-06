import { Link } from 'react-router-dom';
import { useState } from 'react';

import './Page.css';
import './PeopleCampus.css';

// 🔹 ADDITION: import public view
import PeopleCampusPublicView from './PeopleCampusPublicView';

function PeopleCampus({ user }) {

  // 🔹 ADDITION: get role_id safely
  const roleId = user?.role_id;

  // 🔹 ADDITION: toggle public view for non-public users
  const [showPublicView, setShowPublicView] = useState(false);

  const sections = [
    {
      title: 'Academic Section',
      route: '/people-campus/academic-section',
      description: 'Academic programs and statistics',
      // 🔹 ADDITION
      allowedRoles: [3, 4]
    },
    {
      title: 'Administrative Section',
      route: '/people-campus/administrative-section',
      description: 'Administrative services and information',
      // 🔹 ADDITION
      allowedRoles: [3]
    },
    {
      title: 'IGRC',
      route: '/people-campus/igrc',
      description: 'Institute Grievance Redressal Committee',
      // 🔹 ADDITION
      allowedRoles: [3]
    },
    {
      title: 'ICC',
      route: '/people-campus/icc',
      description: 'Internal Complaints Committee',
      // 🔹 ADDITION
      allowedRoles: [3]
    },
    {
      title: 'EWD',
      route: '/people-campus/ewd',
      description: 'Engineering & Works Division sustainability metrics',
      // 🔹 ADDITION
      allowedRoles: [3]
    },
    {
      title: 'IAR',
      route: '/people-campus/iar',
      description: 'International & Alumni Relations insights',
      // 🔹 ADDITION
      allowedRoles: [3]
    }
  ];

  // 🔹 ADDITION: If public user → always show public view
  if (roleId === 1) {
    return <PeopleCampusPublicView user={user} />;
  }

  // 🔹 ADDITION: If non-public user explicitly chooses public view
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

          <PeopleCampusPublicView user={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>People and Campus</h1>
        <p>Explore different sections of IIT Palakkad's People and Campus.</p>

        {/* 🔹 ADDITION: Public view button for non-public users */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            className="upload-data-btn"
            onClick={() => setShowPublicView(true)}
          >
            View Public Page
          </button>
        </div>

        <div className="people-campus-grid">
          {sections.map((section, index) => {

            // 🔹 EXISTING role-based visibility logic
            const isSuperAdmin = roleId === 3;
            const isAllowed =
              isSuperAdmin ||
              (section.allowedRoles && section.allowedRoles.includes(roleId));

            if (!isAllowed) {
              return null;
            }

            return (
              <Link
                key={index}
                to={section.route}
                className="people-campus-card"
              >
                <div className="card-icon">
                  {section.title.charAt(0)}
                </div>
                <h3 className="card-title">{section.title}</h3>
                <p className="card-description">{section.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PeopleCampus;