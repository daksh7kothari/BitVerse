import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertTriangle, ShieldCheck, Activity, Search, XCircle, Check, ArrowRight } from 'lucide-react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'

export const LabDashboard = () => {
    const { user } = useSimpleAuth()
    const [allLogs, setAllLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    useEffect(() => {
        if (user) {
            fetchWastageLogs()
        }
    }, [user])

    const fetchWastageLogs = async () => {
        setLoading(true)
        try {
            const response = await fetch('http://localhost:3000/api/wastage/logs', {
                headers: { 'Authorization': `Bearer mock-${user.role}` }
            })
            if (response.ok) {
                const data = await response.json()
                setAllLogs(data)
            }
        } catch (err) {
            console.error('Failed to fetch wastage logs:', err)
            setError('System link failure: Unable to retrieve audit logs.')
        } finally {
            setLoading(false)
        }
    }

    const handleApproval = async (id, approved) => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`http://localhost:3000/api/wastage/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user.role}`
                },
                body: JSON.stringify({ approved, approval_notes: approved ? 'Validated within tolerance' : 'Flagged for physical inspection' })
            })

            if (response.ok) {
                setSuccessMsg(approved ? 'Wastage certificate issued.' : 'Anomaly flagged for physical audit.')
                fetchWastageLogs()
                setTimeout(() => setSuccessMsg(null), 3000)
            } else {
                const data = await response.json()
                throw new Error(data.error || 'Decision transmission failed')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const pendingLogs = allLogs.filter(log => ['pending_review', 'flagged_for_audit'].includes(log.approval_status))

    const stats = {
        pending: pendingLogs.length,
        approved: allLogs.filter(log => ['approved', 'auto_approved'].includes(log.approval_status)).length,
        flagged: allLogs.filter(log => log.approval_status === 'rejected').length
    }

    return (
        <div className="animate-slide-up space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Quality <span className="text-gold">Assurance</span></h1>
                    <p className="text-gray-400">Validate mass-balance and audit production wastage</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none p-4 bg-white/5 border border-white/10 rounded-2xl text-right glass-panel">
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Peer Node Status</div>
                        <div className="text-2xl font-black text-green-500 flex items-center justify-end gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> SYNCHRONIZED
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`glass-card p-8 rounded-[2rem] border-yellow-500/10 hover:border-yellow-500/30 transition-all ${stats.pending > 0 ? 'ring-1 ring-yellow-500/20' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <span className="text-4xl font-black text-white leading-none">{stats.pending}</span>
                    </div>
                    <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs">Pending Review</h3>
                    <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Awaiting chemical/mass verification</p>
                </div>

                <div className="glass-card p-8 rounded-[2rem] border-green-500/10 hover:border-green-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-4xl font-black text-white leading-none">{stats.approved}</span>
                    </div>
                    <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs">Verified Logs</h3>
                    <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Compliance standards met</p>
                </div>

                <div className="glass-card p-8 rounded-[2rem] border-red-500/10 hover:border-red-500/30 sm:col-span-2 lg:col-span-1 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <span className="text-4xl font-black text-white leading-none">{stats.flagged}</span>
                    </div>
                    <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs">Flagged Anomalies</h3>
                    <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Mass discrepancy detected</p>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && <div className="p-4 bg-green-500/10 border border-green-500 text-green-500 rounded-2xl animate-bounce-in">{successMsg}</div>}
            {error && <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-2xl animate-shake font-bold">{error}</div>}

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Audit Queue */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-3"><Activity className="text-gold" /> Production Audit Queue</h2>
                    </div>

                    <div className="glass-panel p-2 rounded-[2.5rem] border border-white/5 min-h-[400px]">
                        {allLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-40">
                                <div className="p-8 bg-white/5 rounded-full border border-white/5">
                                    <ShieldCheck size={64} className="text-gray-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold uppercase tracking-widest text-xl">Registry Empty</h4>
                                    <p className="text-xs text-gray-500 mt-2 uppercase font-black tracking-widest">No production wastage logs found in the system.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 p-4 max-h-[700px] overflow-y-auto scrollbar-hide">
                                {allLogs.map(log => (
                                    <div key={log.id} className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 flex flex-col md:flex-row justify-between gap-6 group">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-gold uppercase tracking-widest">
                                                    {log.operation_type}
                                                </div>
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${log.approval_status === 'approved' || log.approval_status === 'auto_approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                    log.approval_status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                    }`}>
                                                    {log.approval_status.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Origin Token</p>
                                                    <p className="text-sm font-black text-white font-mono mt-1">{log.token?.token_id || 'UNKNOWN'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expected Mass</p>
                                                    <p className="text-sm font-black text-white mt-1">{log.expected_weight}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Actual Mass</p>
                                                    <p className="text-sm font-black text-white mt-1">{log.actual_weight}g</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2">
                                                <span className="text-[10px] font-bold text-gray-600 uppercase">Responsible Party:</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{log.craftsman?.name || 'Authorized Craftsman'}</span>
                                            </div>
                                        </div>

                                        {['pending_review', 'flagged_for_audit'].includes(log.approval_status) && (
                                            <div className="flex md:flex-col gap-3 justify-center min-w-[140px]">
                                                <button
                                                    onClick={() => handleApproval(log.id, true)}
                                                    className="flex-1 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white border border-green-600/30 rounded-2xl py-3 px-6 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95 shadow-lg shadow-green-600/5 outline-none"
                                                >
                                                    <Check size={16} /> Certify
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(log.id, false)}
                                                    className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-2xl py-3 px-6 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95 shadow-lg shadow-red-600/5 outline-none"
                                                >
                                                    <XCircle size={16} /> Flag
                                                </button>
                                            </div>
                                        )}
                                        {log.approval_status === 'approved' && (
                                            <div className="flex items-center justify-center min-w-[140px] text-green-500 opacity-60 italic text-[10px] font-black uppercase">
                                                Verified by {user.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                        }
                    </div>
                </div>

                {/* Audit Guidelines */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Standard Protocol</h2>
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 divide-y divide-white/5">
                        <div className="pb-6">
                            <h4 className="text-gold text-[10px] font-black uppercase tracking-widest mb-3">01. Mass-Balance Validation</h4>
                            <p className="text-xs text-gray-400 leading-relaxed uppercase font-bold tracking-tighter">
                                All wastage logs MUST align with Net Gold Weight (±0.01g). If discrepancy {'>>'} tolerance, log must be FLAGGED immediately.
                            </p>
                        </div>
                        <div className="py-6">
                            <h4 className="text-gold text-[10px] font-black uppercase tracking-widest mb-3">02. Purity Verification</h4>
                            <p className="text-xs text-gray-400 leading-relaxed uppercase font-bold tracking-tighter">
                                Random spectral analysis required for tokens with mass {'>>'} 500g. Cross-check with Refiner's initial mint batch.
                            </p>
                        </div>
                        <div className="pt-6">
                            <h4 className="text-gold text-[10px] font-black uppercase tracking-widest mb-3">03. Chain of Custody</h4>
                            <p className="text-xs text-gray-400 leading-relaxed uppercase font-bold tracking-tighter">
                                Ensure all transfers are human-confirmed. Report any unsigned inbound transfers to the administrator.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle size={20} />
                            <h4 className="text-xs font-black uppercase tracking-widest leading-none">Emergency Audit Trigger</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                            A discrepancy of {'>'} 3% in handmade casting triggers a system-wide audit of the craftsman's current inventory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
