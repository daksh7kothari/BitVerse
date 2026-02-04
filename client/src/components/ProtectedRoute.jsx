import { useSimpleAuth } from '../context/SimpleAuthContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSimpleAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-yellow-500 text-xl">Loading...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute
