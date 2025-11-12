import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './UserDashboard.css'

export default function UserDashboard() {
  // TODO: Get username from auth context or props
  const username = localStorage.getItem('username') || 'User'

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar username={username} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
