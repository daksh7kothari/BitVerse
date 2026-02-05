import { useState, useEffect } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import {
    Settings, Database, Users, BarChart3, ShieldCheck, Activity, Search,
    Package, Trash2, ClipboardList, TrendingUp, UserCheck, ShieldAlert,
    Cpu, Globe, Lock, Zap, LayoutDashboard, DatabaseBackup, Info
} from 'lucide-react'

const StatCard = ({ label, value, color, icon: Icon, delay }) => (
    <div className={`glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden animate-slide-up bg-white/[0.02] hover:bg-white/[0.05]`} style={{ animationDelay: `${delay}ms` }}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-110 transition-all duration-700">
            <Icon size={120} />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-black/40 border border-white/5 ${color.replace('text', 'text')}`}>
                    <Icon size={18} />
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] font-mono">{label}</span>
            </div>

            <div className={`text-5xl font-black ${color} tracking-tighter mb-2 group-hover:translate-x-1 transition-transform duration-500`}>
                {value || '0'}
            </div>

            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                <TrendingUp size={10} className="text-green-500" />
                <span>Live Blockchain Sync</span>
            </div>
        </div>
    </div>
)

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
    const [activeTab, setActiveTab] = useState('overview')

    // Database Explorer State
    const [tables, setTables] = useState([])
    const [selectedTable, setSelectedTable] = useState('participants')
    const [rawTableData, setRawTableData] = useState([])
    const [tableLoading, setTableLoading] = useState(false)

    useEffect(() => {
        if (user) {
            fetchAllData()
        }
    }, [user])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const headers = { 'Authorization': `Bearer mock-${user.role}` }

            const [statsRes, partRes, auditRes, tokenRes, prodRes, wasteRes, tablesRes] = await Promise.all([
                fetch('http://localhost:3000/api/admin/stats', { headers }),
                fetch('http://localhost:3000/api/admin/participants', { headers }),
                fetch('http://localhost:3000/api/admin/audit-logs', { headers }),
                fetch('http://localhost:3000/api/admin/tokens', { headers }),
                fetch('http://localhost:3000/api/admin/products', { headers }),
                fetch('http://localhost:3000/api/admin/wastage', { headers }),
                fetch('http://localhost:3000/api/admin/db/tables', { headers })
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (partRes.ok) setParticipants(await partRes.json())
            if (auditRes.ok) setAuditLogs(await auditRes.json())
            if (tokenRes.ok) setTokens(await tokenRes.json())
            if (prodRes.ok) setProducts(await prodRes.json())
            if (wasteRes.ok) setWastageLogs(await wasteRes.json())
            if (tablesRes.ok) setTables(await tablesRes.json())

            // Initial table fetch
            selectAndFetchTable('participants')

        } catch (err) {
            console.error('Admin fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const selectAndFetchTable = async (tableName) => {
        setSelectedTable(tableName)
        setTableLoading(true)
        try {
            const headers = { 'Authorization': `Bearer mock-${user.role}` }
            const res = await fetch(`http://localhost:3000/api/admin/db/raw/${tableName}`, { headers })
            if (res.ok) {
                setRawTableData(await res.json())
            }
        } catch (err) {
            console.error('Table fetch error:', err)
        } finally {
            setTableLoading(false)
        }
    }

    const filterData = (data, fields) => {
        if (!data) return []
        return data.filter(item =>
            fields.some(field => {
                const val = field.split('.').reduce((obj, key) => obj?.[key], item)
                return val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            })
        )
    }

    if (loading && !stats) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <div className="animate-ping absolute inset-0 rounded-full h-24 w-24 border-2 border-gold opacity-20"></div>
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-gold shadow-[0_0_50px_rgba(212,175,55,0.3)]"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="text-gold font-black uppercase tracking-[0.5em] text-sm animate-pulse">Establishing Governance Link</div>
                <div className="text-gray-600 text-[10px] font-mono uppercase tracking-widest">Protocol Version v1.0.42</div>
            </div>
        </div>
    )

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'parties', label: 'Entities', icon: Users },
        { id: 'ledger', label: 'Token Ledger', icon: Database },
        { id: 'shipping', label: 'Finished Goods', icon: Package },
        { id: 'compliance', label: 'Wastage', icon: Trash2 },
        { id: 'terminal', label: 'Database', icon: Cpu },
    ]

    return (
        <div className="min-h-screen bg-black text-white selection:bg-gold/30">
            {/* New Premium Header */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div className="animate-slide-up">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
                                <ShieldCheck className="text-gold" size={24} />
                            </div>
                            <div className="h-[2px] w-12 bg-gold/30"></div>
                            <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">System Governance</span>
                        </div>
                        <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-[0.9]">
                            Central <br />
                            <span className="text-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">Administrator</span>
                        </h1>
                        <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-[11px] max-w-md leading-relaxed">
                            Orchestrating the global gold supply chain with cryptographic transparency and real-time ledger audits.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-end gap-2 p-2 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl animate-fade-in shadow-gold/5 max-w-full overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearchTerm('') }}
                                className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${activeTab === tab.id ? 'bg-gradient-to-r from-gold to-yellow-600 text-black shadow-[0_0_50px_rgba(212,175,55,0.4)] scale-[1.05]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <tab.icon size={16} className={activeTab === tab.id ? 'text-black' : 'text-gold'} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-Header Search */}
                {activeTab !== 'overview' && activeTab !== 'terminal' && (
                    <div className="relative group mb-12 animate-fade-in">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors duration-500" size={24} />
                        <input
                            type="text"
                            placeholder={`Filter ${activeTab} records...`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] pl-20 pr-10 py-7 text-white focus:border-gold/50 outline-none shadow-2xl backdrop-blur-xl transition-all duration-500 font-bold placeholder:text-gray-700 text-lg hover:bg-white/[0.05]"
                        />
                    </div>
                )}

                {/* Content Renderers */}
                <main className="space-y-12">
                    {activeTab === 'overview' && (
                        <div className="space-y-16 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <StatCard label="Circulating Mass" value={`${stats?.totalGoldWeight || '0'}g`} color="text-white" icon={Database} delay={100} />
                                <StatCard label="Verified Tokens" value={stats?.activeTokens} color="text-gold" icon={Zap} delay={200} />
                                <StatCard label="Authorized Entities" value={stats?.totalParticipants} color="text-emerald-400" icon={Users} delay={300} />
                                <StatCard label="Market Assets" value={stats?.totalProducts} color="text-blue-400" icon={Package} delay={400} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 glass-panel p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01]">
                                    <div className="flex items-center justify-between mb-12">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                                            <Activity className="text-gold" /> Recent Network Activity
                                        </h3>
                                        <button className="text-[10px] font-black text-gold uppercase tracking-[0.2em] hover:underline">Full Log Viewer</button>
                                    </div>
                                    <div className="space-y-6">
                                        {auditLogs.slice(0, 8).map((log, i) => (
                                            <div key={log.id} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 group hover:border-gold/20 hover:bg-gold/[0.02] transition-all duration-500 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-gray-500 group-hover:text-gold transition-colors shadow-inner border border-white/5">
                                                        {i % 2 === 0 ? <Lock size={20} /> : <Zap size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-gold transition-colors">{log.user?.name}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1 opacity-70">{log.action_type.replace(/_/g, ' ')}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-mono text-gray-500 group-hover:text-white transition-colors">{new Date(log.created_at).toLocaleTimeString()}</div>
                                                    <div className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter mt-1">{log.resource_type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-panel p-12 rounded-[3.5rem] border border-gold/10 bg-gold/[0.02] relative overflow-hidden h-fit">
                                    <div className="absolute -bottom-10 -right-10 opacity-5 text-gold"><Settings size={200} /></div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                                        <Info className="text-gold" /> Wastage Tolerance
                                    </h3>
                                    <div className="space-y-10">
                                        {Object.entries(stats?.wastageRules || {}).map(([type, val], i) => (
                                            <div key={type} className="space-y-4 animate-slide-up" style={{ animationDelay: `${500 + (i * 100)}ms` }}>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs font-black uppercase text-gold/70 tracking-widest font-mono">{type}</span>
                                                    <span className="text-2xl font-black text-white italic">{(val * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                    <div className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full shadow-[0_0_20px_rgba(212,175,55,0.6)]" style={{ width: `${val * 1000}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-14 p-6 bg-black/40 rounded-3xl border border-white/5 text-[10px] text-gray-500 font-bold leading-relaxed italic uppercase tracking-wider">
                                        * Thresholds are cryptographic constants enforced at the protocol level.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'parties' && (
                        <div className="glass-panel rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl animate-scale-in bg-white/[0.01]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono">Registry ID</th>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono">Entity Designation</th>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono">Governance Role</th>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono text-right">Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filterData(participants, ['name', 'role', 'id']).map(v => (
                                        <tr key={v.id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                                            <td className="px-12 py-10">
                                                <div className="text-[10px] text-gray-600 font-black font-mono tracking-tighter uppercase opacity-50 group-hover:opacity-100 transition-opacity"># {v.id}</div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="font-black text-2xl text-white group-hover:text-gold transition-colors uppercase italic tracking-tighter">{v.name}</div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">Verified Blockchain Node</div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border shadow-2xl ${v.role === 'refiner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5' :
                                                    v.role === 'craftsman' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-purple-500/5' :
                                                        v.role === 'jeweller' ? 'bg-gold/10 text-gold border-gold/20 shadow-gold-500/5' :
                                                            'bg-white/5 text-gray-400 border-white/10'
                                                    }`}>
                                                    {v.role}
                                                </span>
                                            </td>
                                            <td className="px-12 py-10 text-right">
                                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                                    Active Authorized
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'ledger' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                            {filterData(tokens, ['token_id', 'owner.name', 'status']).map((t, i) => (
                                <div key={t.id} className="glass-panel p-10 rounded-[3rem] border border-white/5 hover:border-gold/20 transition-all duration-500 group relative overflow-hidden bg-white/[0.01]" style={{ animationDelay: `${i * 30}ms` }}>
                                    <div className="absolute top-0 right-0 p-8 opacity-5 text-gold"><Database size={80} /></div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <div className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-2 font-mono">Token ID</div>
                                            <div className="text-2xl font-black text-white tracking-widest group-hover:text-gold transition-colors italic">{t.token_id}</div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-600 border-white/10'}`}>{t.status}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8 pt-6 border-t border-white/5">
                                        <div>
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Audit Mass</div>
                                            <div className="text-2xl font-black text-white italic">{t.weight}g</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Metal Purity</div>
                                            <div className="text-2xl font-black text-gold">{t.purity} Gold</div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 group-hover:border-gold/30 transition-all duration-500">
                                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-2"><UserCheck size={10} /> Custodian Designate</div>
                                        <div className="text-sm font-black text-white uppercase group-hover:text-gold transition-colors">{t.owner?.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
                            {filterData(products, ['name', 'product_id', 'craftsman.name']).map((p, i) => (
                                <div key={p.id} className="glass-panel group p-10 rounded-[3.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 flex flex-col md:flex-row gap-10 items-center overflow-hidden h-fit" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="w-48 h-48 rounded-[2.5rem] bg-black border border-white/10 flex items-center justify-center text-8xl shadow-2xl relative overflow-hidden group-hover:rotate-3 group-hover:scale-105 transition-all duration-700">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent opacity-50"></div>
                                        {p.type === 'ring' ? '💍' : p.type === 'necklace' ? '📿' : '💎'}
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-gold transition-colors">{p.name}</div>
                                                <div className="text-[10px] text-gold font-black font-mono tracking-[0.2em] mt-2 opacity-50 px-2 py-1 bg-gold/10 inline-block rounded-lg border border-gold/10"># {p.product_id}</div>
                                            </div>
                                            <Package size={32} className="text-gray-800 group-hover:text-gold transition-colors" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                                <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Net Gold</div>
                                                <div className="text-lg font-black text-white">{p.net_gold_weight}g</div>
                                            </div>
                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                                <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Certification</div>
                                                <div className="text-lg font-black text-gold">{p.purity}K GLP</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] font-black uppercase font-mono text-gray-500 overflow-hidden bg-white/5 p-4 rounded-2xl border border-dashed border-white/10">
                                            <span className="text-[9px] tracking-widest opacity-50 mr-4">QR_CODE</span>
                                            <span className="truncate group-hover:text-gold transition-colors">{p.qr_code}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'compliance' && (
                        <div className="glass-panel rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl animate-fade-in bg-white/[0.01]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono whitespace-nowrap">Production Incident</th>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono whitespace-nowrap">Mass Variation</th>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono whitespace-nowrap">Responsible Operative</th>
                                        <th className="px-12 py-10 text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] font-mono text-right whitespace-nowrap">Verification Outcome</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filterData(wastageLogs, ['operation_type', 'craftsman.name', 'approval_status']).map(w => (
                                        <tr key={w.id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                                            <td className="px-12 py-10">
                                                <div className="font-black text-xl text-white uppercase italic tracking-tighter group-hover:text-red-400 transition-colors">{w.operation_type} Process</div>
                                                <div className="text-[9px] text-gray-600 font-black font-mono mt-3 opacity-50 uppercase tracking-widest italic group-hover:opacity-100 transition-opacity">Protocol Source: {w.token_id || 'INTERNAL'}</div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="text-3xl font-black text-red-400 tracking-tighter italic">-{w.wastage_weight}g</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{w.wastage_percentage}% Material Loss</div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="text-sm font-black text-white uppercase group-hover:text-gold transition-colors tracking-tight">{w.craftsman?.name}</div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">Gold Casting Unit 01</div>
                                            </td>
                                            <td className="px-12 py-10 text-right">
                                                <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl inline-block ${w.approval_status === 'auto_approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' :
                                                    w.approval_status === 'pending_review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5'
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

                    {activeTab === 'terminal' && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 animate-fade-in">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="glass-panel p-10 rounded-[3rem] border border-white/5 bg-black">
                                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                                        <div className="p-3 bg-gold/10 rounded-2xl text-gold border border-gold/20"><DatabaseBackup size={20} /></div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Core Protocol</h3>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Physical Ledger Schema</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {tables.map(t => (
                                            <button
                                                key={t.name}
                                                onClick={() => selectAndFetchTable(t.name)}
                                                className={`w-full text-left px-7 py-5 rounded-[1.8rem] transition-all duration-500 group relative border ${selectedTable === t.name ? 'bg-gold/10 border-gold/40 shadow-2xl scale-[1.02]' : 'hover:bg-white/[0.03] border-transparent hover:border-white/10'}`}
                                            >
                                                {selectedTable === t.name && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gold rounded-r-full shadow-[0_0_15px_rgba(212,175,55,1)]"></div>}
                                                <div className={`text-[12px] font-black uppercase tracking-widest font-mono italic ${selectedTable === t.name ? 'text-gold' : 'text-gray-500 group-hover:text-white'}`}>{t.name}</div>
                                                <div className="text-[9px] text-gray-700 font-bold mt-1.5 truncate group-hover:text-gray-500 transition-colors uppercase">{t.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <div className="glass-panel rounded-[3.5rem] border border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-[#050510] relative min-h-[600px]">
                                    {/* Console Header */}
                                    <div className="bg-white/5 px-10 py-6 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                                        </div>
                                        <div className="text-[10px] font-black font-mono text-gray-600 tracking-[0.5em] uppercase italic">Table Explorer: <span className="text-gold opacity-100">{selectedTable}</span></div>
                                        <div className="w-20"></div>
                                    </div>

                                    {tableLoading ? (
                                        <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
                                            <div className="relative">
                                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-gold shadow-[0_0_40px_rgba(212,175,55,0.4)]"></div>
                                                <div className="absolute inset-0 flex items-center justify-center text-gold font-black italic text-xs">GOV</div>
                                            </div>
                                            <div className="text-[10px] text-gold font-black tracking-widest uppercase animate-pulse">Querying Decentralized Ledger...</div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto p-4 custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gold/10">
                                                        {rawTableData.length > 0 && Object.keys(rawTableData[0]).map(key => (
                                                            <th key={key} className="px-8 py-5 text-[10px] font-black uppercase text-gold/30 tracking-widest font-mono whitespace-nowrap bg-gold/[0.02]">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.02]">
                                                    {rawTableData.map((row, i) => (
                                                        <tr key={i} className="hover:bg-gold/[0.03] transition-all duration-300">
                                                            {Object.entries(row).map(([key, val], j) => (
                                                                <td key={j} className={`px-8 py-6 text-[11px] font-mono tracking-tight whitespace-nowrap ${key.includes('id') ? 'text-blue-400 opacity-70' :
                                                                    key.includes('weight') ? 'text-white font-black italic' :
                                                                        'text-gray-400'
                                                                    }`}>
                                                                    {typeof val === 'object' && val !== null ?
                                                                        <span className="text-[9px] text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded italic">{JSON.stringify(val).slice(0, 50)}...</span> :
                                                                        String(val)
                                                                    }
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                    {rawTableData.length === 0 && (
                                                        <tr>
                                                            <td className="px-10 py-32 text-center text-gray-700 font-black uppercase tracking-[0.5em] text-xs italic">Encrypted Metadata Segment Empty</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Global Footer Meta */}
            <footer className="max-w-7xl mx-auto px-6 py-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-30 group hover:opacity-100 transition-opacity duration-1000">
                <div className="flex items-center gap-6">
                    <Globe size={40} className="text-gray-600 group-hover:text-gold transition-colors duration-1000" />
                    <div>
                        <div className="text-sm font-black uppercase tracking-tighter text-white italic">BitVerse Global Governance</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 mt-1 italic">Authorized Ledger Synchronization Module</div>
                    </div>
                </div>
                <div className="flex gap-12">
                    <div className="text-center">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Latency</div>
                        <div className="text-xs font-mono font-black text-gold mt-1">12ms response</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol</div>
                        <div className="text-xs font-mono font-black text-white mt-1 uppercase italic">GLP-42 V3</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
