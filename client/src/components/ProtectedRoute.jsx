import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
    const { user, profile, loading } = useAuth()

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Simple role check if provided
    // Note: For MVP we might skip strict role checks for now, or assume 'public' role means basic user
    // If profile role doesn't match needed role: (Can implement later)

    return children
}

export default ProtectedRoute
