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
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Current Assets</h3>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-gray-500 group-hover:text-gold-500 transition" size={18} />
          <input
            placeholder="Search ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-rich-black-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition w-64 shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(b => (
          <div key={b.id} className="glass-panel rounded-3xl overflow-hidden group hover:border-gold-500/30 transition duration-500">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-gold-500 tracking-[0.2em] uppercase mb-1 block">Batch ID</span>
                  <h4 className="text-2xl font-black text-white">{b.batch_id}</h4>
                </div>
                <div className="bg-gradient-to-br from-gold-400/10 to-gold-600/10 p-3 rounded-2xl group-hover:scale-110 transition duration-300 border border-gold-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                  <QrCode className="text-gold-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6 relative">
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/5"></div>
                <div className="pb-4"><p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">Weight</p><p className="font-bold text-lg">{b.weight}</p></div>
                <div className="pb-4"><p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">Purity</p><p className="font-bold text-lg">{b.purity}</p></div>
                <div className="pb-4"><p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">Owner</p><p className="font-bold text-xs truncate text-gray-300 bg-white/5 py-1 px-2 rounded-lg">{b.current_owner}</p></div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleTransfer(b.id)}
                  className="flex-1 bg-white text-black text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Transfer <ArrowRight size={14} />
                </button>
                <button className="flex-1 bg-white/5 border border-white/10 text-white text-sm font-bold py-3 rounded-xl hover:bg-white/10 transition hover:border-gold-500/30">
                  History
                </button>
              </div>
            </div>
            <div className="bg-black/40 px-6 py-2 border-t border-white/5 text-[10px] text-gray-500 flex justify-between font-mono">
              <span className="opacity-50">TX_ID: {b.hash}</span>
              <span className="text-green-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> SECURE</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500 glass-panel rounded-3xl border-dashed border-2 border-white/5">
          <p>No batches found matching your search</p>
        </div>
      )}
    </div>
  )
}
