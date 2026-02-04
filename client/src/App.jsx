import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { SimpleAuthProvider } from './context/SimpleAuthContext'
import Landing from './pages/Landing'
import SimpleLogin from './pages/SimpleLogin'
import { PublicVerifyView } from './pages/PublicVerifyView'
import RoleDashboard from './pages/RoleDashboard'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <SimpleAuthProvider>
      <Router>
        <div className="font-sans bg-black min-h-screen text-white">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="/verify" element={<PublicVerifyView />} />

            {/* Protected Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect any unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </SimpleAuthProvider>
  )
}

export default App
