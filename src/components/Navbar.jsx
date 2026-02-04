import { ShieldCheck, Menu, UserCircle } from 'lucide-react'

export function Navbar({ onViewChange, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <nav className="glass-panel sticky top-4 mx-4 rounded-2xl z-50 px-6 py-4 flex justify-between items-center mb-8">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewChange('landing')}>
        <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-xl shadow-lg group-hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all">
          <ShieldCheck className="text-black" size={24} />
        </div>
        <span className="font-extrabold text-2xl tracking-tighter italic text-white group-hover:text-gold-400 transition">BIT<span className="text-gradient-gold underline decoration-gold-500/50">VERSE</span></span>
      </div>
      <div className="hidden md:flex gap-8 items-center">
        <button onClick={() => onViewChange('public')} className="text-sm font-medium text-gray-400 hover:text-white hover:scale-105 transition">Public Verify</button>
        <button onClick={() => onViewChange('jeweller')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gold-400 px-6 py-2.5 rounded-full text-sm font-bold transition hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]">
          Jeweller Portal
        </button>
        <button onClick={() => onViewChange('admin')} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"><UserCircle /></button>
      </div>
      <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu /></button>
    </nav>
  )
}
