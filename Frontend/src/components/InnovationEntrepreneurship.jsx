import './Page.css';
import './PeopleCampus.css';

function InnovationEntrepreneurship({ user, isPublicView }) {
  // If rendered in public view (expanded card), don't show the page-container wrapper
  if (isPublicView) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🚀</div>
          <h2 style={{ 
            fontSize: '1.75rem', 
            color: '#333', 
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Innovation Hub - Research & Development
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666', 
            maxWidth: '600px', 
            margin: '0 auto 2rem',
            lineHeight: '1.6'
          }}>
            Driving innovation through cutting-edge research and development initiatives.
            Explore groundbreaking projects and collaborations.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
            maxWidth: '800px',
            margin: '2rem auto 0'
          }}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔬</div>
              <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>Research Projects</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Cutting-edge research initiatives</p>
            </div>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>Collaborations</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Industry partnerships</p>
            </div>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</div>
              <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>Innovation</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Breakthrough technologies</p>
            </div>
          </div>
          <p style={{ 
            marginTop: '3rem',
            fontSize: '0.95rem',
            color: '#999',
            fontStyle: 'italic'
          }}>
            Content will be available soon...
          </p>
        </div>
      </div>
    );
  }

  // Default standalone page view
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Innovation and Entrepreneurship</h1>
        <p>This page will contain information about innovation and entrepreneurship initiatives at IIT Palakkad.</p>
        <p className="coming-soon">Content coming soon...</p>
      </div>
    </div>
  );
}

export default InnovationEntrepreneurship;