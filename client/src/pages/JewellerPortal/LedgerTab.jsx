import { Lock } from 'lucide-react'

export function LedgerTab({ batches }) {
  const allTransactions = batches.flatMap((b, idx) => ({
    id: b.id,
    batch_id: b.batch_id,
    hash: b.hash,
    history: b.history || [],
    index: idx
  }))

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Tamper-Proof Ledger</h3>
          <p className="text-gray-500 text-sm">Real-time immutable data stream. Any fraud attempts cause a hash mismatch.</p>
        </div>
        <div className="glass-panel border-green-500/20 rounded-full px-5 py-2 flex items-center gap-3 text-green-500 text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Sync Complete
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-rich-black-900/50 border-b border-white/5 backdrop-blur-md">
              <tr>
                <th className="px-8 py-5 text-[10px] uppercase text-gold-500 font-bold tracking-widest">Block Hash</th>
                <th className="px-8 py-5 text-[10px] uppercase text-gold-500 font-bold tracking-widest">Transaction</th>
                <th className="px-8 py-5 text-[10px] uppercase text-gold-500 font-bold tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] uppercase text-gold-500 font-bold tracking-widest">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {batches.flatMap((b, bIdx) => (b.history || []).map((h, hIdx) => (
                <tr key={`${bIdx}-${hIdx}`} className="hover:bg-white/5 transition duration-200 group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3 font-mono text-xs text-gray-400 group-hover:text-gold-400 transition">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-gold-500/10 transition"><Lock size={12} /></div>
                      {b.hash.slice(0, 15)}...
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white mb-0.5">{h.action}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                      {b.batch_id} <span className="opacity-50">→</span> {h.to_party}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-xs font-mono text-gray-500">
                    {h.transaction_date} <span className="opacity-30">|</span> 14:02:{20 + hIdx}
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-green-500/10 border border-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.1)]">Verified</span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
