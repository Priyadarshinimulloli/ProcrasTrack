import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import logo from '../assets/logo.jpeg'
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
            <img src={logo} alt="ProcrastiNot Logo" width="60" height="60" style={{ borderRadius: '8px' }} />
          </div>
          <span className="brand-title">ProcrasTrack</span>
        </div>
      </div>
    </header>
  )
}

// Hero Section with User/Admin Buttons
function Hero({ onOpenUser, onOpenAdmin }) {
  return (
    <section className="hero hero-centered">
      {/* Decorative blobs */}
      <div className="hero-blob hero-blob-1"></div>
      <div className="hero-blob hero-blob-2"></div>

      <div className="hero-inner">
        {/* Eyebrow label */}
        <span className="hero-eyebrow">✦ Productivity Tracker</span>

        {/* Giant headline */}
        <h1 className="hero-mega-title">
          Beat <em>Procrastination</em>.
          <br />Own Your Time.
        </h1>

        {/* One-liner */}
        <p className="hero-tagline">
          Log what delays you. See the patterns. Build momentum.
        </p>

        {/* Role entry buttons */}
        <div className="hero-actions">
          <button className="hero-btn hero-btn-primary" onClick={onOpenUser}>
            <span className="hero-btn-label">User Portal</span>
            <span className="hero-btn-sub">Start tracking for free</span>
          </button>
          <button className="hero-btn hero-btn-ghost" onClick={onOpenAdmin}>
            <span className="hero-btn-label">Admin Console</span>
            <span className="hero-btn-sub">Manage dashboard access</span>
          </button>
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
  
  // Custom Google auth function
  const handleGoogleLogin = async () => {
    try {
      // Lazy load firebase to avoid issues if config isn't set yet
      const { auth, googleProvider } = await import('../firebase');
      const { signInWithPopup } = await import('firebase/auth');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Send Firebase user data to our backend
      const res = await fetch('http://localhost:5000/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userEmail', data.email);
        if (data.occupation) localStorage.setItem('occupation', data.occupation);
        
        alert("Google Login Successful!");
        navigate('/userdashboard'); 
        onClose(); 
      } else {
        alert(data.message || 'Backend Google Login failed');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-api-key') {
        alert("Firebase API Key is missing. Please add it to src/firebase.js");
      } else {
        alert('Google Sign-In failed or was cancelled.');
      }
    }
  };

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
        if (res.ok) {
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', data.username);
          localStorage.setItem('userEmail', data.email);
          if (data.occupation) localStorage.setItem('occupation', data.occupation);
          alert(data.message);
          navigate('/userdashboard'); 
          onClose(); 
        } else alert(data.message || 'Login failed');
      } else {
        res = await fetch('http://localhost:5000/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, occupation }),
        });
        data = await res.json();
        if (res.ok) {
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', data.username);
          localStorage.setItem('userEmail', data.email);
          if (occupation) localStorage.setItem('occupation', occupation);
          alert(data.message);
          navigate('/userdashboard'); 
          onClose(); 
        } else alert(data.message || 'Signup failed');
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
        
        <div className="modal-oauth">
          <button type="button" className="btn btn-google btn-block" onClick={handleGoogleLogin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', marginBottom: '15px' }}>
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '15px 0', color: '#888' }}>
            <div style={{ flex: 1, borderBottom: '1px solid #eee' }}></div>
            <span style={{ padding: '0 10px', fontSize: '13px' }}>OR</span>
            <div style={{ flex: 1, borderBottom: '1px solid #eee' }}></div>
          </div>
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

// Features Section
function Features() {
  return (
    <section className="features-section">
      <div className="features-container">
        <h2 className="features-title">Why Choose ProcrasTrack?</h2>
        <p className="features-subtitle">Everything you need to beat procrastination and boost productivity</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-animation">
              <DotLottieReact
                src="/clock-animation.json"
                loop
                autoplay
                style={{ width: '100px', height: '100px' }}
              />
            </div>
            <h3>Smart Tracking</h3>
            <p>Log procrastination events and understand when and why you get distracted</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-animation">
              <DotLottieReact
                src="/web-design-animation.json"
                loop
                autoplay
                style={{ width: '100px', height: '100px' }}
              />
            </div>
            <h3>Visual Analytics</h3>
            <p>Beautiful charts and insights to visualize your productivity patterns</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-animation">
              <DotLottieReact
                src="/working-animation.json"
                loop
                autoplay
                style={{ width: '100px', height: '100px' }}
              />
            </div>
            <h3>Task Management</h3>
            <p>Organize tasks, set priorities, and track completion with ease</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <p>© {new Date().getFullYear()} ProcrasTrack — Designed to help you build lasting focus.</p>
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
      <div className="floating-decorations">
        <div className="floating-lottie floating-1">
          <DotLottieReact
            src="/clock-animation.json"
            loop
            autoplay
            style={{ width: '120px', height: '120px', opacity: 0.15 }}
          />
        </div>
        <div className="floating-lottie floating-2">
          <DotLottieReact
            src="/web-design-animation.json"
            loop
            autoplay
            style={{ width: '140px', height: '140px', opacity: 0.12 }}
          />
        </div>
        <div className="floating-lottie floating-3">
          <DotLottieReact
            src="/working-animation.json"
            loop
            autoplay
            style={{ width: '100px', height: '100px', opacity: 0.18 }}
          />
        </div>
      </div>
      
      <Nav />
      <main>
        <Hero 
          onOpenUser={() => setShowUserModal(true)}
          onOpenAdmin={() => setShowAdminModal(true)}
        />
        <Features />
      </main>
      <Footer />

      {showUserModal && <UserAuthModal onClose={() => setShowUserModal(false)} />}
      {showAdminModal && <AdminAuthModal onClose={() => setShowAdminModal(false)} />}
    </div>
  )
}
