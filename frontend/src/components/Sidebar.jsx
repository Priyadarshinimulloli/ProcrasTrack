import { NavLink } from 'react-router-dom'
import './Sidebar.css'
import logo from '../assets/logo.jpeg'

function IconTasks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLog() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconInsights() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9l-5 5-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src={logo} alt="ProcrastiNot Logo" width="40" height="40" style={{ borderRadius: '8px' }} />
          <span className="logo-text">ProcrasTrack</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/userdashboard" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <IconHome />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/userdashboard/tasks" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <IconTasks />
          <span>Tasks</span>
        </NavLink>

        <NavLink to="/userdashboard/procrastination-log" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <IconLog />
          <span>Procrastination Log</span>
        </NavLink>

        <NavLink to="/userdashboard/insights" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <IconInsights />
          <span>Insights</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">Track. Focus. Succeed.</p>
      </div>
    </aside>
  )
}
