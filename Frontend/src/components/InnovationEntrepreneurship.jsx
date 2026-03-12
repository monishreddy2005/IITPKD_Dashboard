import { Link } from 'react-router-dom';
import './Page.css';
import './PeopleCampus.css';

function InnovationEntrepreneurship({ user, isPublicView }) {
  const roleId = user?.role_id;

  const sections = [
    {
      title: 'IPTIF',
      route: '/innovation-entrepreneurship/iptif',
      description: 'Innovation'
    },
    {
      title: 'TechIn',
      route: '/innovation-entrepreneurship/techin',
      description: 'Entrepreneurship'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Innovation & Entrepreneurship</h1>
        <p>Explore innovation initiatives and startup incubation programs at IIT Palakkad.</p>

        <div className="people-campus-grid" style={{ marginTop: '2rem' }}>
          {sections.map((section, index) => {
            return (
              <Link
                key={index}
                to={section.route}
                className="people-campus-card"
              >
                <div className="card-icon">
                  {section.title === 'IPTIF' ? '💡' : '🚀'}
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

export default InnovationEntrepreneurship;