import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSimpleAuth } from '../context/SimpleAuthContext'
import { ShieldCheck, User, Lock, LogIn, ChevronRight, Activity, Database, Users, Shield, Tag } from 'lucide-react'

const SimpleLogin = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useSimpleAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { data, error } = signIn(username.toLowerCase(), password)

        if (error) {
            setError('Authentication failed. Verify credentials.')
            setLoading(false)
            return
        }

        if (data.user) {
            navigate('/dashboard')
        }
        setLoading(false)
    }

    const quickLogin = (user) => {
        setUsername(user)
        setPassword(user)
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-gold selection:text-black font-sans">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/10 blur-[160px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[160px] rounded-full"></div>
            </div>

            <div className="w-full max-w-xl relative animate-slide-up">
                {/* Branding */}
                <div className="text-center mb-12">
                    <div className="inline-flex flex-col items-center">
                        <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-3xl shadow-2xl shadow-yellow-500/20 mb-6 group transition-transform hover:scale-105 duration-500">
                            <Shield className="text-black" size={48} />
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                            Bit<span className="text-gold">Verse</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="h-[1px] w-8 bg-white/10"></span>
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Protocol Ledger</span>
                            <span className="h-[1px] w-8 bg-white/10"></span>
                        </div>
                    </div>
                </div>

                {/* Main Login UI */}
                <div className="glass-panel p-10 md:p-14 rounded-[3.5rem] border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-20"></div>

                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black uppercase tracking-tight">Personnel <span className="text-gold">Access</span></h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Enter cryptographically signed credentials</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl mb-8 text-xs font-black uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors duration-300">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white placeholder-gray-700 focus:outline-none focus:border-gold/50 focus:bg-black/60 transition-all font-bold tracking-tight"
                                    placeholder="Entity Identity"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors duration-300">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white placeholder-gray-700 focus:outline-none focus:border-gold/50 focus:bg-black/60 transition-all font-bold tracking-tight"
                                    placeholder="Secure Access Key"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full flex items-center justify-center gap-3 group relative overflow-hidden shadow-2xl shadow-yellow-500/10"
                        >
                            <span className="relative z-10 transition-transform group-hover:translate-x-[-4px] uppercase tracking-[0.2em] font-black">
                                {loading ? 'Authorizing...' : 'Authorize Access'}
                            </span>
                            {!loading && <LogIn size={20} className="relative z-10 transition-transform group-hover:translate-x-2" />}
                        </button>
                    </form>

                    {/* Quick Access Grid */}
                    <div className="mt-12 pt-10 border-t border-white/5">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <span className="h-[1px] w-4 bg-white/5"></span>
                            <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Developer Rapid Link</span>
                            <span className="h-[1px] w-4 bg-white/5"></span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { id: 'refiner', icon: Database, color: 'text-blue-500', name: 'Refiner' },
                                { id: 'craftsman', icon: Activity, color: 'text-purple-400', name: 'Craftsman' },
                                { id: 'jeweller', icon: Tag, color: 'text-gold', name: 'Jeweller' },
                                { id: 'lab', icon: ShieldCheck, color: 'text-green-500', name: 'Audit Lab' },
                                { id: 'admin', icon: Users, color: 'text-red-500', name: 'Network' }
                            ].map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => quickLogin(role.id)}
                                    className="group flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                                >
                                    <role.icon size={20} className={`${role.color} opacity-40 group-hover:opacity-100 transition-opacity mb-2`} />
                                    <span className="text-[9px] font-black text-gray-500 group-hover:text-white transition-colors uppercase tracking-[0.1em]">{role.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <Link to="/verify" className="inline-flex items-center gap-2 text-gold group font-black text-xs uppercase tracking-widest">
                            Public Verification Engine <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                        </Link>
                    </div>
                </div>

                {/* Footer Security Note */}
                <div className="mt-12 text-center space-y-4 opacity-30">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                        <Activity size={14} /> End-to-End Encrypted Node Connection
                    </p>
                    <p className="text-[9px] text-gray-600 max-w-xs mx-auto uppercase leading-loose font-bold tracking-widest">
                        Unauthorized access attempts are cryptographically logged and reported to the system administrator.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SimpleLogin
