import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck } from 'lucide-react'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()
    const useNavigateRef = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setError('')
            setLoading(true)
            const { error } = await signUp(email, password, fullName)
            if (error) throw error
            // Redirect or show success
            useNavigateRef('/login')
            alert('Account created! Please sign in.')
        } catch (err) {
            setError('Failed to create account: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl border border-white/5">
                <div className="text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-yellow-500" />
                    <h2 className="mt-6 text-3xl font-bold">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-400">Join the BitVerse Trust Network</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm text-center">{error}</div>}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Business / Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-black border-t-0 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-sm text-yellow-500 hover:text-yellow-400">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Signup
