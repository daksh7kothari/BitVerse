import { UserCircle } from 'lucide-react'

export function AdminPortal({ onViewChange }) {
  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 flex items-center justify-center">
      <div className="text-center space-y-4">
        <UserCircle size={64} className="mx-auto text-yellow-500" />
        <h2 className="text-3xl font-bold">Admin Headquarters</h2>
        <p className="text-gray-400 max-w-md">System-level controls for approving Miners, Refiners, and Jewellers into the BitVerse Trust Network.</p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
             <h4 className="text-2xl font-bold">14</h4>
             <p className="text-xs text-gray-500 uppercase">Verified Partners</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
             <h4 className="text-2xl font-bold">1,023</h4>
             <p className="text-xs text-gray-500 uppercase">Total Certs Issued</p>
          </div>
        </div>
        <button onClick={() => onViewChange('jeweller')} className="mt-8 text-yellow-500 font-bold hover:underline">Switch to Jeweller View for Operations</button>
      </div>
    </div>
  )
}
