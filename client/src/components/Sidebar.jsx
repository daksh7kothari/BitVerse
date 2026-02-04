import { LayoutDashboard, PlusCircle, Coins, Database } from 'lucide-react'
import { ROLES } from '../lib/constants'

export function Sidebar({ role, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <div className={`fixed inset-y-4 left-4 w-64 glass-panel rounded-3xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'} md:translate-x-0 transition-transform duration-300 ease-out z-40 p-6 flex flex-col`}>
      <div className="space-y-3 mt-12">
        <button
          onClick={() => {
            setActiveTab('dashboard')
            setIsSidebarOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-yellow-500 text-black font-bold shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        {role === ROLES.JEWELLER && (
          <>
            <button
              onClick={() => {
                setActiveTab('create')
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === 'create' ? 'bg-yellow-500 text-black font-bold shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <PlusCircle size={20} /> Birth Certificate
            </button>
            <button
              onClick={() => {
                setActiveTab('my-inventory')
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === 'my-inventory' ? 'bg-yellow-500 text-black font-bold shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Coins size={20} /> My Inventory
            </button>
          </>
        )}
        <button
          onClick={() => {
            setActiveTab('ledger')
            setIsSidebarOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === 'ledger' ? 'bg-yellow-500 text-black font-bold shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <Database size={20} /> Blockchain Ledger
        </button>
      </div>
    </div>
  )
}
