import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateUser({ user, token }) {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    email: '',
    username: '',
    display_name: '',
    password: '',
    role_id: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role_id !== 3) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/auth/roles', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setRoles(res.data))
    .catch(() => setError('Failed to load roles'));
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(
        'http://127.0.0.1:5000/auth/create-user',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('User created successfully');
      // Reset form
      setForm({
        email: '',
        username: '',
        display_name: '',
        password: '',
        role_id: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user');
    }
  };

  return (
    <div className="card" style={{
      maxWidth: '480px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        color: '#1f2937',
        textAlign: 'center'
      }}>Create User</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Email</label>
          <input 
            name="email" 
            type="email"
            placeholder="user@example.com" 
            value={form.email}
            onChange={handleChange} 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Username</label>
          <input 
            name="username" 
            placeholder="username" 
            value={form.username}
            onChange={handleChange} 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Display Name</label>
          <input 
            name="display_name" 
            placeholder="John Doe" 
            value={form.display_name}
            onChange={handleChange} 
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Temporary Password</label>
          <input 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            value={form.password}
            onChange={handleChange} 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Role</label>
          <select 
            name="role_id" 
            value={form.role_id}
            onChange={handleChange} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23374151' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '16px',
              paddingRight: '2.5rem',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '0.875rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: '0.5rem',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#d97706';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f59e0b';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.25)';
          }}
        >
          Create User
        </button>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#16a34a',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            {success}
          </div>
        )}
      </form>
    </div>
  );
}

export default CreateUser;