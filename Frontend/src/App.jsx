import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import UploadForm from './components/UploadForm';

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

  return (
    <>
      {/* This is a simple header that shows who is logged in */}
      {user && (
         <p className="read-the-docs">
           Logged in as: {user.display_name || user.email}
         </p>
      )}
      
      {/* This is the core logic:
        - If there is NO token, show the <Login /> component.
        - If there IS a token, show the <UploadForm /> component.
      */}
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <UploadForm token={token} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;