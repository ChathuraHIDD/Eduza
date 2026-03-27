import Home from './Home'
import LandingPage from './LandingPage'

function HomeWrapper() {
  const token = localStorage.getItem('token')
  
  // If user is not logged in, show landing page
  // If user is logged in, show dashboard
  return token ? <Home /> : <LandingPage />
}

export default HomeWrapper
