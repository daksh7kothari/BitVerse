import { ShieldCheck } from 'lucide-react'
import { INITIAL_OWNER } from '../../lib/constants'

export function DashboardTab({ batches }) {
  const userBatches = batches.filter(b => b.current_owner === INITIAL_OWNER)
  const totalWeight = userBatches.reduce((sum, b) => sum + parseFloat(b.weight.replace('g', '')) || 0, 0)

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
          <p className="text-gray-400 text-sm">Total Assets</p>
          <h4 className="text-3xl font-bold">{userBatches.length} Units</h4>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
          <p className="text-gray-400 text-sm">Certified Weight</p>
          <h4 className="text-3xl font-bold">{(totalWeight / 1000).toFixed(2)} Kg</h4>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
          <p className="text-gray-400 text-sm">Pending Transfers</p>
          <h4 className="text-3xl font-bold text-yellow-500">2 Actions</h4>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
        <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {batches.slice(0, 3).map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                  <ShieldCheck />
                </div>
                <div>
                  <p className="font-bold">{b.batch_id}</p>
                  <p className="text-xs text-gray-500">{b.weight} • {b.purity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{b.status}</p>
                <p className="text-xs text-gray-500">{b.created_at?.split('T')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
