import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProcrastinationLog.css'

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ProcrastinationLog() {
  const [logs, setLogs] = useState([])
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState({
    task_id: '',
    date: new Date().toISOString().split('T')[0],
    duration_minutes: '',
    reason: '',
    emotional_state: 'neutral',
    notes: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchLogs()
    fetchTasks()
  }, [selectedDate])

  const fetchLogs = async () => {
    try {
      let url = 'http://localhost:5000/api/procrastination-logs'
      if (selectedDate) {
        url += `?date=${selectedDate}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:5000/api/procrastination-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchLogs()
        closeModal()
        alert('Procrastination log added!')
      }
    } catch (error) {
      console.error('Failed to add log:', error)
      alert('Failed to add log')
    }
  }

  const openModal = () => {
    setFormData({
      task_id: '',
      date: new Date().toISOString().split('T')[0],
      duration_minutes: '',
      reason: '',
      emotional_state: 'neutral',
      notes: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const viewDetails = (logId) => {
    navigate(`/userdashboard/procrastination-log/${logId}`)
  }

  const groupLogsByDate = () => {
    const grouped = {}
    logs.forEach(log => {
      const date = new Date(log.date).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(log)
    })
    return grouped
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

  const groupedLogs = groupLogsByDate()

  return (
    <div className="procrastination-log-page">
      <div className="page-header">
        <div>
          <h2 className="page-heading">Procrastination Log</h2>
          <p className="page-subheading">Track and understand your procrastination patterns</p>
        </div>
        <div className="header-actions">
          <input
            type="date"
            className="date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openModal}>
            <IconPlus />
            Add Log
          </button>
        </div>
      </div>

      {Object.keys(groupedLogs).length === 0 ? (
        <div className="empty-state">
          <p>No procrastination logs yet. Start tracking your patterns!</p>
        </div>
      ) : (
        <div className="logs-timeline">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date} className="date-section">
              <div className="date-header">
                <IconCalendar />
                <h3>{date}</h3>
                <span className="log-count">{dateLogs.length} {dateLogs.length === 1 ? 'log' : 'logs'}</span>
              </div>

              <div className="logs-list">
                {dateLogs.map(log => (
                  <div key={log.id} className="log-card" onClick={() => viewDetails(log.id)}>
                    <div className="log-header">
                      <div className="log-task">
                        <strong>{log.task_title || 'Task'}</strong>
                        <span className="emotion-badge">
                          {getEmotionEmoji(log.emotional_state)} {log.emotional_state}
                        </span>
                      </div>
                      <div className="log-duration">
                        <IconClock />
                        {log.duration_minutes} min
                      </div>
                    </div>

                    <p className="log-reason">{log.reason}</p>
                    
                    {log.notes && (
                      <p className="log-notes">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Procrastination Log</h3>
              <button className="icon-btn" onClick={closeModal}>
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="log-form">
              <div className="form-group">
                <label htmlFor="task">Task *</label>
                <select
                  id="task"
                  value={formData.task_id}
                  onChange={(e) => setFormData({...formData, task_id: e.target.value})}
                  required
                >
                  <option value="">Select a task</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes) *</label>
                  <input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                    required
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Procrastination *</label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows="3"
                  required
                  placeholder="What caused you to procrastinate?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emotional-state">Emotional State *</label>
                <select
                  id="emotional-state"
                  value={formData.emotional_state}
                  onChange={(e) => setFormData({...formData, emotional_state: e.target.value})}
                  required
                >
                  <option value="neutral">😐 Neutral</option>
                  <option value="happy">😊 Happy</option>
                  <option value="sad">😢 Sad</option>
                  <option value="stressed">😰 Stressed</option>
                  <option value="frustrated">😤 Frustrated</option>
                  <option value="anxious">😟 Anxious</option>
                  <option value="motivated">💪 Motivated</option>
                  <option value="tired">😴 Tired</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Any additional thoughts or observations..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
