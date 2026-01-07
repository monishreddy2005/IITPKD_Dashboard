import { Link } from 'react-router-dom';

import './Page.css';
import './PeopleCampus.css';

const INDUSTRY_CONNECT_SECTIONS = [
  {
    code: 'I',
    title: 'ICSR Section',
    description: 'Industry interaction events, workshops, and engagement activities',
    route: '/industry-connect/icsr'
  },
  {
    code: 'C',
    title: 'Industry-Academia Conclave',
    description: 'Year-wise conclave information, themes, and participating companies',
    route: '/industry-connect/conclave'
  }
];

function IndustryConnect() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Industry Connect</h1>
        <p>
          Explore IIT Palakkad&apos;s industry engagement initiatives. Select a section to view detailed analytics,
          events, and partnership information.
        </p>

        <div className="people-campus-grid">
          {INDUSTRY_CONNECT_SECTIONS.map((section) => (
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

export default IndustryConnect;
