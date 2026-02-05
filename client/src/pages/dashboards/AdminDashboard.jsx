import { useState, useEffect } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import { Settings, Database, Users, BarChart3, ShieldCheck, Activity, Search, Package, Trash2, ClipboardList, TrendingUp, UserCheck, ShieldClose } from 'lucide-react'

export const AdminDashboard = () => {
    const { user } = useSimpleAuth()
    const [stats, setStats] = useState(null)
    const [participants, setParticipants] = useState([])
    const [auditLogs, setAuditLogs] = useState([])
    const [tokens, setTokens] = useState([])
    const [products, setProducts] = useState([])
    const [wastageLogs, setWastageLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('summary') // summary, participants, tokens, products, wastage, audit

    useEffect(() => {
        if (user) {
            fetchAllData()
        }
    }, [user])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const headers = { 'Authorization': `Bearer mock-${user.role}` }

            const [statsRes, partRes, auditRes, tokenRes, prodRes, wasteRes] = await Promise.all([
                fetch('http://localhost:3000/api/admin/stats', { headers }),
                fetch('http://localhost:3000/api/admin/participants', { headers }),
                fetch('http://localhost:3000/api/admin/audit-logs', { headers }),
                fetch('http://localhost:3000/api/admin/tokens', { headers }),
                fetch('http://localhost:3000/api/admin/products', { headers }),
                fetch('http://localhost:3000/api/admin/wastage', { headers })
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (partRes.ok) setParticipants(await partRes.json())
            if (auditRes.ok) setAuditLogs(await auditRes.json())
            if (tokenRes.ok) setTokens(await tokenRes.json())
            if (prodRes.ok) setProducts(await prodRes.json())
            if (wasteRes.ok) setWastageLogs(await wasteRes.json())

        } catch (err) {
            console.error('Admin fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading && !stats) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold shadow-lg shadow-gold/20"></div>
            <div className="text-gold font-black uppercase tracking-widest text-xs">Initializing Secure Admin Core...</div>
        </div>
    )

    const filterData = (data, fields) => {
        return data.filter(item =>
            fields.some(field => {
                const val = field.split('.').reduce((obj, key) => obj?.[key], item)
                return val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            })
        )
    }

    const tabs = [
        { id: 'summary', label: 'Overview', icon: BarChart3 },
        { id: 'participants', label: 'Parties', icon: Users },
        { id: 'tokens', label: 'Tokens', icon: Database },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'wastage', label: 'Wastage', icon: Trash2 },
        { id: 'audit', label: 'Audit Log', icon: Activity },
    ]

    return (
        <div className="animate-slide-up space-y-10 pb-20">
            {/* Header */}
            <header className="relative py-10 px-8 rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-black border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">System <span className="text-gold">Administrator</span></h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                            Full Governance & Supply Chain Insights
                        </p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearchTerm('') }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <tab.icon size={14} />
                                <span className="hidden lg:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Global Search (for current tab) */}
            {activeTab !== 'summary' && (
                <div className="relative group max-w-2xl mx-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white focus:border-gold outline-none shadow-2xl backdrop-blur-xl transition-all font-bold placeholder:text-gray-700"
                    />
                </div>
            )}

            {/* Content Area */}
            <main className="space-y-10">
                {activeTab === 'summary' && (
                    <div className="space-y-12">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Weight', value: stats?.totalGoldWeight + ' g', color: 'text-white', icon: Database },
                                { label: 'Active Tokens', value: stats?.activeTokens, color: 'text-gold', icon: BarChart3 },
                                { label: 'Settled Parties', value: stats?.totalParticipants, color: 'text-blue-500', icon: Users },
                                { label: 'Finished Goods', value: stats?.totalProducts, color: 'text-green-400', icon: ShieldCheck },
                            ].map((s, i) => (
                                <div key={i} className="glass-panel p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><s.icon size={64} /></div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{s.label}</div>
                                    <div className={`text-5xl font-black ${s.color} tracking-tighter`}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Distribution Pie chart or something would go here, using simple lists for now */}
                            <div className="glass-panel p-10 rounded-[3rem] border border-gold/10 bg-gold/[0.02]">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-8 border-l-4 border-gold pl-4">Wastage Standards</h3>
                                <div className="space-y-8">
                                    {Object.entries(stats?.wastageRules || {}).map(([type, val]) => (
                                        <div key={type} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-black uppercase text-gray-400">{type}</span>
                                                <span className="text-xl font-black text-gold">{(val * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div className="h-full bg-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]" style={{ width: `${val * 1000}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel p-10 rounded-[3rem] border border-white/5">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 border-l-4 border-white pl-4">Recent Network Pulses</h3>
                                <div className="space-y-4">
                                    {auditLogs.slice(0, 5).map(log => (
                                        <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white/5 rounded-lg text-gray-500 group-hover:text-gold transition-colors"><Activity size={16} /></div>
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase tracking-tight">{log.user?.name}</div>
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold">{log.action_type}</div>
                                                </div>
                                            </div>
                                            <div className="text-[9px] font-mono text-gray-600">{new Date(log.created_at).toLocaleTimeString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Entity Name</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Protocol Role</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Status / Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filterData(participants, ['name', 'role']).map(v => (
                                    <tr key={v.id} className="hover:bg-white/[0.03] transition duration-200 group">
                                        <td className="px-10 py-8">
                                            <div className="font-black text-white group-hover:text-gold transition-colors uppercase italic tracking-tight text-lg">{v.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono mt-1 opacity-50">{v.id}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${v.role === 'refiner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                v.role === 'craftsman' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                                    v.role === 'jeweller' ? 'bg-gold/10 text-gold border-gold/20' :
                                                        'bg-white/5 text-gray-400 border-white/10'
                                                }`}>
                                                {v.role}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Active
                                            </div>
                                            <div className="text-[10px] text-gray-600 font-mono italic">{new Date(v.created_at).toLocaleDateString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'tokens' && (
                    <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Token ID / Batch</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Weight & Purity</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Custodian</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Lifecycle Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filterData(tokens, ['token_id', 'owner.name', 'status']).map(t => (
                                    <tr key={t.id} className="hover:bg-white/[0.03] transition duration-200 group">
                                        <td className="px-10 py-8">
                                            <div className="font-black text-white uppercase italic tracking-tight group-hover:text-gold transition-colors">{t.token_id}</div>
                                            <div className="text-[9px] text-gray-600 font-mono mt-1">BATCH: {t.batch_id.slice(0, 16)}...</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xl font-black text-white tracking-widest">{t.weight}g</div>
                                            <div className="text-[10px] text-gold font-black uppercase tracking-widest opacity-70">{t.purity} Gold</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xs font-black text-gray-300 uppercase tracking-tight">{t.owner?.name}</div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{t.owner?.role}</div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${t.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                t.status === 'converted_to_product' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-white/5 text-gray-500 border-white/10 opacity-50'
                                                }`}>
                                                {t.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Asset Model / ID</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Metal Specs</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Current Owner</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Cryptographic QR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filterData(products, ['name', 'product_id', 'craftsman.name']).map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.03] transition duration-200 group">
                                        <td className="px-10 py-8">
                                            <div className="font-black text-white text-lg uppercase italic tracking-tight group-hover:text-gold transition-colors">{p.name}</div>
                                            <div className="text-[10px] text-gold font-bold font-mono opacity-50">{p.product_id}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xl font-black text-white tracking-widest">{p.net_gold_weight}g AU</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{p.purity}K • {p.type}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xs font-black text-gray-300 uppercase tracking-tight">{p.craftsman?.name}</div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Master Craftsman</div>
                                        </td>
                                        <td className="px-10 py-8 text-right font-mono text-[9px] text-gray-600 truncate max-w-[150px]">
                                            {p.qr_code}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'wastage' && (
                    <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Operation / Token</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Mass Loss Details</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Responsible Party</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Approval Mandate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filterData(wastageLogs, ['operation_type', 'craftsman.name', 'approval_status']).map(w => (
                                    <tr key={w.id} className="hover:bg-white/[0.03] transition duration-200 group">
                                        <td className="px-10 py-8">
                                            <div className="font-black text-white uppercase italic tracking-tight group-hover:text-red-400 transition-colors">{w.operation_type}</div>
                                            <div className="text-[9px] text-gray-600 font-mono mt-1">TOKEN: {w.token_id?.slice(0, 8)}...</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-lg font-black text-red-400 tracking-widest">{w.wastage_weight}g Loss</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{w.wastage_percentage}% Variation</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xs font-black text-gray-300 uppercase tracking-tight">{w.craftsman?.name}</div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Production Unit</div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${w.approval_status === 'auto_approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                w.approval_status === 'pending_review' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    w.approval_status === 'flagged_for_audit' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-white/5 text-gray-500 border-white/10 opacity-50 font-mono'
                                                }`}>
                                                {w.approval_status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Network Event</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Actuated By</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Resource Interaction</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filterData(auditLogs, ['action_type', 'user.name', 'resource_type']).map(log => (
                                    <tr key={log.id} className="hover:bg-white/[0.03] transition duration-200 group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/5 rounded-xl text-gray-400 group-hover:text-gold transition-colors border border-white/5 shadow-inner shadow-black"><Activity size={18} /></div>
                                                <div className="font-black text-white uppercase italic tracking-tighter text-md">{log.action_type.replace(/_/g, ' ')}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xs font-black text-white uppercase tracking-tight">{log.user?.name}</div>
                                            <div className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mt-1 ${log.user?.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-500'
                                                }`}>{log.user?.role}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{log.resource_type}</div>
                                            <div className="text-[9px] font-mono text-gray-600">{log.resource_id}</div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="font-black text-white text-[10px] uppercase tracking-widest mb-1">{new Date(log.created_at).toLocaleTimeString()}</div>
                                            <div className="text-[10px] text-gray-600 font-bold uppercase">{new Date(log.created_at).toLocaleDateString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    )
}
