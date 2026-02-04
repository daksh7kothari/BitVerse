import { useState, useEffect } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import { Coins, Send, History, Database, ShieldCheck, Activity } from 'lucide-react'

export const RefinerDashboard = () => {
    const { user } = useSimpleAuth()
    const [showMintForm, setShowMintForm] = useState(false)
    const [showTransferForm, setShowTransferForm] = useState(false)
    const [batches, setBatches] = useState([])
    const [tokens, setTokens] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        batch_id: '',
        weight: '',
        current_owner_id: user?.id || '9f53546e-67a2-4d0e-bd43-131479a64c62',
        confirm_human: false
    })

    const [transferData, setTransferData] = useState({ token_id: '', to_participant_id: '', notes: '' })

    useEffect(() => {
        if (user) {
            fetchBatches()
            fetchTokens()
        }
    }, [user])

    const fetchBatches = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/batches')
            if (response.ok) setBatches(await response.json())
        } catch (err) { console.error('Batches fetch error:', err) }
    }

    const fetchTokens = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tokens', {
                headers: { 'Authorization': `Bearer mock-${user?.role || 'refiner'}` }
            })
            if (response.ok) setTokens(await response.json())
            else if (response.status === 401) setError('Session expired. Please re-login.')
        } catch (err) { console.error('Tokens fetch error:', err) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const response = await fetch('http://localhost:3000/api/tokens/mint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user?.role || 'refiner'}`
                },
                body: JSON.stringify({ ...formData, weight: parseFloat(formData.weight) })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Minting failed')

            setSuccessMsg(`Token Minted: ${data.token_id}`)
            setShowMintForm(false)
            setFormData({ ...formData, weight: '', confirm_human: false })
            fetchTokens()
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    const handleTransferSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const token = tokens.find(t => t.id === transferData.token_id)
            if (!token) throw new Error('Token not found')

            const response = await fetch(`http://localhost:3000/api/tokens/${token.id}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user?.role || 'refiner'}`
                },
                body: JSON.stringify(transferData)
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Transfer failed')

            setSuccessMsg(`Transfer Success: ${data.token_id}`)
            setShowTransferForm(false)
            setTransferData({ token_id: '', to_participant_id: '', notes: '' })
            fetchTokens()
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    const totalMintedWeight = tokens.reduce((acc, t) => acc + (parseFloat(t.weight) || 0), 0).toFixed(2)

    return (
        <div className="animate-slide-up space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Refiner <span className="text-gold">Terminal</span></h1>
                    <p className="text-gray-400">Initialize gold provenance and mint digital tokens</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-right glass-panel">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">Total Provenance</div>
                    <div className="text-2xl font-black text-white">{totalMintedWeight} <span className="text-sm font-normal text-gray-400">g</span></div>
                </div>
            </header>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                    onClick={() => setShowMintForm(!showMintForm)}
                    className="group glass-card p-6 rounded-[2rem] border-white/5 hover:border-gold/30 flex items-center gap-6"
                >
                    <div className="p-4 bg-gold/10 text-gold rounded-2xl group-hover:bg-yellow-500 group-hover:text-black transition-all">
                        <Coins size={32} />
                    </div>
                    <div className="text-left">
                        <div className="text-white font-bold text-xl">Mint Token</div>
                        <div className="text-sm text-gray-500">Register batch purity</div>
                    </div>
                </button>

                <button
                    onClick={() => setShowTransferForm(!showTransferForm)}
                    className="group glass-card p-6 rounded-[2rem] border-white/5 hover:border-blue-500/30 flex items-center gap-6"
                >
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Send size={32} />
                    </div>
                    <div className="text-left">
                        <div className="text-white font-bold text-xl">Transfer Gold</div>
                        <div className="text-sm text-gray-500">Send to Craftsman/Lab</div>
                    </div>
                </button>

                <div className="glass-card p-6 rounded-[2rem] border-white/5 flex items-center gap-6">
                    <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl">
                        <Database size={32} />
                    </div>
                    <div className="text-left">
                        <div className="text-white font-bold text-xl">{tokens.length}</div>
                        <div className="text-sm text-gray-500">Tokens in Ledger</div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && <div className="p-4 bg-green-500/10 border border-green-500 text-green-500 rounded-2xl">{successMsg}</div>}
            {error && <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-2xl">{error}</div>}

            {/* Forms Section */}
            {(showMintForm || showTransferForm) && (
                <div className="grid grid-cols-1 gap-8 animate-slide-up">
                    {showMintForm && (
                        <div className="glass-panel p-8 rounded-[3rem] border-gold/20 shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-gold rounded-full"></span> Minting Protocol
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Gold Batch Source</label>
                                        <select
                                            required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold outline-none transition"
                                            onChange={e => setFormData({ ...formData, batch_id: e.target.value })}
                                        >
                                            <option value="">Select verified source...</option>
                                            {batches.map(b => (
                                                <option key={b.id} value={b.id}>{b.batch_id} ({b.purity}% Purified) - {b.weight}g</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Token Weight (g)</label>
                                        <input
                                            type="number" step="0.01" required
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold outline-none transition"
                                            placeholder="Ex: 50.00"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <input type="checkbox" required className="w-6 h-6 rounded-lg accent-gold" id="human-check" checked={formData.confirm_human} onChange={e => setFormData({ ...formData, confirm_human: e.target.checked })} />
                                    <label htmlFor="human-check" className="text-sm text-gray-400">I solemnly swear that I have verified the physical mass and purity of this batch before digital minting.</label>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowMintForm(false)} className="px-8 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition">Abondon</button>
                                    <button type="submit" disabled={loading} className="btn-gold flex-1">{loading ? 'Minting...' : 'Authorize Mint'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showTransferForm && (
                        <div className="glass-panel p-8 rounded-[3rem] border-blue-500/20 shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-blue-500 rounded-full"></span> Transfer Protocol
                            </h3>
                            <form onSubmit={handleTransferSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Select Token ID</label>
                                        <select
                                            required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition"
                                            onChange={e => setTransferData({ ...transferData, token_id: e.target.value })}
                                        >
                                            <option value="">Choose token for transfer...</option>
                                            {tokens.filter(t => t.status === 'active').map(t => (
                                                <option key={t.id} value={t.id}>{t.token_id} ({t.weight}g)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Recipient Party</label>
                                        <select
                                            required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition"
                                            onChange={e => setTransferData({ ...transferData, to_participant_id: e.target.value })}
                                        >
                                            <option value="">Select recipient entity...</option>
                                            <option value="b3cf56b8-4dc0-4081-9069-2d34d55438e0">Master Craftsman Ltd</option>
                                            <option value="3fb85466-33f9-4ca8-a995-2bf27528e808">Quality Assurance Lab</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowTransferForm(false)} className="px-8 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition">Abort</button>
                                    <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-600/20">Authorize Transfer</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Token Ledger Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-3"><Activity className="text-gold" /> Provenance Ledger</h2>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Network Node Active
                    </div>
                </div>
                <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                    <div className="grid grid-cols-1 divide-y divide-white/5 max-h-[500px] overflow-y-auto scrollbar-hide">
                        {tokens.length === 0 ? (
                            <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest">No provenance data initialized</div>
                        ) : (
                            tokens.map(t => (
                                <div key={t.id} className="p-6 hover:bg-white/5 transition flex justify-between items-center group">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all">
                                            <ShieldCheck className="text-gold" size={20} />
                                        </div>
                                        <div>
                                            <div className="font-mono text-white font-black group-hover:text-gold transition-colors">{t.token_id}</div>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Mass: <span className="text-gray-300">{t.weight}g</span></span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Purity: <span className="text-gray-300">{t.purity}%</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border inline-block mb-1 ${t.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-white/5 text-gray-500 border-white/5'
                                            }`}>
                                            {t.status}
                                        </div>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase">{new Date(t.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
