import { Link } from 'react-router-dom';
import './Page.css';
import './AcademicSection.css';

function StudentsEngagementSection({ isPublicView = false }) {
  const content = (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Students Engagement</h1>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Student participation in NPTEL courses, certifications, and learning programmes
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
        <Link to="/outreach-extension/nptel" style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(102,126,234,0.3)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(102,126,234,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(102,126,234,0.3)';
            }}
          >
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '64px', background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '24px', marginBottom: '16px', display: 'inline-block' }}>📚</span>
                <h2 style={{ margin: 0, color: 'white', fontSize: '32px', fontWeight: 'bold', letterSpacing: '1px' }}>NPTEL – CCE</h2>
                <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                  National Programme on Technology Enhanced Learning
                </p>
              </div>

              {/* Description */}
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', textAlign: 'center', padding: '0 10px' }}>
                Access NPTEL courses, certifications, local chapters, and student enrollment data.
                Track student participation in online learning and certification programmes.
              </p>

              {/* CTA */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
                <div
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '40px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>View NPTEL Dashboard</span>
                  <span style={{ fontSize: '20px', color: 'white' }}>→</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );

  if (isPublicView) return content;

  return (
    <div className="page-container">
      <div className="page-content">{content}</div>
    </div>
  );
}

export default StudentsEngagementSection;
