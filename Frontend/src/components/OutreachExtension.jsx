import { Link } from 'react-router-dom';

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

function OutreachExtension() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Outreach and Extension</h1>
        <p>
          Explore IIT Palakkad&apos;s outreach initiatives, community engagement programs, and extension activities.
          Select a section to view detailed analytics and information.
        </p>

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
    </div>
  );
}

export default OutreachExtension;
