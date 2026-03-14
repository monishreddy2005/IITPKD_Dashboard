import { useState } from 'react';
import './Page.css';
import './OutreachMinimal.css';

import SocialEngagementsSection from './SocialEngagements';
import StudentsEngagementSection from './StudentsEngagement';
import UbaSection from './UbaSection';

function OutreachPublicView({ user }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'social-engagements',
      title: 'Social Engagements',
      subtitle: 'Community outreach: Open House, workshops, and public lectures',
      expandedTitle: 'Engaging with the community through workshops and public lectures',
      icon: 'S',
      component: SocialEngagementsSection
    },
    {
      id: 'students-engagement',
      title: 'Students Engagement',
      subtitle: 'Student-led outreach: Workshops and community projects',
      expandedTitle: 'Empowering learners through student-led community projects',
      icon: 'S',
      component: StudentsEngagementSection
    },
    {
      id: 'research-engagements',
      title: 'Research Engagements',
      subtitle: 'Research impact: Publications, patents, and industry collaborations',
      expandedTitle: 'Driving innovation through publications, patents, and industry collaborations',
      icon: 'R',
      component: UbaSection
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
        {/* Page Header - visible only in card grid view */}
        {!activeSection && (
          <div className="outreach-page-header">
          </div>
        )}

        {/* Card Grid View */}
        {!activeSection && (
          <div className="outreach-sections-grid">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="outreach-section-card"
                onClick={() => handleCardClick(section.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="outreach-card-icon">{section.icon}</div>
                <h3 className="outreach-card-title">{section.title}</h3>
                <p className="outreach-card-subtitle">{section.subtitle}</p>
                <div className="outreach-card-arrow">→</div>
              </div>
            ))}
          </div>
        )}

        {/* Expanded Section View */}
        {activeSection && (
          <div className="outreach-expanded-view">
            {sections.map((section) => {
              if (section.id === activeSection) {
                const SectionComponent = section.component;
                return (
                  <div key={section.id} className="outreach-section-wrapper">
                    {/* White Card Container */}
                    <div className="outreach-expanded-container">
                      {/* Top Bar: Back Button + Icon + Title */}
                      <div className="outreach-top-bar">
                        <button className="outreach-back-button" onClick={handleBackClick}>
                          <span className="outreach-back-arrow">←</span>
                          <span>Back</span>
                        </button>
                        
                        <div className="outreach-icon-header">{section.icon}</div>
                        <p className="outreach-overview-text">{section.expandedTitle}</p>
                      </div>
                      
                      {/* Section Content */}
                      <div className="outreach-content-area">
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

export default OutreachPublicView;