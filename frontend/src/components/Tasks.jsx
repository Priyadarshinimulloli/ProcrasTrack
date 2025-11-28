import { useState, useEffect } from 'react'
import './Tasks.css'

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  )
}

function IconDelete() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 3l14 9-14 9V3z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDelayModal, setShowDelayModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [completingTask, setCompletingTask] = useState(null)
  const [reasons, setReasons] = useState([])
  const [emotionalStates, setEmotionalStates] = useState([])
  
  // Filter states
  const [filterOption, setFilterOption] = useState('all') // 'all', 'today', 'week', 'month', 'custom'
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'completed', 'in-progress', 'pending'
  
  // Track which tasks have been notified to avoid duplicate alerts
  const [notifiedTasks, setNotifiedTasks] = useState(new Set())
  
  // Track hidden tasks (frontend-only delete)
  const [hiddenTasks, setHiddenTasks] = useState(new Set())
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    planned_start_time: '',
    planned_end_time: ''
  })
  const [delayData, setDelayData] = useState({
    reason_id: '',
    emotional_id: ''
  })

  // user id (should be set after login). Fallback to 1 for development.
  const userId = localStorage.getItem('userId') || 1

  // Fetch tasks, reasons, and emotional states from backend
  useEffect(() => {
    fetchTasks()
    fetchReasons()
    fetchEmotionalStates()
  }, [])

  // Check for overdue tasks every minute
  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date()
      
      tasks.forEach(task => {
        const status = getTaskStatus(task)
        
        // Only check in-progress tasks
        if (status !== 'in-progress') return
        
        // Check if task has crossed planned end time
        const plannedEnd = new Date(task.planned_end || task.planned_end_time)
        const isOverdue = now > plannedEnd
        
        // Show notification if overdue and not already notified
        if (isOverdue && !notifiedTasks.has(task.task_id)) {
          showOverdueNotification(task, now, plannedEnd)
          setNotifiedTasks(prev => new Set([...prev, task.task_id]))
        }
      })
    }

    // Check immediately and then every minute
    checkOverdueTasks()
    const interval = setInterval(checkOverdueTasks, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [tasks, notifiedTasks])

  const showOverdueNotification = (task, currentTime, plannedEnd) => {
    const delayMinutes = Math.round((currentTime - plannedEnd) / (1000 * 60))
    
    // Create a custom alert with better styling
    const message = `⏰ Task Overdue Alert!\n\n` +
                   `Task: ${task.task_name}\n` +
                   `Category: ${task.category}\n` +
                   `Planned End: ${formatDateTime(plannedEnd)}\n` +
                   `Current Delay: ${delayMinutes} minute(s)\n\n` +
                   `Please complete this task or update its timeline.`
    
    alert(message)
    
    // Optional: Use browser notification API if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Task Overdue!", {
        body: `${task.task_name} is ${delayMinutes} minute(s) overdue`,
        icon: "⏰",
        tag: `task-${task.task_id}` // Prevents duplicate notifications
      })
    }
  }

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const fetchReasons = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reasons')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched reasons:', data)
        console.log('Reasons array length:', data.length)
        console.log('First reason:', data[0])
        setReasons(data)
      } else {
        console.error('Failed to fetch reasons, status:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch reasons:', error)
    }
  }

  const fetchEmotionalStates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emotional-states')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched emotional states:', data)
        console.log('Emotional states array length:', data.length)
        console.log('First emotional state:', data[0])
        setEmotionalStates(data)
      } else {
        console.error('Failed to fetch emotional states, status:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch emotional states:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch(`http://localhost:5000/api/tasks?user_id=${userId}`)
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
    const url = editingTask
      ? `http://localhost:5000/api/tasks/${editingTask.task_id}`
      : 'http://localhost:5000/api/tasks'

    const method = editingTask ? 'PUT' : 'POST'

    const formatForSQL = dt => dt.replace('T', ' ') + ':00'

    // Prepare the request body based on whether it's edit or create
    const requestBody = editingTask ? {
      // PUT expects: title, category, planned_start, planned_end
      title: formData.title,
      category: formData.category,
      planned_start: formatForSQL(formData.planned_start_time),
      planned_end: formatForSQL(formData.planned_end_time),
      user_id: userId
    } : {
      // POST expects: task_name, category, planned_start, planned_end
      task_name: formData.title,
      category: formData.category,
      planned_start: formatForSQL(formData.planned_start_time),
      planned_end: formatForSQL(formData.planned_end_time),
      status: 'pending',
      user_id: userId
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      await fetchTasks()
      closeModal()
      alert(editingTask ? 'Task updated successfully!' : 'Task created successfully!')
    } else {
      const errorData = await response.json().catch(() => ({}))
      alert(`Failed to save task: ${errorData.message || response.statusText}`)
    }
  } catch (error) {
    alert(`Failed to save task: ${error.message}`)
  }
}

