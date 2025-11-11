import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import './Landing.css'

// Icon components
function IconUser() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L4 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-8-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Navigation Header
function Nav() {
  return (
    <header className="landing-nav">
      <div className="nav-container">
        <div className="brand">
          <div className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="36" height="36">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#0f62fe" />
              <path d="M7 13l3 3 7-9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <span className="brand-title">FocusTrack</span>
        </div>
      </div>
    </header>
  )
}

// Hero Section with User/Admin Buttons
function Hero({ onOpenUser, onOpenAdmin }) {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Track distractions. Build focus. Get things done.</h1>
          <p className="hero-subtitle">
            FocusTrack helps you understand your procrastination patterns, set achievable goals, 
            and celebrate progress—one focused session at a time.
          </p>
          <ul className="hero-features">
            <li><IconCheck /> <span>Visualize your habits</span></li>
            <li><IconCheck /> <span>Set focused goals</span></li>
            <li><IconCheck /> <span>Track accountability & insights</span></li>
          </ul>
        </div>
        <div className="hero-cta">
          <h2 className="cta-title">Choose your path</h2>
          <div className="cta-buttons">
            <button className="role-card" onClick={onOpenUser}>
              <div className="role-icon user-icon">
                <IconUser />
              </div>
              <h3>I'm a User</h3>
              <p>Track your habits and build focus</p>
            </button>
            <button className="role-card" onClick={onOpenAdmin}>
              <div className="role-icon admin-icon">
                <IconShield />
              </div>
              <h3>I'm an Admin</h3>
              <p>Manage the platform</p>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// User Auth Modal (Login & Signup)
function UserAuthModal({ onClose }) {
  const [mode, setMode] = useState('login') 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [occupation, setOccupation] = useState('')

  const navigate = useNavigate(); 
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let res, data;

    if (mode === 'login') {
      res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      data = await res.json();

      alert(data.message);

      if (res.ok) {
        navigate('/userdashboard'); 
        onClose(); 
      }

    } else {
      res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, occupation }),
      });
      data = await res.json();

      alert(data.message);

      if (res.ok) {
        navigate('/userdashboard'); 
        onClose(); 
      }
    }

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
  }
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="modal-header">
          <h2>{mode === 'login' ? 'User Login' : 'Create User Account'}</h2>
          <p>Welcome! Please {mode === 'login' ? 'sign in' : 'create your account'} to continue.</p>
        </div>

        <div className="modal-tabs">
          <button 
            className={`modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`modal-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="user-username">Username</label>
              <input
                id="user-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="user-email">Email</label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="user-password">Password</label>
            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
              required
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="user-occupation">Occupation</label>
              <input
                id="user-occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g., Student, Designer, Developer"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Admin Auth Modal (Login Only)
function AdminAuthModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

   const navigate = useNavigate(); 
  const handleSubmit = (e) => {
    e.preventDefault()
     const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    if (email === adminEmail && password === adminPassword) {
      alert('Admin login successful');
      onClose(); 
      navigate('/adminDashboard'); 
    } else {
      alert('Invalid admin credentials');
    }
  };
  

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="modal-header">
          <h2>Admin Login</h2>
          <p>Access the admin dashboard</p>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Admin Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

// Footer
function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <p>© {new Date().getFullYear()} FocusTrack — Designed to help you build lasting focus.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page Component
export default function Landing() {
  const [showUserModal, setShowUserModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)

  return (
    <div className="landing-page">
      <Nav />
      <main>
        <Hero 
          onOpenUser={() => setShowUserModal(true)}
          onOpenAdmin={() => setShowAdminModal(true)}
        />
      </main>
      <Footer />

      {showUserModal && <UserAuthModal onClose={() => setShowUserModal(false)} />}
      {showAdminModal && <AdminAuthModal onClose={() => setShowAdminModal(false)} />}
    </div>
  )
}
