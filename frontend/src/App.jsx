import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import AdminDashboard from './components/adminDashboard'
import UserDashboard from './components/userDashboard'
import DashboardHome from './components/DashboardHome'
import Tasks from './components/Tasks'
import ProcrastinationLog from './components/ProcrastinationLog'
import ProcrastinationDetails from './components/ProcrastinationDetails'
import Analytics from './components/Analytics'
import LottieBackground from './components/LottieBackground'
import FloatingLottie from './components/FloatingLottie'
import './App.css'

function App() {
  return (
    <Router>
      <LottieBackground src="/web-design-animation.json" opacity={0.2} />
      
      {/* Floating animated elements scattered around */}
      <FloatingLottie 
        src="/working-animation.json" 
        position={{ top: '10%', right: '5%' }}
        size="110px"
        opacity={0.18}
        delay="0s"
      />
      <FloatingLottie 
        src="/web-design-animation.json" 
        position={{ top: '60%', left: '3%' }}
        size="130px"
        opacity={0.15}
        delay="2s"
      />
      <FloatingLottie 
        src="/working-animation.json" 
        position={{ bottom: '15%', right: '8%' }}
        size="90px"
        opacity={0.22}
        delay="4s"
      />
      <FloatingLottie 
        src="/web-design-animation.json" 
        position={{ top: '35%', right: '15%' }}
        size="80px"
        opacity={0.12}
        delay="1s"
      />
      <FloatingLottie 
        src="/working-animation.json" 
        position={{ bottom: '40%', left: '10%' }}
        size="105px"
        opacity={0.16}
        delay="3s"
      />
      
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
