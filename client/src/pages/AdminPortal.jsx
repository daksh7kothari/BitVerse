import { useState, useEffect } from 'react'
import { UserCircle } from 'lucide-react'

export function AdminPortal({ onViewChange }) {
  const [stats, setStats] = useState({ verifiedPartners: 0, totalCerts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch admin stats:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 flex items-center justify-center">
      <div className="text-center space-y-4">
        <UserCircle size={64} className="mx-auto text-yellow-500" />
        <h2 className="text-3xl font-bold">Admin Headquarters</h2>
        <p className="text-gray-400 max-w-md">System-level controls for approving Miners, Refiners, and Jewellers into the BitVerse Trust Network.</p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
            <h4 className="text-2xl font-bold">{loading ? '...' : stats.verifiedPartners}</h4>
            <p className="text-xs text-gray-500 uppercase">Verified Partners</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
            <h4 className="text-2xl font-bold">{loading ? '...' : stats.totalCerts}</h4>
            <p className="text-xs text-gray-500 uppercase">Total Certs Issued</p>
          </div>
        </div>
        <button onClick={() => onViewChange('jeweller')} className="mt-8 text-yellow-500 font-bold hover:underline">Switch to Jeweller View for Operations</button>
      </div>
    </div>
  )
}
