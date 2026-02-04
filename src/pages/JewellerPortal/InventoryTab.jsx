import { Search, QrCode, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { INITIAL_OWNER } from '../../lib/constants'

export function InventoryTab({ batches, onTransfer }) {
  const [searchTerm, setSearchTerm] = useState('')
  const userBatches = batches.filter(b => b.current_owner === INITIAL_OWNER)
  const filtered = userBatches.filter(b => b.batch_id.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleTransfer = (batchId) => {
    const recipient = prompt("Enter Recipient Name (Customer or Jeweller):")
    if (recipient) {
      onTransfer(batchId, recipient)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Current Assets</h3>
        <div className="relative">
           <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
           <input
             placeholder="Search ID..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-yellow-500 transition"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(b => (
          <div key={b.id} className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-yellow-500 tracking-widest uppercase">Batch ID</span>
                  <h4 className="text-2xl font-black">{b.batch_id}</h4>
                </div>
                <div className="bg-yellow-500/10 p-3 rounded-2xl group-hover:scale-110 transition duration-300">
                  <QrCode className="text-yellow-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div><p className="text-[10px] uppercase text-gray-500">Weight</p><p className="font-bold">{b.weight}</p></div>
                <div><p className="text-[10px] uppercase text-gray-500">Purity</p><p className="font-bold">{b.purity}</p></div>
                <div><p className="text-[10px] uppercase text-gray-500">Owner</p><p className="font-bold text-xs truncate">{b.current_owner}</p></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTransfer(b.id)}
                  className="flex-1 bg-white text-black text-sm font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200"
                >
                  Transfer <ArrowRight size={14} />
                </button>
                <button className="flex-1 bg-zinc-800 text-white text-sm font-bold py-2 rounded-xl hover:bg-zinc-700">
                  History
                </button>
              </div>
            </div>
            <div className="bg-black/40 px-6 py-2 border-t border-white/5 text-[10px] text-gray-500 flex justify-between font-mono">
              <span>TX_ID: {b.hash}</span>
              <span>SECURE</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No batches found matching your search</p>
        </div>
      )}
    </div>
  )
}
