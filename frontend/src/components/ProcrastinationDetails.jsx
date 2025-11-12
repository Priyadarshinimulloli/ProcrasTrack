import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ProcrastinationDetails.css'

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconMessageCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ProcrastinationDetails() {
  const { logId } = useParams()
  const navigate = useNavigate()
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogDetails()
  }, [logId])

  const fetchLogDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/procrastination-logs/${logId}`)
      if (response.ok) {
        const data = await response.json()
        setLog(data)
      } else {
        alert('Failed to load log details')
        navigate('/userdashboard/procrastination-log')
      }
    } catch (error) {
      console.error('Failed to fetch log details:', error)
      alert('Error loading log details')
      navigate('/userdashboard/procrastination-log')
    } finally {
      setLoading(false)
    }
  }

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      'happy': '😊',
      'sad': '😢',
      'stressed': '😰',
      'frustrated': '😤',
      'anxious': '😟',
      'neutral': '😐',
      'motivated': '💪',
      'tired': '😴'
    }
    return emojis[emotion] || '😐'
  }

  const getEmotionColor = (emotion) => {
    const colors = {
      'happy': '#16a34a',
      'sad': '#3b82f6',
      'stressed': '#ef4444',
      'frustrated': '#dc2626',
      'anxious': '#f59e0b',
      'neutral': '#7b8a99',
      'motivated': '#16a34a',
      'tired': '#6b7280'
    }
    return colors[emotion] || '#7b8a99'
  }

  if (loading) {
    return (
      <div className="details-loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="details-error">
        <p>Log not found</p>
      </div>
    )
  }

  return (
    <div className="procrastination-details-page">
      <button className="btn btn-outline back-btn" onClick={() => navigate('/userdashboard/procrastination-log')}>
        <IconBack />
        Back to Log
      </button>

      <div className="details-container">
        <div className="details-header">
          <div className="task-badge">Task Log</div>
          <h1 className="details-title">{log.task_title || 'Task Details'}</h1>
        </div>

        <div className="details-grid">
          <div className="info-card">
            <div className="info-icon">
              <IconCalendar />
            </div>
            <div className="info-content">
              <span className="info-label">Date</span>
              <span className="info-value">{new Date(log.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <IconClock />
            </div>
            <div className="info-content">
              <span className="info-label">Duration</span>
              <span className="info-value">{log.duration_minutes} minutes</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon" style={{ color: getEmotionColor(log.emotional_state) }}>
              <IconHeart />
            </div>
            <div className="info-content">
              <span className="info-label">Emotional State</span>
              <span className="info-value">
                {getEmotionEmoji(log.emotional_state)} {log.emotional_state}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <div className="section-header">
            <IconMessageCircle />
            <h3>Reason for Procrastination</h3>
          </div>
          <div className="section-content">
            <p className="reason-text">{log.reason}</p>
          </div>
        </div>

        {log.notes && (
          <div className="details-section">
            <div className="section-header">
              <IconMessageCircle />
              <h3>Additional Notes</h3>
            </div>
            <div className="section-content">
              <p className="notes-text">{log.notes}</p>
            </div>
          </div>
        )}

        <div className="insights-section">
          <h3>Insights & Analysis</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Time Lost</h4>
              <p className="insight-stat">{log.duration_minutes} min</p>
              <p className="insight-desc">Total procrastination time</p>
            </div>

            <div className="insight-card">
              <h4>Emotional Impact</h4>
              <p className="insight-stat" style={{ color: getEmotionColor(log.emotional_state) }}>
                {getEmotionEmoji(log.emotional_state)}
              </p>
              <p className="insight-desc">Feeling: {log.emotional_state}</p>
            </div>

            <div className="insight-card">
              <h4>Pattern Recognition</h4>
              <p className="insight-desc">Track similar instances to identify recurring patterns</p>
            </div>
          </div>
        </div>

        <div className="action-tips">
          <h4>💡 Tips to Overcome This Pattern</h4>
          <ul>
            <li>Break the task into smaller, manageable chunks</li>
            <li>Set a timer for focused work sessions (Pomodoro technique)</li>
            <li>Identify and address the root cause of procrastination</li>
            <li>Create a distraction-free environment</li>
            <li>Reward yourself after completing milestones</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
