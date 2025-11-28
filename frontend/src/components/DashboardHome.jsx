import { useState, useEffect } from 'react'
import './DashboardHome.css'

function IconTasks() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconTrend() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9l-5 5-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    procrastinationLogs: 0,
    focusTime: 0
  })
  const [loading, setLoading] = useState(true)

  // Get userId from localStorage
  const userId = localStorage.getItem('userId') || 1

  useEffect(() => {
    fetchDashboardStats()
  }, [userId])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch tasks to calculate stats
      const tasksResponse = await fetch(`http://localhost:5000/api/tasks?user_id=${userId}`)
      
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json()
        
        const totalTasks = tasks.length
        // Check both status and user_status columns
        const completedTasks = tasks.filter(t => 
          t.user_status === 'completed' || t.status === 'completed'
        ).length
        
        // Calculate focus time (sum of completed task durations)
        // Check both column name variations
        const focusTime = tasks
          .filter(t => {
            const actualStart = t.actual_start || t.actual_start_time
            const actualEnd = t.actual_end || t.actual_end_time
            return actualStart && actualEnd
          })
          .reduce((total, task) => {
            const actualStart = task.actual_start || task.actual_start_time
            const actualEnd = task.actual_end || task.actual_end_time
            const start = new Date(actualStart)
            const end = new Date(actualEnd)
            const duration = (end - start) / (1000 * 60) // minutes
            return total + duration
          }, 0)

        // Fetch procrastination logs count
        const logsResponse = await fetch(`http://localhost:5000/api/procrastination-logs?user_id=${userId}`)
        let procrastinationLogsCount = 0
        
        if (logsResponse.ok) {
          const logs = await logsResponse.json()
          procrastinationLogsCount = logs.length
        }

        setStats({
          totalTasks,
          completedTasks,
          procrastinationLogs: procrastinationLogsCount,
          focusTime: Math.round(focusTime)
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="welcome-section">
          <h2>Dashboard Overview</h2>
          <p>Loading your statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h2>Dashboard Overview</h2>
        <p>Track your progress and stay focused on your goals</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon tasks-icon">
            <IconTasks />
          </div>
          <div className="stat-content">
            <h3>{stats.totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed-icon">
            <IconTasks />
          </div>
          <div className="stat-content">
            <h3>{stats.completedTasks}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon logs-icon">
            <IconClock />
          </div>
          <div className="stat-content">
            <h3>{stats.procrastinationLogs}</h3>
            <p>Procrastination Logs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon focus-icon">
            <IconTrend />
          </div>
          <div className="stat-content">
            <h3>{stats.focusTime} min</h3>
            <p>Focus Time</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <a href="/userdashboard/tasks" className="action-card">
            <IconTasks />
            <span>View Tasks</span>
          </a>
          <a href="/userdashboard/procrastination-log" className="action-card">
            <IconClock />
            <span>Log Procrastination</span>
          </a>
          <a href="/userdashboard/insights" className="action-card">
            <IconTrend />
            <span>View Insights</span>
          </a>
        </div>
      </div>
    </div>
  )
}
