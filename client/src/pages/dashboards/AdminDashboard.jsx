import { useState, useEffect } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import { Settings, Database, Users, BarChart3, ShieldCheck, Activity, Search } from 'lucide-react'

export const AdminDashboard = () => {
    const { user } = useSimpleAuth()
    const [stats, setStats] = useState(null)
    const [participants, setParticipants] = useState([])
    const [auditLogs, setAuditLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user) {
            fetchAllData()
        }
    }, [user])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const headers = { 'Authorization': `Bearer mock-${user.role}` }

            const [statsRes, partRes, auditRes] = await Promise.all([
                fetch('http://localhost:3000/api/admin/stats', { headers }),
                fetch('http://localhost:3000/api/admin/participants', { headers }),
                fetch('http://localhost:3000/api/admin/audit-logs', { headers })
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (partRes.ok) setParticipants(await partRes.json())
            if (auditRes.ok) setAuditLogs(await auditRes.json())

        } catch (err) {
            console.error('Admin fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading && !stats) return <div className="text-center py-20 animate-pulse text-gold font-bold">Initializing Administrative Secure Core...</div>

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="animate-slide-up space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">System <span className="text-gold">Administrator</span></h1>
                    <p className="text-gray-400">Total gold platform oversight and governance</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchAllData} className="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition glass-panel">
                        <Activity className="text-gold" size={20} />
                    </button>
                </div>
            </header>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Database size={64} />
                    </div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Minted</div>
                    <div className="text-4xl font-black text-white leading-none">{stats?.totalGoldWeight} <span className="text-sm font-normal text-gray-400">g</span></div>
                    <div className="mt-4 flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                        <ShieldCheck size={12} /> Verified Inventory
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 size={64} />
                    </div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Active Tokens</div>
                    <div className="text-4xl font-black text-yellow-500 leading-none">{stats?.activeTokens}</div>
                    <div className="mt-4 text-[10px] text-gray-500 font-bold uppercase">Ready for manufacturing</div>
                </div>

                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} />
                    </div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Network Parties</div>
                    <div className="text-4xl font-black text-blue-500 leading-none">{stats?.totalParticipants}</div>
                    <div className="mt-4 text-[10px] text-gray-500 font-bold uppercase">Decentralized Participants</div>
                </div>

                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border-gold/20 shadow-gold/5 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-gold">
                        <ShieldCheck size={64} />
                    </div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Finished Goods</div>
                    <div className="text-4xl font-black text-green-400 leading-none">{stats?.totalProducts}</div>
                    <div className="mt-4 text-[10px] text-gray-500 font-bold uppercase">Verified Creations</div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Participant Management */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-3"><Users className="text-blue-500" /> Trust Network</h2>
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text" placeholder="Search parties..."
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none transition"
                            />
                        </div>
                    </div>
                    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-500">Managing Entity</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-500">System Role</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-500 text-right">Permissions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredParticipants.map(v => (
                                    <tr key={v.id} className="hover:bg-white/5 transition duration-200 group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{v.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{v.id.slice(0, 18)}...</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${v.role === 'refiner' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    v.role === 'craftsman' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                                        v.role === 'lab' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {v.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[10px] font-mono text-gray-500">{v.permissions?.length || 0} Core Privileges</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Settings & Thresholds */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3"><Settings className="text-yellow-500" /> Governance</h2>
                    <div className="glass-panel p-8 rounded-[2rem] border border-yellow-500/20 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm text-yellow-500">Wastage Thresholds</h3>
                        <div className="space-y-6">
                            {['Casting', 'Handmade', 'Filigree'].map((type, i) => (
                                <div key={type} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-white font-bold">{type}</span>
                                        <span className="text-yellow-500 font-mono font-bold">{i === 0 ? '2.0' : i === 1 ? '5.0' : '10.0'}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-700 to-yellow-400 rounded-full"
                                            style={{ width: `${i === 0 ? 20 : i === 1 ? 50 : 80}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition transition-transform active:scale-95 shadow-lg shadow-yellow-500/20">
                            Update Policy
                        </button>
                        <p className="mt-6 text-[10px] text-gray-500 text-center uppercase font-bold tracking-widest leading-relaxed">
                            Updating thresholds will require multi-sig Lab approval for active batches.
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Activity Feed */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3"><Activity className="text-orange-500" /> Audit Stream</h2>
                <div className="glass-panel rounded-[2rem] overflow-hidden border border-orange-500/10">
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                        {auditLogs.length === 0 ? (
                            <div className="p-20 text-center text-gray-500 italic uppercase font-bold tracking-widest opacity-50">Secure stream initializing...</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="p-6 hover:bg-white/5 transition flex justify-between items-center group">
                                        <div className="flex gap-6 items-center">
                                            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 text-orange-500">
                                                <Activity size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-white uppercase group-hover:text-orange-400 transition-colors uppercase">{log.user?.name || 'System Agent'}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-500 rounded font-mono uppercase italic">{log.action}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">Resource ID: <span className="text-gray-400 font-mono">{log.resource_id}</span></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</div>
                                            <div className="text-[10px] text-gray-600 uppercase font-bold">{new Date(log.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
