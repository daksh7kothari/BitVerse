import { LayoutDashboard, PlusCircle, Coins, Database } from 'lucide-react'
import { ROLES } from '../lib/constants'

export function Sidebar({ role, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-white/10 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out z-40 pt-20 px-4`}>
      <div className="space-y-2">
        <button
          onClick={() => {
            setActiveTab('dashboard')
            setIsSidebarOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'create' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <PlusCircle size={20} /> Birth Certificate
            </button>
            <button
              onClick={() => {
                setActiveTab('my-inventory')
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'my-inventory' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
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
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'ledger' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Database size={20} /> Blockchain Ledger
        </button>
      </div>
    </div>
  )
}
