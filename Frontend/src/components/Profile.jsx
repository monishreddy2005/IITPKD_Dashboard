import './Page.css';

function Profile({ user }) {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>User Profile</h1>
        {user ? (
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
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
        <p className="coming-soon">Full profile page implementation coming soon...</p>
      </div>
    </div>
  );
}

export default Profile;
