import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Home.css';
import IIPKD_Logo from '../assets/IITPKD_Logo.png';

function Home({ user, onLogout }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const toggleDropdown = () => {
    setShowProfileDropdown(prev => !prev);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleUploadClick = () => {
    setShowProfileDropdown(false);
    navigate('/upload');
  };

  // Check if user has role_id 2 or 3 for upload access
  const canUploadData = user && (user.role_id === 2 || user.role_id === 3 || user.role_id === 4);

  return (
    <div className="home-container">
      {/* Header with Logo and User Profile */}
      <header className="main-header">
<div className="header-left">
  <Link to="/" className="logo-link">
    <div className="logo-container">
      <img
        src={IIPKD_Logo}
        alt="IIT Palakkad Logo"
        className="logo-image"
      />

      <div className="logo-text-group">
        <span className="logo-text">
          Indian Institute of Technology Palakkad
        </span>
        <span className="logo-tagline">
          Nurturing Minds For a Better World
        </span>
      </div>
    </div>
  </Link>
</div>        
        <div className="header-right">
          <div 
            ref={dropdownRef}
            className="user-profile-container"
          >
            <div 
              className="user-avatar"
              onClick={toggleDropdown}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDropdown();
                }
              }}
            >
              {user?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">
                      {user?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="dropdown-user-details">
                      <div className="dropdown-name">{user?.display_name || 'User'}</div>
                      <div className="dropdown-email">{user?.email || ''}</div>
                    </div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleProfileClick}>
                  Check Profile
                </button>
                {canUploadData && (
                  <>
                    <button className="dropdown-item" onClick={handleUploadClick}>
                      Upload Data
                    </button>
                    <div className="dropdown-divider"></div>
                  </>
                )}
                <button className="dropdown-item" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="main-navbar">
        <Link 
          to="/people-campus" 
          className={`nav-link ${location.pathname === '/people-campus' ? 'active' : ''}`}
        >
          People and Campus
        </Link>
        <Link 
          to="/research" 
          className={`nav-link ${location.pathname === '/research' ? 'active' : ''}`}
        >
          Research
        </Link>
        <Link 
          to="/education" 
          className={`nav-link ${location.pathname === '/education' ? 'active' : ''}`}
        >
          Education
        </Link>
        <Link 
          to="/industry-connect" 
          className={`nav-link ${location.pathname === '/industry-connect' ? 'active' : ''}`}
        >
          Industry Connect
        </Link>
        <Link 
          to="/innovation-entrepreneurship" 
          className={`nav-link ${location.pathname === '/innovation-entrepreneurship' ? 'active' : ''}`}
        >
          Innovation and Entrepreneurship
        </Link>
        <Link 
          to="/outreach-extension" 
          className={`nav-link ${location.pathname === '/outreach-extension' ? 'active' : ''}`}
        >
          Outreach and Extension
        </Link>
      </nav>

      {/* Main Content Area - Rendered by child routes */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Home;