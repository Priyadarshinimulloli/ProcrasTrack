import './Insights.css'

export default function Insights() {
  return (
    <div className="insights-page">
      <div className="page-header">
        <div>
          <h2 className="page-heading">Insights & Analytics</h2>
          <p className="page-subheading">Understand your procrastination patterns and improve focus</p>
        </div>
      </div>

      <div className="insights-placeholder">
        <div className="placeholder-icon">📊</div>
        <h3>Insights Coming Soon</h3>
        <p>We're working on powerful analytics to help you:</p>
        <ul>
          <li>Visualize procrastination trends over time</li>
          <li>Identify peak procrastination hours</li>
          <li>Analyze emotional patterns</li>
          <li>Track task completion rates</li>
          <li>Generate personalized recommendations</li>
        </ul>
      </div>
    </div>
  )
}
