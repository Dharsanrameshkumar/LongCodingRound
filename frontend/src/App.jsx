import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import './App.css';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

export default function App() {
  const [user, setUser] = useState(getUser);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'STUDENT') navigate('/student');
    else navigate('/organizer');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <span className="brand">Event Pass Management</span>
        <div className="nav-links">
          {!user && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
          {user?.role === 'STUDENT' && (
            <>
              <NavLink to="/student" end>Events</NavLink>
              <NavLink to="/student/my-booking">My Booking</NavLink>
              <button className="nav-btn nav-logout" onClick={handleLogout}>Logout</button>
            </>
          )}
          {user?.role === 'ORGANIZER' && (
            <>
              <NavLink to="/organizer" end>Create Event</NavLink>
              <NavLink to="/organizer/my-events">My Events</NavLink>
              <NavLink to="/organizer/summary">Event Summary</NavLink>
              <button className="nav-btn nav-logout" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/*" element={
          user?.role === 'STUDENT'
            ? <StudentDashboard user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />
        } />
        <Route path="/organizer/*" element={
          user?.role === 'ORGANIZER'
            ? <OrganizerDashboard user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to={user ? (user.role === 'STUDENT' ? '/student' : '/organizer') : '/login'} />} />
      </Routes>
    </div>
  );
}
