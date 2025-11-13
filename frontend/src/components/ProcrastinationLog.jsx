import { useState, useEffect } from 'react'
import './ProcrastinationLog.css'

function IconFilter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ProcrastinationLog() {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    reason: 'all',
    emotion: 'all',
    category: 'all',
    sortBy: 'date'
  })

  const userId = localStorage.getItem('userId') || 1

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, filters])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching logs for user:', userId)
      const response = await fetch(`http://localhost:5000/api/procrastination-logs?user_id=${userId}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched procrastination logs:', data)
        console.log('Number of logs:', data.length)
        setLogs(data)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch logs, status:', response.status, errorText)
        setError(`Failed to load logs: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      setError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    // Filter by reason
    if (filters.reason !== 'all') {
      filtered = filtered.filter(log => log.reason_text === filters.reason)
    }

    // Filter by emotion
    if (filters.emotion !== 'all') {
      filtered = filtered.filter(log => log.emotion_text === filters.emotion)
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(log => log.category === filters.category)
    }

    // Sort
    switch (filters.sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.logged_date) - new Date(a.logged_date))
        break
      case 'duration':
        filtered.sort((a, b) => b.delay_duration - a.delay_duration)
        break
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category))
        break
      case 'reason':
        filtered.sort((a, b) => a.reason_text.localeCompare(b.reason_text))
        break
      default:
        break
    }

    setFilteredLogs(filtered)
  }

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A'
    const date = new Date(datetime)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getDelaySeverityClass = (minutes) => {
    if (minutes <= 15) return 'delay-low'
    if (minutes <= 60) return 'delay-medium'
    return 'delay-high'
  }

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      'Stressed': '�',
      'Tired': '�',
      'Anxious': '�',
      'Relaxed': '�',
      'Happy': '�',
      'Frustrated': '�',
      'Neutral': '�'
    }
    return emojis[emotion] || '😐'
  }

  // Get unique values for filters
  const uniqueReasons = [...new Set(logs.map(log => log.reason_text))].sort()
  const uniqueEmotions = [...new Set(logs.map(log => log.emotion_text))].sort()
  const uniqueCategories = [...new Set(logs.map(log => log.category))].sort()

  return (
    <div className="procrastination-log-page">
      <div className="page-header">
        <div>
          <h2 className="page-heading">⏰ Procrastination Log</h2>
          <p className="page-subheading">
            Delayed tasks only • {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="reason-filter">
              <IconFilter />
              Reason
            </label>
            <select
              id="reason-filter"
              value={filters.reason}
              onChange={(e) => setFilters({...filters, reason: e.target.value})}
            >
              <option value="all">All Reasons</option>
              {uniqueReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="emotion-filter">
              <IconFilter />
              Emotion
            </label>
            <select
              id="emotion-filter"
              value={filters.emotion}
              onChange={(e) => setFilters({...filters, emotion: e.target.value})}
            >
              <option value="all">All Emotions</option>
              {uniqueEmotions.map(emotion => (
                <option key={emotion} value={emotion}>
                  {getEmotionEmoji(emotion)} {emotion}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">
              <IconFilter />
              Category
            </label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter">
              <IconFilter />
              Sort By
            </label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="date">Date (Newest)</option>
              <option value="duration">Duration (Longest)</option>
              <option value="category">Category (A-Z)</option>
              <option value="reason">Reason (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h3>Loading...</h3>
          <p>Fetching your procrastination logs</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchLogs} style={{marginTop: '1rem'}}>
            Retry
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Delayed Tasks Found</h3>
          <p>
            {logs.length === 0 
              ? "You haven't logged any delayed tasks yet. Complete a task after its planned end time to see it here!"
              : "No delayed tasks match your current filters. Try adjusting the filters above."}
          </p>
        </div>
      ) : (
        <div className="logs-grid">
          {filteredLogs.map(log => (
            <div key={log.log_id} className={`log-card ${getDelaySeverityClass(log.delay_duration)}`}>
              <div className="log-card-header">
                <h3 className="log-task-name">{log.task_name}</h3>
                <span className="category-badge">{log.category}</span>
              </div>

              <div className="log-card-body">
                <div className="log-info-row">
                  <span className="log-label">
                    <IconCalendar />
                    Planned End:
                  </span>
                  <span className="log-value">{formatDateTime(log.planned_end)}</span>
                </div>

                <div className="log-info-row">
                  <span className="log-label">
                    <IconCalendar />
                    Actual End:
                  </span>
                  <span className="log-value">{formatDateTime(log.actual_end)}</span>
                </div>

                <div className="log-info-row highlight">
                  <span className="log-label">
                    <IconClock />
                    Delay Duration:
                  </span>
                  <span className="log-value delay-value">{formatDuration(log.delay_duration)}</span>
                </div>

                <div className="log-divider"></div>

                <div className="log-info-row">
                  <span className="log-label">💭 Reason:</span>
                  <span className="log-value">{log.reason_text}</span>
                </div>

                <div className="log-info-row">
                  <span className="log-label">😊 Emotional State:</span>
                  <span className="log-value">
                    {getEmotionEmoji(log.emotion_text)} {log.emotion_text}
                  </span>
                </div>

                <div className="log-info-row">
                  <span className="log-label">📅 Logged:</span>
                  <span className="log-value">{formatDate(log.logged_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
