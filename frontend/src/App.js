import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SmartSchedule from './pages/SmartSchedule'
import Profile from './pages/Profile'
import LectureProfile from './pages/LectureProfile'
import StressHub from './pages/StressHub'

import Login from './pages/Login' // login/register
import Register from './pages/Register' // login/register
import ProtectedRoute from './components/ProtectedRoute' // login/register

import LecturerDashboard from './pages/LecturerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CoordinatorDashboard from './pages/CoordinatorDashboard'

import GroupChat from './pages/saumya/GroupChat'
import KuppiSessions from './pages/saumya/KuppiSessions'
import SoftwareHub from './pages/saumya/SoftwareHub'
import AINotes from './pages/saumya/AINotes'
import SoftwareDetails from './pages/saumya/SoftwareDetails'

function AdminPage() {
  return <div>Admin Dashboard</div>
}

function LecturerPage() {
  return <div>Lecturer Dashboard</div>
}

function CoordinatorPage() {
  return <div>Coordinator Dashboard</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="smart-schedule" element={<SmartSchedule />} />
          <Route path="stress-hub" element={<StressHub />} />
          <Route path="lecture-profile" element={<LectureProfile />} />

          <Route path="/group-chat" element={<GroupChat />} />
          <Route path="/kuppi-sessions" element={<KuppiSessions />} />
          <Route path="/software-hub" element={<SoftwareHub />} />
          <Route path="/ai-notes" element={<AINotes />} />
          <Route path="software/:slug" element={<SoftwareDetails />} />

          <Route
            path="profile"
            element={
              <ProtectedRoute roles={['student', 'lecturer', 'admin', 'coordinator']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="lecture-profile"
            element={
              <ProtectedRoute roles={['lecturer', 'admin']}>
                <LectureProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="lecturer"
            element={
              <ProtectedRoute roles={['lecturer']}>
                <LecturerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="coordinator"
            element={
              <ProtectedRoute roles={['coordinator']}>
                <CoordinatorPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Login />} /> {/* login/register */}
        <Route path="/register" element={<Register />} /> {/* login/register */}
      </Routes>
    </BrowserRouter>
  )
}

export default App