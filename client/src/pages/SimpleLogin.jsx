import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSimpleAuth } from '../context/SimpleAuthContext'
import { ShieldCheck, User, Lock, LogIn } from 'lucide-react'

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
            setError(error.message)
            setLoading(false)
            return
        }

        // Redirect based on role
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
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded-lg mb-4">
                        <ShieldCheck className="text-black" size={32} />
                        <span className="font-bold text-2xl text-black tracking-tighter italic">
                            BIT<span className="underline">VERSE</span>
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">Gold Token Traceability System</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800/50 backdrop-blur-lg border border-yellow-500/20 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2">Portal Login</h2>
                    <p className="text-gray-400 text-sm mb-6">Access your role-based dashboard</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span>Logging in...</span>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Login</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Login Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-gray-400 text-xs mb-3 text-center">Quick Login (Dev Mode)</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => quickLogin('refiner')}
                                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 px-3 py-2 rounded-lg text-xs font-medium transition"
                            >
                                🏭 Refiner
                            </button>
                            <button
                                onClick={() => quickLogin('craftsman')}
                                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 px-3 py-2 rounded-lg text-xs font-medium transition"
                            >
                                🔨 Craftsman
                            </button>
                            <button
                                onClick={() => quickLogin('lab')}
                                className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 px-3 py-2 rounded-lg text-xs font-medium transition"
                            >
                                🧪 Lab
                            </button>
                            <button
                                onClick={() => quickLogin('admin')}
                                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-xs font-medium transition"
                            >
                                👑 Admin
                            </button>
                        </div>
                    </div>

                    {/* Public Verify Link */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/verify"
                            className="text-yellow-500 hover:text-yellow-400 text-sm underline"
                        >
                            Or verify a product →
                        </Link>
                    </div>
                </div>

                {/* Info Text */}
                <p className="text-gray-500 text-xs text-center mt-6">
                    Test credentials: username = password (refiner, craftsman, lab, admin)
                </p>
            </div>
        </div>
    )
}

export default SimpleLogin
