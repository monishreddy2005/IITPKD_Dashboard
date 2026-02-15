import { useState } from 'react';
import './Page.css';
import './PeopleCampus.css';
import './PeopleCampusMinimal.css';

import AcademicSection from './AcademicSection';
import AdministrativeSection from './AdministrativeSection';
import IgrcSection from './IgrcSection';
import IccSection from './IccSection';
import EwdSection from './EwdSection';
import IarSection from './IarSection';

function PeopleCampusPublicView({ user }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'academic',
      title: 'Student Overview',
      subtitle: '',
      expandedTitle: 'Explore our bright minds to the better future.',
      icon: '📚',
      component: AcademicSection
    },
    {
      id: 'administrative',
      title: 'Employee Overview',
      subtitle: '',
      expandedTitle: 'Meet the administrative team managing our institution',
      icon: '🏛️',
      component: AdministrativeSection
    },
    {
      id: 'igrc',
      title: 'IGRC',
      subtitle: 'Internal Grievance Resolution Cell',
      expandedTitle: 'Dedicated to resolving internal grievances and ensuring fair resolution',
      icon: '⚖️',
      component: IgrcSection
    },
    {
      id: 'icc',
      title: 'ICC',
      subtitle: 'Internal Complaints Committee',
      expandedTitle: 'Committed to maintaining a safe and respectful campus environment',
      icon: '🛡️',
      component: IccSection
    },
    {
      id: 'ewd',
      title: 'EWD',
      subtitle: 'Engineering & Works Division',
      expandedTitle: 'Managing campus infrastructure, maintenance, and development projects',
      icon: '🏗️',
      component: EwdSection
    },
    {
      id: 'iar',
      title: 'IAR',
      subtitle: 'International & Alumni Relations',
      expandedTitle: 'Fostering global partnerships and maintaining strong alumni connections',
      icon: '🌍',
      component: IarSection
    }
  ];

  const handleCardClick = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const handleBackClick = () => {
    setActiveSection(null);
  };

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Card Grid View */}
        <div className={`minimal-sections-grid ${activeSection ? 'grid-hidden' : ''}`}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="minimal-section-card"
              onClick={() => handleCardClick(section.id)}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="card-icon-minimal">{section.icon}</div>
              <h3 className="card-title-minimal">{section.title}</h3>
              <p className="card-subtitle-minimal">{section.subtitle}</p>
              <div className="card-arrow">→</div>
            </div>
          ))}
        </div>

        {/* Expanded Section View */}
        {activeSection && (
          <div className="expanded-section-view">
            {sections.map((section) => {
              if (section.id === activeSection) {
                const SectionComponent = section.component;
                return (
                  <div key={section.id} className="section-wrapper">
                    {/* White Card Container */}
                    <div className="expanded-card-container">
                      {/* Single Row: Back Button + Icon + Expanded Title */}
                      <div className="expanded-card-top-bar">
                        <button className="back-button-inline" onClick={handleBackClick}>
                          <span className="back-arrow">←</span>
                          <span>Back</span>
                        </button>
                        
                        <div className="section-icon-header">{section.icon}</div>
                        <p className="section-overview-text">{section.expandedTitle}</p>
                      </div>
                      
                      {/* Section Content (includes h2 "Student Overview" heading) */}
                      <div className="expanded-card-content">
                        <SectionComponent user={user} isPublicView={true} />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PeopleCampusPublicView;