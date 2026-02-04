import { ShieldCheck } from 'lucide-react'
import { INITIAL_OWNER } from '../../lib/constants'

export function DashboardTab({ batches }) {
  const userBatches = batches.filter(b => b.current_owner === INITIAL_OWNER)
  const totalWeight = userBatches.reduce((sum, b) => sum + parseFloat(b.weight.replace('g', '')) || 0, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl group hover:border-gold-500/30 transition duration-300">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Assets</p>
          <h4 className="text-4xl font-black mt-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{userBatches.length} <span className="text-lg text-gray-500 font-normal">Units</span></h4>
        </div>
        <div className="glass-panel p-6 rounded-3xl group hover:border-gold-500/30 transition duration-300">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Certified Weight</p>
          <h4 className="text-4xl font-black mt-2 text-yellow-500">{(totalWeight / 1000).toFixed(2)} <span className="text-lg text-gray-500 font-normal">Kg</span></h4>
        </div>
        <div className="glass-panel p-6 rounded-3xl group hover:border-gold-500/30 transition duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={64} /></div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending Transfers</p>
          <h4 className="text-4xl font-black mt-2 text-white">2 <span className="text-lg text-gray-500 font-normal">Actions</span></h4>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-[2rem]">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gold-500 rounded-full"></span>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {batches.slice(0, 3).map((b, i) => (
            <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition duration-300 hover:border-gold-500/20 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-400/10 to-gold-600/10 rounded-xl flex items-center justify-center text-gold-500 group-hover:scale-110 transition">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-gold-400 transition">{b.batch_id}</p>
                  <p className="text-xs text-gray-500">{b.weight} • {b.purity}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${b.status === 'Created' ? 'bg-green-500/10 text-green-500' : 'bg-gold-500/10 text-gold-500'}`}>
                  {b.status}
                </span>
                <p className="text-[10px] text-gray-600 mt-1 font-mono">{b.created_at?.split('T')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
