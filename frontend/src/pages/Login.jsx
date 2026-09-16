import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-title">Event Pass Management</div>
        <div className="auth-sub">Login to continue</div>

        {error && <div className="msg msg-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <div className="role-toggle">
              <button type="button"
                className={`role-btn ${form.role === 'STUDENT' ? 'active-student' : ''}`}
                onClick={() => set('role', 'STUDENT')}>
                Student
              </button>
              <button type="button"
                className={`role-btn ${form.role === 'ORGANIZER' ? 'active-organizer' : ''}`}
                onClick={() => set('role', 'ORGANIZER')}>
                Organizer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="••••••••" required />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}
            style={{ marginTop: 8 }}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
