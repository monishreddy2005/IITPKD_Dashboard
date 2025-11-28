import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import HomePage from './components/HomePage';
import PeopleCampus from './components/PeopleCampus';
import Research from './components/Research';
import Education from './components/Education';
import IndustryConnect from './components/IndustryConnect';
import InnovationEntrepreneurship from './components/InnovationEntrepreneurship';
import OutreachExtension from './components/OutreachExtension';
import Profile from './components/Profile';
import UploadForm from './components/UploadForm';
import AcademicSection from './components/AcademicSection';
import AdministrativeSection from './components/AdministrativeSection';
import IgrcSection from './components/IgrcSection';
import IccSection from './components/IccSection';
import EwdSection from './components/EwdSection';
import IarSection from './components/IarSection';
import PlacementSection from './components/PlacementSection';
import EducationAcademicSection from './components/EducationAcademicSection';
import ResearchIcsrSection from './components/ResearchIcsrSection';
import ResearchAdministrativeSection from './components/ResearchAdministrativeSection';
import ResearchLibrarySection from './components/ResearchLibrarySection';

function App() {
  // State to hold the authentication token
  const [token, setToken] = useState(null);
  
  // State to hold user info (optional, but good for UI)
  const [user, setUser] = useState(null);

  // This `useEffect` hook runs once when the app loads
  // It checks if a token is already saved in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  /**
   * Callback function passed to the Login component.
   * Saves the token and user to state and localStorage.
   */
  const handleLoginSuccess = (receivedToken, receivedUser) => {
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('authToken', receivedToken);
    localStorage.setItem('authUser', JSON.stringify(receivedUser));
  };

  /**
   * Clears the token and user from state and localStorage.
   */
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Route - Login */}
        <Route 
          path="/login" 
          element={
            token ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />
        
        {/* Protected Routes - Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="people-campus" element={<PeopleCampus />} />
          <Route path="people-campus/academic-section" element={<AcademicSection />} />
          <Route path="people-campus/administrative-section" element={<AdministrativeSection />} />
          <Route path="people-campus/igrc" element={<IgrcSection />} />
          <Route path="people-campus/icc" element={<IccSection />} />
          <Route path="people-campus/ewd" element={<EwdSection />} />
          <Route path="people-campus/iar" element={<IarSection />} />
          <Route path="research" element={<Research />} />
          <Route path="research/icsr" element={<ResearchIcsrSection />} />
          <Route path="research/administrative-section" element={<ResearchAdministrativeSection />} />
          <Route path="research/library" element={<ResearchLibrarySection />} />
          <Route path="education" element={<Education />} />
          <Route path="education/placements" element={<PlacementSection />} />
          <Route path="education/administrative-section" element={<AdministrativeSection />} />
          <Route path="education/academic-section" element={<EducationAcademicSection />} />
          <Route path="industry-connect" element={<IndustryConnect />} />
          <Route path="innovation-entrepreneurship" element={<InnovationEntrepreneurship />} />
          <Route path="outreach-extension" element={<OutreachExtension />} />
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="upload" element={<UploadForm token={token} onLogout={handleLogout} />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;