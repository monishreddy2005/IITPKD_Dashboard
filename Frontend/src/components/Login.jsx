import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
// The Login component receives a prop `onLoginSuccess` from App.jsx
// which it will call with the token and user data after a successful login/signup.
function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  // This state toggles between Login and Sign Up forms
  const [isLoginView, setIsLoginView] = useState(true);

  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the form submission for both login and signup.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const url = isLoginView 
      ? 'http://127.0.0.1:5000/auth/login'
      : 'http://127.0.0.1:5000/auth/signup';
      
    const payload = isLoginView
      ? { email, password }
      : { email, password, username, display_name: displayName };

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
    <div className="card">
      <h1>{isLoginView ? 'Login' : 'Sign Up'}</h1>
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

        {/* Show these fields only for Sign Up */}
        {!isLoginView && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : (isLoginView ? 'Login' : 'Sign Up')}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <button 
        onClick={() => {
          setIsLoginView(!isLoginView);
          setError(''); // Clear errors when toggling
        }}
        style={{ marginTop: '1rem', backgroundColor: 'transparent', border: 'none', color: '#646cff', cursor: 'pointer' }}
      >
        {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Login'}
      </button>
    </div>
  );
}

export default Login;