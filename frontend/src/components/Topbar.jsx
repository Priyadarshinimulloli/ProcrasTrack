import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Topbar.css'

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconId() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 10h4M14 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function Topbar({ username = 'User' }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const navigate = useNavigate()

  // Get user data from localStorage
  const displayName = username !== 'User' ? username : (localStorage.getItem('username') || 'User')
  const userId = localStorage.getItem('userId')
  const userEmail = localStorage.getItem('userEmail')
  const occupation = localStorage.getItem('occupation')

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('occupation')
    localStorage.removeItem('authToken')
    navigate('/')
  }

  const handleProfileClick = () => {
    setShowDropdown(false)
    setShowProfileModal(true)
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            <h1 className="page-title">Welcome back, {displayName}!</h1>
          </div>

          <div className="topbar-right">
            <div className="user-menu">
              <button 
                className="user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  <IconUser />
                </div>
                <span className="user-name">{displayName}</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={handleProfileClick}>
                    <IconUser />
                    Profile
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <IconLogout />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>My Profile</h3>
              <button className="icon-btn" onClick={() => setShowProfileModal(false)}>
                <IconClose />
              </button>
            </div>

            <div className="profile-content">
              <div className="profile-avatar-large">
                <IconUser />
              </div>

              <div className="profile-info">
                <div className="profile-info-item">
                  <div className="profile-icon">
                    <IconId />
                  </div>
                  <div className="profile-details">
                    <span className="profile-label">User ID</span>
                    <span className="profile-value">{userId || 'Not available'}</span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-icon">
                    <IconUser />
                  </div>
                  <div className="profile-details">
                    <span className="profile-label">Username</span>
                    <span className="profile-value">{displayName}</span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-icon">
                    <IconMail />
                  </div>
                  <div className="profile-details">
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{userEmail || 'Not available'}</span>
                  </div>
                </div>

                {occupation && (
                  <div className="profile-info-item">
                    <div className="profile-icon">
                      <IconBriefcase />
                    </div>
                    <div className="profile-details">
                      <span className="profile-label">Occupation</span>
                      <span className="profile-value">{occupation}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                <button className="btn btn-outline" onClick={() => setShowProfileModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
