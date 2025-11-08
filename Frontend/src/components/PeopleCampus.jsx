import { Link } from 'react-router-dom';
import './Page.css';
import './PeopleCampus.css';

function PeopleCampus() {
  const sections = [
    {
      title: 'Academic Section',
      route: '/people-campus/academic-section',
      description: 'Academic programs and statistics'
    },
    {
      title: 'Administrative Section',
      route: '/people-campus/administrative-section',
      description: 'Administrative services and information'
    },
    {
      title: 'IGRC',
      route: '/people-campus/igrc',
      description: 'Institute Grievance Redressal Committee'
    },
    {
      title: 'ICC',
      route: '/people-campus/icc',
      description: 'Internal Complaints Committee'
    },
    {
      title: 'EWD',
      route: '/people-campus/ewd',
      description: 'Engineering & Works Division sustainability metrics'
    },
    {
      title: 'IAR',
      route: '/people-campus/iar',
      description: 'Internal Audit & Risk Management'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>People and Campus</h1>
        <p>Explore different sections of IIT Palakkad's People and Campus.</p>
        
        <div className="people-campus-grid">
          {sections.map((section, index) => (
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
              <div className="card-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PeopleCampus;
