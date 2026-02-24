import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SmartSchedule from './pages/SmartSchedule'
import Profile from './pages/Profile'
import LectureProfile from './pages/LectureProfile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="smart-schedule" element={<SmartSchedule />} />
          <Route path="profile" element={<Profile />} />
          <Route path="lecture-profile" element={<LectureProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
