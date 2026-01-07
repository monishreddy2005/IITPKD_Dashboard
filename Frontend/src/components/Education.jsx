import { Link } from 'react-router-dom';

import './Page.css';
import './PeopleCampus.css';

const EDUCATION_SECTIONS = [
  {
    code: 'A',
    title: 'Administrative Section',
    description: 'Administrative services and information',
    route: '/education/administrative-section',
    // 🔹 ADDITION
    allowedRoles: [3]
  },
  {
    code: 'P',
    title: 'Placement Office',
    description: 'Career outcomes, recruiters, and placement analytics',
    route: '/education/placements',
    // 🔹 ADDITION
    allowedRoles: [3]
  },
  {
    code: 'A',
    title: 'Academic Section',
    description: 'Academic programs, statistics, and student metrics',
    route: '/education/academic-section',
    // 🔹 ADDITION
    allowedRoles: [3, 4]
  }
];

function Education({ user }) {

  // 🔹 ADDITION: safely get role_id
  const roleId = user?.role_id;

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Education Modules</h1>
        <p>
          Explore key sections of IIT Palakkad&apos;s education ecosystem. Choose a module to dive into detailed dashboards,
          analytics, and operational insights.
        </p>

        <div className="people-campus-grid">
          {EDUCATION_SECTIONS.map((section) => {

            // 🔹 ADDITION: role-based visibility logic
            const isPublicUser = roleId === 1;
            const isSuperAdmin = roleId === 3;
            const isAllowed =
              isSuperAdmin ||
              (section.allowedRoles && section.allowedRoles.includes(roleId));

            // 🔒 Public users should not see section tabs
            if (isPublicUser) {
              return null;
            }

            // 🔒 Restricted roles
            if (!isAllowed) {
              return null;
            }

            return (
              <Link
                key={section.route}
                to={section.route}
                className="people-campus-card"
              >
                <div className="card-icon">{section.code}</div>
                <div className="card-content">
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Education;