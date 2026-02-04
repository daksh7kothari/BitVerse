import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { ShieldCheck, Menu, UserCircle } from 'lucide-react'
import { useState } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { PublicVerifyView } from './pages/PublicVerifyView'
import { JewellerPortal } from './pages/JewellerPortal'
import { AdminPortal } from './pages/AdminPortal'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center border-b border-yellow-500/30 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <div className="bg-yellow-500 p-1.5 rounded-lg">
          <ShieldCheck className="text-black" size={24} />
        </div>
        <span className="font-bold text-xl tracking-tighter italic">BIT<span className="text-yellow-500 underline">VERSE</span></span>
      </Link>
      <div className="hidden md:flex gap-6 items-center">
        <Link to="/verify" className="text-sm hover:text-yellow-500 transition">Public Verify</Link>
        <Link to="/dashboard" className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-yellow-400 transition">
          Jeweller Portal
        </Link>
        <Link to="/admin" className="text-gray-400 hover:text-white"><UserCircle /></Link>
      </div>
      <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu /></button>
    </nav>
  )
}

const App = () => {
  return (
    <Router>
      <div className="font-sans bg-black min-h-screen text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<PublicVerifyView />} />
          <Route path="/dashboard" element={<JewellerPortal isSidebarOpen={false} setIsSidebarOpen={() => { }} />} />
          <Route path="/admin" element={<AdminPortal onViewChange={() => { }} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
