import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import AdminDashboard from './components/adminDashboard'
import UserDashboard from './components/userDashboard'
import DashboardHome from './components/DashboardHome'
import Tasks from './components/Tasks'
import ProcrastinationLog from './components/ProcrastinationLog'
import ProcrastinationDetails from './components/ProcrastinationDetails'
import Analytics from './components/Analytics'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/userdashboard" element={<UserDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="procrastination-log" element={<ProcrastinationLog />} />
          <Route path="procrastination-log/:logId" element={<ProcrastinationDetails />} />
          <Route path="insights" element={<Analytics />} />
        </Route>
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
