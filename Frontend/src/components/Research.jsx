import { useState } from 'react';
import { Link } from 'react-router-dom';
import ResearchPublicView from './ResearchPublicView';

import './Page.css';
import './PeopleCampus.css';

const RESEARCH_SECTIONS = [
  {
    code: 'I',
    title: 'ICSR Section',
    description: 'Industrial consultancy & sponsored research metrics',
    route: '/research/icsr'
  },
  {
    code: 'A',
    title: 'Administrative Section',
    description: 'Faculty industry externships and collaborations',
    route: '/research/administrative-section'
  },
  {
    code: 'L',
    title: 'Library',
    description: 'Research publications and scholarly outputs',
    route: '/research/library'
  }
];

function Research({ user }) {
  const [showPublicView, setShowPublicView] = useState(false);
  const roleId = user?.role_id;

  if (roleId === 1) {
    return <ResearchPublicView user={user} />;
  }

  if (showPublicView) {
    return (
      <div className="page-container">
        <div className="page-content">
          <button
            className="upload-data-btn"
            onClick={() => setShowPublicView(false)}
            style={{ marginBottom: '1rem' }}
          >
            ← Back to Research Modules
          </button>
          <ResearchPublicView user={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Research Modules</h1>
        <p>
          Discover IIT Palakkad&apos;s research ecosystem. Select a module to explore project portfolios, collaborations, and
          scholarly achievements.
        </p>

        {roleId === 3 && (
          <div style={{ marginBottom: '2rem' }}>
            <button className="upload-data-btn" onClick={() => setShowPublicView(true)}>
              View Public Page
            </button>
          </div>
        )}

        <div className="people-campus-grid">
          {RESEARCH_SECTIONS.map((section) => (
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

export default Research;
