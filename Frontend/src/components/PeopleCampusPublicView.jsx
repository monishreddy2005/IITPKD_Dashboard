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
      expandedTitle: 'Meet the minds shaping tomorrow.',
      icon: '👩‍🎓',
      component: AcademicSection
    },
    {
      id: 'administrative',
      title: 'Employee Overview',
      subtitle: '',
      expandedTitle: 'Dedicated Professionals. One Shared Mission.',
      icon: '🏛️',
      component: AdministrativeSection
    },
    {
      id: 'grievances',
      title: 'Grievances',
      subtitle: '',
      expandedTitle: 'Ensuring fairness, safety, and respect for all members of our community',
      icon: '⚖️',
      isGrievances: true // Special flag to handle dual components
    },
    {
      id: 'ewd',
      title: 'Campus',
      subtitle: '',
      expandedTitle: 'Sustaining Today. Developing for Tomorrow.',
      icon: '🏗️',
      component: EwdSection
    },
    {
      id: 'iar',
      title: 'Our Global Community',
      subtitle: '',
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
                      
                      {/* Section Content */}
                      <div className="expanded-card-content">
                        {section.isGrievances ? (
                          // Special handling for Grievances - render both IGRC and ICC
                          <div className="grievances-combined-section">
                            {/* IGRC Section */}
                            <div className="grievance-subsection">
                              <div className="subsection-content">
                                <IgrcSection user={user} isPublicView={true} />
                              </div>
                            </div>

                            {/* ICC Section */}
                            <div className="grievance-subsection">
                              <div className="subsection-content">
                                <IccSection user={user} isPublicView={true} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Normal single component rendering
                          (() => {
                            const SectionComponent = section.component;
                            return <SectionComponent user={user} isPublicView={true} />;
                          })()
                        )}
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