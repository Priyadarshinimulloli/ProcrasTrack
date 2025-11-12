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
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    planned_start_time: '',
    planned_end_time: ''
  })

  // user id (should be set after login). Fallback to 1 for development.
  const userId = localStorage.getItem('userId') || 1

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks()
  }, [])

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

  
  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}?user_id=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTasks()
        alert('Task deleted!')
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

      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.task_id} className="task-card">
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
                    className="icon-btn danger" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(task.task_id)
                    }} 
                    aria-label="Delete"
                    title="Delete Task"
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
    </div>
  )
}
