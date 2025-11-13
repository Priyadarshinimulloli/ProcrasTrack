import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import './Analytics.css'

function IconTrendingUp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconAlert() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const userId = localStorage.getItem('userId') || 1

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:5000/api/analytics?user_id=${userId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data:', data)
        setAnalytics(data)
      } else {
        setError('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getRecommendations = () => {
    if (!analytics || !analytics.categoryDelays || analytics.categoryDelays.length === 0) {
      return []
    }

    const recommendations = []
    
    // Most delayed category
    const mostDelayed = analytics.categoryDelays[0]
    if (mostDelayed) {
      recommendations.push({
        icon: '🎯',
        title: 'Focus Area',
        message: `"${mostDelayed.category}" tasks are your most delayed category. Consider breaking them into smaller subtasks.`
      })
    }

    // Most common reason
    if (analytics.reasonsBreakdown && analytics.reasonsBreakdown.length > 0) {
      const topReason = analytics.reasonsBreakdown[0]
      recommendations.push({
        icon: '💡',
        title: 'Main Challenge',
        message: `"${topReason.reason_text}" is your most common reason. Try to identify and minimize this trigger.`
      })
    }

    // Most common emotion
    if (analytics.emotionsBreakdown && analytics.emotionsBreakdown.length > 0) {
      const topEmotion = analytics.emotionsBreakdown[0]
      if (['Stressed', 'Anxious', 'Frustrated'].includes(topEmotion.emotion_text)) {
        recommendations.push({
          icon: '🧘',
          title: 'Emotional Pattern',
          message: `You often feel "${topEmotion.emotion_text}" when procrastinating. Consider stress management techniques.`
        })
      }
    }

    // High average delay
    if (analytics.avgDelay > 60) {
      recommendations.push({
        icon: '⏰',
        title: 'Time Management',
        message: `Your average delay is ${formatDuration(analytics.avgDelay)}. Try setting more realistic deadlines or adding buffer time.`
        })
    }

    return recommendations
  }

  // Colors for charts
  const COLORS = ['#540863', '#92487A', '#E49BA6', '#FFD3D5', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0']

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h2 className="page-heading">📊 Analytics</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h2 className="page-heading">📊 Analytics</h2>
        </div>
        <div className="error-state">
          <IconAlert />
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchAnalytics}>Retry</button>
        </div>
      </div>
    )
  }

  if (!analytics || analytics.totalTasks?.total_tasks === 0) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h2 className="page-heading">📊 Analytics</h2>
          <p className="page-subheading">Track your productivity patterns</p>
        </div>
        <div className="empty-analytics">
          <div className="empty-icon">📈</div>
          <h3>No Data Yet</h3>
          <p>Start creating and completing tasks to see your analytics!</p>
        </div>
      </div>
    )
  }

  const delayRate = analytics.totalTasks.completed_tasks > 0
    ? ((analytics.delayedTasks / analytics.totalTasks.completed_tasks) * 100).toFixed(1)
    : 0

  const recommendations = getRecommendations()

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h2 className="page-heading">📊 Analytics & Insights</h2>
          <p className="page-subheading">Understand your productivity patterns</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <IconCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalTasks.total_tasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <IconCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalTasks.completed_tasks}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon delayed">
            <IconClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{analytics.delayedTasks}</div>
            <div className="stat-label">Delayed Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rate">
            <IconTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{delayRate}%</div>
            <div className="stat-label">Delay Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon avg">
            <IconClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatDuration(analytics.avgDelay)}</div>
            <div className="stat-label">Avg Delay Duration</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3 className="section-title">💡 Personalized Recommendations</h3>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <h4>{rec.title}</h4>
                  <p>{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        {/* Reasons Breakdown */}
        {analytics.reasonsBreakdown && analytics.reasonsBreakdown.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Most Common Reasons for Delay</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.reasonsBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD3D5" />
                <XAxis dataKey="reason_text" stroke="#540863" />
                <YAxis stroke="#540863" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '2px solid #FFD3D5',
                    borderRadius: '12px'
                  }} 
                />
                <Bar dataKey="count" fill="#92487A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Emotional States */}
        {analytics.emotionsBreakdown && analytics.emotionsBreakdown.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Emotional State Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.emotionsBreakdown}
                  dataKey="count"
                  nameKey="emotion_text"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.emotion_text}: ${entry.count}`}
                >
                  {analytics.emotionsBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category-wise Delays */}
        {analytics.categoryDelays && analytics.categoryDelays.length > 0 && (
          <div className="chart-card full-width">
            <h3 className="chart-title">Delays by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryDelays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD3D5" />
                <XAxis dataKey="category" stroke="#540863" />
                <YAxis stroke="#540863" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '2px solid #FFD3D5',
                    borderRadius: '12px'
                  }} 
                />
                <Legend />
                <Bar dataKey="delay_count" fill="#540863" name="Number of Delays" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avg_delay" fill="#E49BA6" name="Avg Delay (min)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Delay Trends Over Time */}
        {analytics.delayTrends && analytics.delayTrends.length > 0 && (
          <div className="chart-card full-width">
            <h3 className="chart-title">Delay Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.delayTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD3D5" />
                <XAxis 
                  dataKey="date" 
                  stroke="#540863"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#540863" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '2px solid #FFD3D5',
                    borderRadius: '12px'
                  }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="delay_count" 
                  stroke="#540863" 
                  strokeWidth={3}
                  name="Number of Delays"
                  dot={{ fill: '#540863', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avg_delay" 
                  stroke="#E49BA6" 
                  strokeWidth={3}
                  name="Avg Delay Duration (min)"
                  dot={{ fill: '#E49BA6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
