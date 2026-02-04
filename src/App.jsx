import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { LandingView } from './pages/LandingView'
import { PublicVerifyView } from './pages/PublicVerifyView'
import { JewellerPortal } from './pages/JewellerPortal'
import { AdminPortal } from './pages/AdminPortal'

function App() {
  const [view, setView] = useState('landing')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="font-sans bg-black text-white">
      <Navbar
        onViewChange={setView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {view === 'landing' && <LandingView onViewChange={setView} />}
      {view === 'public' && <PublicVerifyView />}
      {view === 'jeweller' && (
        <JewellerPortal
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}
      {view === 'admin' && <AdminPortal onViewChange={setView} />}

      {view !== 'landing' && (
        <footer className="bg-black border-t border-white/5 p-8 text-center text-gray-600 text-xs">
          <p>© 2024 BITVERSE FOUNDATION. ALL TRANSACTIONS RECORDED ON THE SECURE GOLD LEDGER.</p>
        </footer>
      )}
    </div>
  )
}

export default App
