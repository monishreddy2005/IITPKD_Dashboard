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
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user');
    }
  };

  return (
    <div className="card">
      <h1>Create User</h1>

      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="display_name" placeholder="Display Name" onChange={handleChange} />
        <input name="password" type="password" placeholder="Temporary Password" onChange={handleChange} required />

        <select name="role_id" onChange={handleChange} required>
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>

        <button type="submit">Create User</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  );
}

export default CreateUser;