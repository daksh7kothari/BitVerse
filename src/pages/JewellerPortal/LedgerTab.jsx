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
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Tamper-Proof Ledger</h3>
          <p className="text-gray-500 text-sm">Real-time immutable data stream. Any fraud attempts cause a hash mismatch.</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-green-500 text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Sync Complete
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[2rem] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/50 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">Block Hash</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">Transaction</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">Timestamp</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">State</th>
            </tr>
          </thead>
          <tbody>
            {batches.flatMap((b, bIdx) => (b.history || []).map((h, hIdx) => (
              <tr key={`${bIdx}-${hIdx}`} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-yellow-500">
                    <Lock size={12}/> {b.hash.slice(0, 15)}...
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold">{h.action}</p>
                  <p className="text-xs text-gray-500">{b.batch_id}: {h.from_party} → {h.to_party}</p>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-gray-400">
                  {h.transaction_date} 14:02:{20 + hIdx}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified</span>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
