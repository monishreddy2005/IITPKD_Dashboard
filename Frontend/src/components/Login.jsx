import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import IIPKD_Logo from '../assets/IITPKD_Logo.png';

// The Login component receives a prop `onLoginSuccess` from App.jsx
// which it will call with the token and user data after a successful login.
function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the form submission for login.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const url = 'http://127.0.0.1:5000/auth/login';
    const payload = { email, password };

    try {
      const response = await axios.post(url, payload);
      
      // On success, call the function passed from App.jsx
      // This will set the token in the parent component and update the UI
      onLoginSuccess(response.data.token, response.data.user);
      
      // Navigate to home page after successful login
      navigate('/');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unknown error occurred. Is the backend server running?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Page heading */}
      <h1 className="login-page-title">
        Indian Institute of Technology Palakkad
      </h1>

      <div className="card">
        {/* Logo */}
        <div className="login-logo">
          <img src={IIPKD_Logo} alt="IIT Palakkad Logo" />
        </div>

        <h2>Sign in to Dashboard</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </button>

          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;