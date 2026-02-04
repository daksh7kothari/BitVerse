import { useSimpleAuth } from '../context/SimpleAuthContext'
import { RefinerDashboard } from './dashboards/RefinerDashboard'
import { CraftsmanDashboard } from './dashboards/CraftsmanDashboard'
import { LabDashboard } from './dashboards/LabDashboard'
import { AdminDashboard } from './dashboards/AdminDashboard'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RoleDashboard = () => {
    const { user, signOut } = useSimpleAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        signOut()
        navigate('/login')
    }

    if (!user) {
        return <div>Loading...</div>
    }

    // Role badge colors
    const getRoleBadge = (role) => {
        const badges = {
            refiner: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
            craftsman: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
            lab: 'bg-green-500/20 text-green-300 border-green-500/50',
            admin: 'bg-red-500/20 text-red-300 border-red-500/50'
        }
        return badges[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Top Bar */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-b border-yellow-500/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <User className="text-yellow-500" size={24} />
                            <div>
                                <h2 className="text-white font-bold">{user.name}</h2>
                                <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadge(user.role)}`}>
                                    {user.role.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto p-6">
                {user.role === 'refiner' && <RefinerDashboard />}
                {user.role === 'craftsman' && <CraftsmanDashboard />}
                {user.role === 'lab' && <LabDashboard />}
                {user.role === 'admin' && <AdminDashboard />}
            </div>
        </div>
    )
}

export default RoleDashboard
