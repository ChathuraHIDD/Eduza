import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomeWrapper from './pages/HomeWrapper'
import Home from './pages/Home'
import SmartSchedule from './pages/SmartSchedule'
import Profile from './pages/Profile'
import LectureProfile from './pages/LectureProfile'
import StressHub from './pages/StressHub'
import StressHubRedResult from './pages/StressHubRedResult'
import StressHubOrangeResult from './pages/StressHubOrangeResult'
import StressHubYellowResult from './pages/StressHubYellowResult'
import StressHubGreenResult from './pages/StressHubGreenResult'
import StressHubBlueResult from './pages/StressHubBlueResult'
import StressHubOrangeGamePage from './pages/StressHubOrangeGamePage'
import ProgressTracker from './pages/ProgressTracker'

import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

import LecturerDashboard from './pages/LecturerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminStressManagement from './pages/AdminStressManagement'
import AdminRequests from './pages/AdminRequests'
import AdminModuleRequests from './pages/AdminModuleRequests'
import CoordinatorDashboard from './pages/CoordinatorDashboard'
import GuardianStressResult from './pages/GuardianStressResult'

import GroupChat from './pages/saumya/GroupChat'
import KuppiSessions from './pages/saumya/KuppiSessions'
import SoftwareHub from './pages/saumya/SoftwareHub'
import AINotes from './pages/saumya/AINotes'
import SoftwareDetails from './pages/saumya/SoftwareDetails'
import UploadSoftware from './pages/saumya/UploadSoftware'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeWrapper />} />
          <Route path="smart-schedule" element={<SmartSchedule />} />
          <Route path="stress-hub" element={<StressHub />} />
          <Route path="stress-hub/red" element={<StressHubRedResult />} />
          <Route path="stress-hub/orange" element={<StressHubOrangeResult />} />
          <Route path="stress-hub/yellow" element={<StressHubYellowResult />} />
          <Route path="stress-hub/green" element={<StressHubGreenResult />} />
          <Route path="stress-hub/blue" element={<StressHubBlueResult />} />
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
            path="admin/stress-management"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminStressManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/requests"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/module-requests"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminModuleRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="coordinator"
            element={
              <ProtectedRoute roles={['guardian']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="guardian/stress-result"
            element={
              <ProtectedRoute roles={['guardian']}>
                <GuardianStressResult />
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

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/stress-hub/orange/games/:gameSlug"
          element={
            <ProtectedRoute roles={['student', 'lecturer', 'admin', 'coordinator']}>
              <StressHubOrangeGamePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App