const formatForSQL = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in ms
  const localTime = new Date(date - tzOffset); // convert UTC → local
  return localTime.toISOString().slice(0, 19).replace('T', ' ');
};


  const handleStartTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           actual_start: formatForSQL(new Date()),
          user_id: userId
        })
      })

      if (response.ok) {
        fetchTasks()
        alert('Task started!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`Failed to start task: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to start task:', error)
      alert('Failed to start task. Make sure the backend server is running.')
    }
  }

  const handleCompleteTask = async (taskId) => {
    // Find the task to check if it was delayed
    const task = tasks.find(t => t.task_id === taskId)
    if (!task) return

    const now = new Date()
    const plannedEnd = new Date(task.planned_end || task.planned_end_time)
    const wasDelayed = now > plannedEnd

    // If delayed, show the delay modal to capture reason and emotion
    if (wasDelayed) {
      setCompletingTask(task)
      setShowDelayModal(true)
      return
    }

    // If not delayed, complete normally
    await completeTaskDirectly(taskId)
  }

  const completeTaskDirectly = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actual_end: formatForSQL(new Date()),
          user_id: userId
        })
      })

      if (response.ok) {
        // Clear notification flag for this task
        setNotifiedTasks(prev => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
        fetchTasks()
        alert('Task completed!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`Failed to complete task: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
      alert('Failed to complete task. Make sure the backend server is running.')
    }
  }

  const handleSubmitDelay = async (e) => {
    e.preventDefault()
    
    if (!completingTask) return

    try {
      // Calculate delay duration in minutes
      const now = new Date()
      const plannedEnd = new Date(completingTask.planned_end || completingTask.planned_end_time)
      const delayMinutes = Math.round((now - plannedEnd) / (1000 * 60))

      // First, complete the task
      await completeTaskDirectly(completingTask.task_id)

      // Then, create a procrastination log
      const logResponse = await fetch('http://localhost:5000/api/procrastination-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: completingTask.task_id,
          user_id: userId,
          reason_id: delayData.reason_id,
          emotional_id: delayData.emotional_id,
          duration_minutes: delayMinutes > 0 ? delayMinutes : 1,
          date: new Date().toISOString().split('T')[0]
        })
      })

      if (logResponse.ok) {
        alert('Task completed and delay logged!')
        closeDelayModal()
      } else {
        alert('Task completed but failed to log delay')
        closeDelayModal()
      }
    } catch (error) {
      console.error('Failed to log delay:', error)
      alert('Task completed but failed to log delay')
      closeDelayModal()
    }
  }

  const closeDelayModal = () => {
    setShowDelayModal(false)
    setCompletingTask(null)
    setDelayData({
      reason_id: '',
      emotional_id: ''
    })
  }

  
  const handleHideTask = (taskId) => {
    if (!confirm('Hide this task from view? (Task will remain in database)')) return
    
    // Add task to hidden set
    setHiddenTasks(prev => new Set([...prev, taskId]))
    
    // Clear notification flag if exists
    setNotifiedTasks(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
    
    alert('Task hidden from view. Refresh page to see it again.')
  }

  const handlePermanentDelete = async (taskId) => {
    const confirmMsg = 'Are you sure you want to PERMANENTLY DELETE this task from the database?\n\nThis action cannot be undone!'
    if (!confirm(confirmMsg)) return

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}?user_id=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTasks()
        alert('Task permanently deleted from database!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`Failed to delete task: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Failed to delete task. Make sure the backend server is running.')
    }
  }

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task)
      // Handle both column name variations (planned_start vs planned_start_time)
      const plannedStart = task.planned_start || task.planned_start_time
      const plannedEnd = task.planned_end || task.planned_end_time
      
      setFormData({
        title: task.task_name,
        category: task.category,
        planned_start_time: plannedStart ? plannedStart.substring(0, 16) : '',
        planned_end_time: plannedEnd ? plannedEnd.substring(0, 16) : ''
      })
    } else {
      setEditingTask(null)
      setFormData({
        title: '',
        category: '',
        planned_start_time: '',
        planned_end_time: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTask(null)
  }

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return ''
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'status-completed'
      case 'in-progress': return 'status-in-progress'
      case 'pending': return 'status-pending'
      default: return ''
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Completed'
      case 'in-progress': return 'In Progress'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  // Get the status from the task (handles both 'status' and 'user_status' columns)
  const getTaskStatus = (task) => {
    return task.user_status || task.status || 'pending'
  }

  const formatDateTime = (datetime) => {
    if (!datetime) return 'Not set'
    const date = new Date(datetime)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const isTaskDelayed = (task) => {
    const status = getTaskStatus(task)
    if (status === 'completed') return false
    
    const now = new Date()
    const plannedEnd = new Date(task.planned_end || task.planned_end_time)
    return now > plannedEnd
  }

  const getDelayMinutes = (task) => {
    const now = new Date()
    const plannedEnd = new Date(task.planned_end || task.planned_end_time)
    const delayMs = now - plannedEnd
    return Math.round(delayMs / (1000 * 60))
  }

  // Filter helper functions
  const getDateRange = (option) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch(option) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
        }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59)
        return { start: weekStart, end: weekEnd }
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
        return { start: monthStart, end: monthEnd }
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(new Date(customEndDate).setHours(23, 59, 59))
          }
        }
        return null
      default:
        return null
    }
  }

  const filterTasks = () => {
    let filtered = [...tasks]
    
    // Filter out hidden tasks first
    filtered = filtered.filter(task => !hiddenTasks.has(task.task_id))
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => getTaskStatus(task) === statusFilter)
    }
    
    // Filter by completion date (only for completed tasks)
    if (filterOption !== 'all') {
      const dateRange = getDateRange(filterOption)
      
      if (dateRange) {
        filtered = filtered.filter(task => {
          const status = getTaskStatus(task)
          if (status !== 'completed') return false
          
          const completionDate = task.actual_end || task.actual_end_time
          if (!completionDate) return false
          
          const taskDate = new Date(completionDate)
          return taskDate >= dateRange.start && taskDate <= dateRange.end
        })
      }
    }
    
    return filtered
  }

  const filteredTasks = filterTasks()

  const resetFilters = () => {
    setFilterOption('all')
    setStatusFilter('all')
    setCustomStartDate('')
    setCustomEndDate('')
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h2 className="page-heading">Tasks</h2>
          <p className="page-subheading">Manage your tasks and stay organized</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <IconPlus />
          Add Task
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <h3 className="filter-title">🔍 Filter Tasks</h3>
          <button className="btn-reset" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        
        <div className="filter-controls">
          {/* Status Filter */}
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select 
              id="status-filter"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Completion Date Filter */}
          <div className="filter-group">
            <label htmlFor="date-filter">Completed Date</label>
            <select 
              id="date-filter"
              className="filter-select"
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {filterOption === 'custom' && (
            <>
              <div className="filter-group">
                <label htmlFor="start-date">Start Date</label>
                <input
                  id="start-date"
                  type="date"
                  className="filter-input"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label htmlFor="end-date">End Date</label>
                <input
                  id="end-date"
                  type="date"
                  className="filter-input"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Filter Summary */}
        <div className="filter-summary">
          <span className="summary-text">
            Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks
            {statusFilter !== 'all' && <span className="filter-badge">{statusFilter}</span>}
            {filterOption !== 'all' && (
              <span className="filter-badge">
                {filterOption === 'custom' ? 'Custom Date' : filterOption}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            {tasks.length === 0 ? (
              <p>No tasks yet. Create your first task to get started!</p>
            ) : (
              <div>
                <p>No tasks match your current filters.</p>
                <button className="btn btn-outline" onClick={resetFilters} style={{marginTop: '1rem'}}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.task_id} className={`task-card ${isTaskDelayed(task) ? 'task-delayed' : ''}`}>
              {isTaskDelayed(task) && (
                <div className="delay-badge">
                  ⏰ Delayed by {getDelayMinutes(task)} min
                </div>
              )}
              <div className="task-header">
                <h3 className="task-title">{task.task_name}</h3>
                <div className="task-actions">
                  <button 
                    className="icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation()
                      openModal(task)
                    }} 
                    aria-label="Edit"
                    title="Edit Task"
                  >
                    ✏️
                  </button>
                  <button 
                    className="icon-btn warning" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleHideTask(task.task_id)
                    }} 
                    aria-label="Hide"
                    title="Hide Task (Frontend Only)"
                  >
                    👁️‍🗨️
                  </button>
                  <button 
                    className="icon-btn danger" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePermanentDelete(task.task_id)
                    }} 
                    aria-label="Delete Permanently"
                    title="Delete Permanently from Database"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="task-category">
                <span className="category-badge">{task.category}</span>
              </div>
              
              <div className="task-meta">
                <span className={`badge ${getStatusClass(getTaskStatus(task))}`}>
                  {getStatusLabel(getTaskStatus(task))}
                </span>
              </div>
              
              <div className="task-times">
                <div className="time-row">
                  <span className="time-label">Planned:</span>
                  <span className="time-value">
                    {formatDateTime(task.planned_start || task.planned_start_time)} - {formatDateTime(task.planned_end || task.planned_end_time)}
                  </span>
                </div>
                {(task.actual_start || task.actual_start_time) && (
                  <div className="time-row">
                    <span className="time-label">Actual Start:</span>
                    <span className="time-value">{formatDateTime(task.actual_start || task.actual_start_time)}</span>
                  </div>
                )}
                {(task.actual_end || task.actual_end_time) && (
                  <div className="time-row">
                    <span className="time-label">Actual End:</span>
                    <span className="time-value">{formatDateTime(task.actual_end || task.actual_end_time)}</span>
                  </div>
                )}
              </div>

              <div className="task-action-buttons">
                {getTaskStatus(task) === 'pending' && (
                  <button 
                    className="btn btn-start" 
                    onClick={() => handleStartTask(task.task_id)}
                  >
                    <IconPlay />
                    Start Task
                  </button>
                )}
                {getTaskStatus(task) === 'in-progress' && (
                  <button 
                    className="btn btn-complete" 
                    onClick={() => handleCompleteTask(task.task_id)}
                  >
                    <IconCheck />
                    Complete Task
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
              <button className="icon-btn" onClick={closeModal}>
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="title">Task Name *</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter task name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                  placeholder="e.g., Work, Study, Personal"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="planned_start">Planned Start Time *</label>
                  <input
                    id="planned_start"
                    type="datetime-local"
                    value={formData.planned_start_time}
                    onChange={(e) => setFormData({...formData, planned_start_time: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="planned_end">Planned End Time *</label>
                  <input
                    id="planned_end"
                    type="datetime-local"
                    value={formData.planned_end_time}
                    onChange={(e) => setFormData({...formData, planned_end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-info">
                <p>💡 Actual start and end times will be tracked automatically when you start and complete the task.</p>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelayModal && completingTask && (
        <div className="modal-overlay" onClick={closeDelayModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⏱️ Task Completed Late</h3>
              <button className="icon-btn" onClick={closeDelayModal}>
                <IconClose />
              </button>
            </div>

            <div className="delay-info">
              <p><strong>Task:</strong> {completingTask.task_name}</p>
              <p><strong>Planned End:</strong> {formatDateTime(completingTask.planned_end || completingTask.planned_end_time)}</p>
              <p className="delay-message">
                💡 This task was completed after the planned time. Help us understand what happened so we can provide better insights!
              </p>
            </div>

            <form onSubmit={handleSubmitDelay} className="task-form">
              <div className="form-group">
                <label htmlFor="delay-reason">Why was this task delayed? *</label>
                <select
                  id="delay-reason"
                  value={delayData.reason_id}
                  onChange={(e) => setDelayData({...delayData, reason_id: e.target.value})}
                  required
                >
                  <option value="">Select a reason...</option>
                  {reasons.map(reason => (
                    <option key={reason.reason_id} value={reason.reason_id}>
                      {reason.reason_text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="delay-emotion">How did you feel during/after? *</label>
                <select
                  id="delay-emotion"
                  value={delayData.emotional_id}
                  onChange={(e) => setDelayData({...delayData, emotional_id: e.target.value})}
                  required
                >
                  <option value="">Select an emotional state...</option>
                  {emotionalStates.map(state => (
                    <option key={state.emotional_id} value={state.emotional_id}>
                      {state.emotion_text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-info">
                <p>🎯 Your input helps identify patterns and improve your productivity over time!</p>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeDelayModal}>
                  Skip & Complete
                </button>
                <button type="submit" className="btn btn-primary">
                  Complete & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
