import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SmartSchedule from './pages/SmartSchedule'
import Profile from './pages/Profile'
import LectureProfile from './pages/LectureProfile'
import StressHub from './pages/StressHub'
import ProgressTracker from './pages/ProgressTracker'

import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

import LecturerDashboard from './pages/LecturerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CoordinatorDashboard from './pages/CoordinatorDashboard'

import GroupChat from './pages/saumya/GroupChat'
import KuppiSessions from './pages/saumya/KuppiSessions'
import SoftwareHub from './pages/saumya/SoftwareHub'
import AINotes from './pages/saumya/AINotes'
import SoftwareDetails from './pages/saumya/SoftwareDetails'
import UploadSoftware from './pages/saumya/UploadSoftware'

import ProgressModules from "./pages/nethmi/ProgressModules";
import QuizPage from "./pages/nethmi/QuizPage";
import SelfCheckPage from "./pages/nethmi/SelfCheckPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="smart-schedule" element={<SmartSchedule />} />
          <Route path="stress-hub" element={<StressHub />} />
          <Route path="progress-tracker" element={<ProgressTracker />} />

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
            path="lecturer"
            element={
              <ProtectedRoute roles={['lecturer', 'admin']}>
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="coordinator"
            element={
              <ProtectedRoute roles={['coordinator']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="group-chat" element={<GroupChat />} />
          <Route path="kuppi-sessions" element={<KuppiSessions />} />
          <Route path="software-hub" element={<SoftwareHub />} />
          <Route path="ai-notes" element={<AINotes />} />
          <Route path="software/:slug" element={<SoftwareDetails />} />
          <Route
            path="upload-software"
            element={
              <ProtectedRoute roles={['lecturer', 'admin']}>
                <UploadSoftware />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/progress-tracker/modules" element={<ProgressModules />} />
        <Route path="/progress-tracker/quiz/:moduleId" element={<QuizPage />} />
        <Route path="/progress-tracker/self-check/:moduleId" element={<SelfCheckPage />} />


        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

       


      </Routes>
    </BrowserRouter>
  )
}

export default App