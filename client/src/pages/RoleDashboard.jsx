import { useSimpleAuth } from '../context/SimpleAuthContext'
import { RefinerDashboard } from './dashboards/RefinerDashboard'
import { CraftsmanDashboard } from './dashboards/CraftsmanDashboard'
import { LabDashboard } from './dashboards/LabDashboard'
import { AdminDashboard } from './dashboards/AdminDashboard'
import { JewellerDashboard } from './dashboards/JewellerDashboard'
import { LogOut, User, Home, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RoleDashboard = () => {
    const { user, signOut } = useSimpleAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        signOut()
        navigate('/login')
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-gold font-black tracking-widest uppercase">Initializing Core...</div>
            </div>
        )
    }

    const getRoleBadge = (role) => {
        const badges = {
            refiner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            craftsman: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            lab: 'bg-green-500/10 text-green-400 border-green-500/20',
            admin: 'bg-red-500/10 text-red-500 border-red-500/20',
            jeweller: 'bg-gold/10 text-gold border-gold/20'
        }
        return badges[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
            {/* Ambient Background Effect */}
            <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
            </div>

            {/* Top Bar */}
            <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-lg shadow-lg shadow-yellow-500/20">
                                <Shield className="text-black" size={24} />
                            </div>
                            <div className="hidden sm:block">
                                <h2 className="text-white font-black tracking-tighter leading-none uppercase italic">Bit<span className="text-gold">Verse</span></h2>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Protocol v1.0</span>
                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                <User className="text-gray-400" size={20} />
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm font-black uppercase text-white tracking-tight">{user.name}</div>
                                <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${getRoleBadge(user.role)}`}>
                                    {user.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition border border-white/5 group"
                        >
                            <Home size={20} className="group-hover:scale-110 transition" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-white/5 hover:bg-red-500/10 text-white hover:text-red-500 px-6 py-3 rounded-xl border border-white/5 hover:border-red-500/20 transition-all flex items-center gap-3 font-bold text-sm"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Terminate Session</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Dashboard Content */}
            <main className="max-w-7xl mx-auto p-6 md:p-10 relative">
                {user.role === 'refiner' && <RefinerDashboard />}
                {user.role === 'craftsman' && <CraftsmanDashboard />}
                {user.role === 'lab' && <LabDashboard />}
                {user.role === 'admin' && <AdminDashboard />}
                {user.role === 'jeweller' && <JewellerDashboard />}
            </main>

            {/* System Footer */}
            <footer className="max-w-7xl mx-auto px-10 py-10 opacity-30">
                <div className="flex justify-between items-center border-t border-white/5 pt-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        © 2026 BitVerse Gold Ledger. All Rights Reserved.
                    </div>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <span>Mainnet Status: Optimal</span>
                        <span>Latency: 12ms</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default RoleDashboard
