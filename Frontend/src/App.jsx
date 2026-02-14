import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ScrollToTop from './components/ScrollToTop';
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
import CreateUser from './components/CreateUser';
import AcademicSection from './components/AcademicSection';
import AdministrativeSection from './components/AdministrativeSection';
import IgrcSection from './components/IgrcSection';
import IccSection from './components/IccSection';
import EwdSection from './components/EwdSection';
import IarSection from './components/IarSection';
import PlacementSection from './components/PlacementSection';
import EducationAcademicSection from './components/EducationAcademicSection';
import EducationAdministrativeSection from './components/EducationAdministrativeSection';
import ResearchIcsrSection from './components/ResearchIcsrSection';
import ResearchAdministrativeSection from './components/ResearchAdministrativeSection';
import ResearchLibrarySection from './components/ResearchLibrarySection';
import InnovationSection from './components/InnovationSection';
import IcsrSection from './components/IcsrSection';
import ConclaveSection from './components/ConclaveSection';
import OpenHouseSection from './components/OpenHouseSection';
import NptelSection from './components/NptelSection';
import UbaSection from './components/UbaSection';

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
      <ScrollToTop />
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
          <Route index element={<HomePage user={user} />} />
          <Route path="people-campus" element={<PeopleCampus user={user} />} />
          <Route path="people-campus/academic-section" element={<AcademicSection user={user} />} />
          <Route path="people-campus/administrative-section" element={<AdministrativeSection user={user} />} />
          <Route path="people-campus/igrc" element={<IgrcSection user={user} />} />
          <Route path="people-campus/icc" element={<IccSection user={user} />} />
          <Route path="people-campus/ewd" element={<EwdSection user={user} />} />
          <Route path="people-campus/iar" element={<IarSection user={user} />} />
          <Route path="research" element={<Research user={user} />} />
          <Route path="research/icsr" element={<ResearchIcsrSection user={user} />} />
          <Route path="research/administrative-section" element={<ResearchAdministrativeSection user={user} />} />
          <Route path="research/library" element={<ResearchLibrarySection user={user} />} />
          <Route path="education" element={<Education user={user} />} />
          <Route path="education/placements" element={<PlacementSection user={user} />} />
          <Route path="education/administrative-section" element={<EducationAdministrativeSection user={user} />} />
          <Route path="education/academic-section" element={<EducationAcademicSection user={user} />} />
          <Route path="industry-connect" element={<IndustryConnect user={user} />} />
          <Route path="innovation-entrepreneurship" element={<InnovationSection user={user} />} />
          <Route path="industry-connect/icsr" element={<IcsrSection user={user} />} />
          <Route path="industry-connect/conclave" element={<ConclaveSection user={user} />} />
          <Route path="outreach-extension" element={<OutreachExtension user={user} />} />
          <Route path="outreach-extension/open-house" element={<OpenHouseSection user={user} />} />
          <Route path="outreach-extension/nptel" element={<NptelSection user={user} />} />
          <Route path="outreach-extension/uba" element={<UbaSection user={user} />} />
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="upload" element={<UploadForm token={token} onLogout={handleLogout} />} />
          <Route path="create-user" element={<CreateUser user={user} token={token} />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;