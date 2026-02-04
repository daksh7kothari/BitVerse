import { ShieldCheck, Menu, UserCircle } from 'lucide-react'

export function Navbar({ onViewChange, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center border-b border-yellow-500/30 sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('landing')}>
        <div className="bg-yellow-500 p-1.5 rounded-lg">
          <ShieldCheck className="text-black" size={24} />
        </div>
        <span className="font-bold text-xl tracking-tighter italic">BIT<span className="text-yellow-500 underline">VERSE</span></span>
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <button onClick={() => onViewChange('public')} className="text-sm hover:text-yellow-500 transition">Public Verify</button>
        <button onClick={() => onViewChange('jeweller')} className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-400 transition">
          Jeweller Portal
        </button>
        <button onClick={() => onViewChange('admin')} className="text-gray-400 hover:text-white"><UserCircle /></button>
      </div>
      <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu /></button>
    </nav>
  )
}
