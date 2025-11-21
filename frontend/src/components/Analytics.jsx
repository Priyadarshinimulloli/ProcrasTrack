import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { jsPDF } from 'jspdf'
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

function IconDownload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingReport, setDownloadingReport] = useState(false)

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

  const downloadReport = async () => {
    setDownloadingReport(true)
    try {
      const today = new Date()
      const weekDate = today.toISOString().split('T')[0]

      const response = await fetch(`http://localhost:5000/api/reports/weekly?user_id=${userId}&date=${weekDate}`)
      if (response.ok) {
        const report = await response.json()
        generatePDFReport(report)
      } else {
        alert('Failed to generate report')
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Error downloading report')
    } finally {
      setDownloadingReport(false)
    }
  }

  const generatePDFReport = (report) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPos = 20

    // Helper function to format duration
    const formatDur = (min) => {
      if (!min) return '0 min'
      if (min < 60) return `${Math.round(min)} min`
      const h = Math.floor(min / 60)
      const m = Math.round(min % 60)
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    }

    // Header with gradient effect (using purple color)
    doc.setFillColor(84, 8, 99) // #540863
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('WEEKLY PRODUCTIVITY REPORT', pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${report.week_start} to ${report.week_end}`, pageWidth / 2, 30, { align: 'center' })

    yPos = 50

    // Overview Section
    doc.setTextColor(84, 8, 99)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Overview', margin, yPos)
    
    yPos += 10
    
    // Draw overview box
    doc.setDrawColor(255, 211, 213) // #FFD3D5
    doc.setLineWidth(0.5)
    doc.rect(margin, yPos, pageWidth - 2 * margin, 60)
    
    yPos += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    
    const overviewData = [
      ['Total Tasks:', report.total_tasks],
      ['Completed Tasks:', report.completed_tasks],
      ['Delayed Tasks:', report.delayed_tasks],
      ['Average Delay:', formatDur(report.avg_delay)],
      ['Avg Planned Duration:', formatDur(report.avg_planned_duration)]
    ]
    
    // Draw Productivity Score Badge first (top right of overview box)
    const scoreX = pageWidth - margin - 25
    const scoreY = yPos + 30
    
    // Determine color based on score
    let scoreColor = [76, 175, 80] // Green
    if (report.productivity_score < 60) scoreColor = [244, 67, 54] // Red
    else if (report.productivity_score < 80) scoreColor = [255, 152, 0] // Orange
    
    doc.setFillColor(...scoreColor)
    doc.circle(scoreX, scoreY, 18, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${Math.round(report.productivity_score)}%`, scoreX, scoreY + 3, { align: 'center' })
    
    // Add label below badge
    doc.setFontSize(8)
    doc.setTextColor(84, 8, 99)
    doc.text('Score', scoreX, scoreY + 25, { align: 'center' })
    
    // Now draw overview data (left side only, leaving space for badge)
    overviewData.forEach(([label, value], index) => {
      const row = index
      const x = margin + 10
      const y = yPos + row * 10
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text(label, x, y)
      doc.setFont('helvetica', 'normal')
      doc.text(String(value), x + 65, y)
    })
    
    yPos += 70

    // Daily Trend Section
    yPos += 5
    doc.setTextColor(84, 8, 99)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Daily Trend', margin, yPos)
    
    yPos += 10
    
    // Table header
    doc.setFillColor(228, 155, 166) // #E49BA6
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Date', margin + 5, yPos + 5.5)
    doc.text('Delays', margin + 70, yPos + 5.5)
    doc.text('Avg Delay', margin + 110, yPos + 5.5)
    
    yPos += 8
    
    // Table rows
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    
    report.daily_trend.forEach((day, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 20
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(255, 243, 244)
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
      }
      
      const dateStr = new Date(day.day).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
      
      doc.text(dateStr, margin + 5, yPos + 5.5)
      doc.text(String(day.delay_count), margin + 70, yPos + 5.5)
      doc.text(formatDur(day.avg_delay), margin + 110, yPos + 5.5)
      
      yPos += 8
    })
    
    yPos += 10

    // Insights Section
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setTextColor(84, 8, 99)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Insights & Recommendations', margin, yPos)
    
    yPos += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    
    const insights = []
    
    if (report.productivity_score >= 80) {
      insights.push('Excellent productivity this week! Keep up the great work.')
    } else if (report.productivity_score >= 60) {
      insights.push('Good progress! Continue improving your time management.')
    } else {
      insights.push('Focus on reducing delays next week. Consider better planning.')
    }
    
    if (report.delayed_tasks === 0) {
      insights.push('Perfect week - no delays! Outstanding performance.')
    } else if (report.delayed_tasks < report.total_tasks / 2) {
      insights.push('Most tasks completed on time. Great consistency.')
    } else {
      insights.push('High delay rate detected. Review your scheduling strategy.')
    }
    
    if (report.avg_delay > 60) {
      insights.push(`Average delay of ${formatDur(report.avg_delay)} is significant. Consider adding buffer time.`)
    }
    
    insights.forEach((insight, index) => {
      const lines = doc.splitTextToSize(insight, pageWidth - 2 * margin - 10)
      
      doc.setFillColor(255, 243, 244)
      const boxHeight = lines.length * 6 + 4
      doc.rect(margin, yPos, pageWidth - 2 * margin, boxHeight, 'F')
      
      doc.setDrawColor(228, 155, 166)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, margin + 5, yPos + boxHeight / 2)
      doc.line(margin, yPos + boxHeight, margin + 5, yPos + boxHeight / 2)
      
      lines.forEach((line, lineIndex) => {
        doc.text(line, margin + 8, yPos + 5 + lineIndex * 6)
      })
      
      yPos += boxHeight + 5
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    const footerY = pageHeight - 10
    doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' })
    doc.text('ProcrasTrack - Productivity Management System', pageWidth / 2, footerY + 4, { align: 'center' })

    // Save the PDF
    doc.save(`Weekly-Report-${report.week_start}-to-${report.week_end}.pdf`)
  }

  const generateReportText = (report) => {
    const formatDur = (min) => {
      if (!min) return '0 min'
      if (min < 60) return `${Math.round(min)} min`
      const h = Math.floor(min / 60)
      const m = Math.round(min % 60)
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    }

    return `
═══════════════════════════════════════════════════════════
           WEEKLY PRODUCTIVITY REPORT
═══════════════════════════════════════════════════════════

Week: ${report.week_start} to ${report.week_end}
Generated: ${new Date(report.generated_at).toLocaleString()}

───────────────────────────────────────────────────────────
📊 OVERVIEW
───────────────────────────────────────────────────────────

Total Tasks:              ${report.total_tasks}
Completed Tasks:          ${report.completed_tasks}
Delayed Tasks:            ${report.delayed_tasks}
Average Delay:            ${formatDur(report.avg_delay)}
Avg Planned Duration:     ${formatDur(report.avg_planned_duration)}
Productivity Score:       ${report.productivity_score.toFixed(1)}%

───────────────────────────────────────────────────────────
📈 DAILY TREND
───────────────────────────────────────────────────────────

${report.daily_trend.map(day => 
  `${new Date(day.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.delay_count} delays (Avg: ${formatDur(day.avg_delay)})`
).join('\n')}

───────────────────────────────────────────────────────────
💡 INSIGHTS
───────────────────────────────────────────────────────────

${report.productivity_score >= 80 ? '🎉 Excellent productivity this week!' : 
  report.productivity_score >= 60 ? '👍 Good progress! Keep improving.' : 
  '⚠️  Focus on reducing delays next week.'}

${report.delayed_tasks === 0 ? '✨ Perfect week - no delays!' : 
  report.delayed_tasks < report.total_tasks / 2 ? '📌 Most tasks completed on time.' : 
  '⏰ High delay rate - consider better time management.'}

───────────────────────────────────────────────────────────

Keep up the great work! 🚀
    `.trim()
  }

  const getRecommendations = () => {
    if (!analytics || !analytics.categoryDelays || analytics.categoryDelays.length === 0) {
      return []
    }

    const recommendations = []
    
    const mostDelayed = analytics.categoryDelays[0]
    if (mostDelayed) {
      recommendations.push({
        icon: '🎯',
        title: 'Focus Area',
        message: `"${mostDelayed.category}" tasks are your most delayed category. Consider breaking them into smaller subtasks.`
      })
    }

    if (analytics.reasonsBreakdown && analytics.reasonsBreakdown.length > 0) {
      const topReason = analytics.reasonsBreakdown[0]
      recommendations.push({
        icon: '💡',
        title: 'Main Challenge',
        message: `"${topReason.reason_text}" is your most common reason. Try to identify and minimize this trigger.`
      })
    }

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

    if (analytics.avgDelay > 60) {
      recommendations.push({
        icon: '⏰',
        title: 'Time Management',
        message: `Your average delay is ${formatDuration(analytics.avgDelay)}. Try setting more realistic deadlines or adding buffer time.`
      })
    }

    return recommendations
  }

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
        <button 
          className="btn btn-download" 
          onClick={downloadReport}
          disabled={downloadingReport}
        >
          {downloadingReport ? (
            <>
              <div className="btn-spinner"></div>
              Generating...
            </>
          ) : (
            <>
              <IconDownload />
              Download Report
            </>
          )}
        </button>
      </div>

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

      <div className="charts-section">
        {analytics.reasonsBreakdown && analytics.reasonsBreakdown.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Most Common Reasons for Delay</h3>
            <ResponsiveContainer width="100%" height={250}>
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

        {analytics.emotionsBreakdown && analytics.emotionsBreakdown.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Emotional State Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.emotionsBreakdown}
                  dataKey="count"
                  nameKey="emotion_text"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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

        {analytics.categoryDelays && analytics.categoryDelays.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Delays by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
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

        {analytics.delayTrends && analytics.delayTrends.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Delay Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
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
