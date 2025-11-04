import { useNavigate } from 'react-router-dom';
import './Page.css';
import './Profile.css';

function Profile({ user }) {
  const navigate = useNavigate();
  
  // Check if user has role_id 2 or 3
  const canUploadData = user && (user.role_id === 2 || user.role_id === 3);
  
  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>User Profile</h1>
        {user ? (
          <>
            <div className="profile-info">
              <div className="profile-field">
                <label>Email:</label>
                <span>{user.email || 'N/A'}</span>
              </div>
              <div className="profile-field">
                <label>Display Name:</label>
                <span>{user.display_name || 'N/A'}</span>
              </div>
              <div className="profile-field">
                <label>Username:</label>
                <span>{user.username || 'N/A'}</span>
              </div>
              <div className="profile-field">
                <label>Status:</label>
                <span>{user.status || 'N/A'}</span>
              </div>
              {user.role_id && (
                <div className="profile-field">
                  <label>Role ID:</label>
                  <span>{user.role_id}</span>
                </div>
              )}
            </div>
            
            {/* Upload Data Option - Only visible to role_id 2 or 3 */}
            {canUploadData && (
              <div className="profile-actions">
                <button 
                  className="upload-data-btn"
                  onClick={handleUploadClick}
                >
                  Upload Data
                </button>
              </div>
            )}
          </>
        ) : (
          <p>Loading user information...</p>
        )}
        {!canUploadData && <p className="coming-soon">Full profile page implementation coming soon...</p>}
      </div>
    </div>
  );
}

export default Profile;
