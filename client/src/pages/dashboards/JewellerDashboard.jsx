import { useState, useEffect } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import { Package, Send, History, CheckCircle2, User, Search, Activity } from 'lucide-react'

export const JewellerDashboard = () => {
    const { user } = useSimpleAuth()
    const [products, setProducts] = useState([])
    const [activeForm, setActiveForm] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    const [transferData, setTransferData] = useState({
        product_id: '',
        customer_name: '',
        notes: ''
    })

    useEffect(() => {
        if (user) {
            fetchMyProducts()
        }
    }, [user])

    const fetchMyProducts = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/products/my', {
                headers: { 'Authorization': `Bearer mock-${user.role}` }
            })
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            }
        } catch (err) {
            console.error('Failed to fetch products', err)
        }
    }

    const handleTransferSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            // In a real app, 'customer' might be a role or a text entry
            // For BitVerse flow, we log this as a transfer to an external entity
            const response = await fetch(`http://localhost:3000/api/products/${transferData.product_id}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user.role}`
                },
                body: JSON.stringify({
                    to_participant_id: 'customer-uuid-placeholder', // Mock ID for customer
                    notes: `Sold to: ${transferData.customer_name}. ${transferData.notes}`
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Transfer failed')

            setSuccessMsg(`Product ${data.product_id} successfully transferred to ${transferData.customer_name}`)
            setActiveForm(null)
            setTransferData({ product_id: '', customer_name: '', notes: '' })
            fetchMyProducts()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-slide-up space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Jeweller <span className="text-gold">Showroom</span></h1>
                    <p className="text-gray-400">Manage certified inventory and finalize customer sales</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-right glass-panel">
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Stock count</div>
                    <div className="text-2xl font-black text-white">{products.length} <span className="text-sm font-normal text-gray-400">Items</span></div>
                </div>
            </header>

            {/* Quick Stats/Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-[2rem] flex items-center gap-6">
                    <div className="p-4 bg-gold/10 text-gold rounded-2xl">
                        <Package size={32} />
                    </div>
                    <div>
                        <div className="text-white font-bold text-xl">Inventory Ready</div>
                        <div className="text-sm text-gray-500">Certified jewellery items in stock</div>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-[2rem] flex items-center gap-6">
                    <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <div className="text-white font-bold text-xl">Verified Chain</div>
                        <div className="text-sm text-gray-500">Immutable provenance records active</div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && <div className="p-4 bg-green-500/10 border border-green-500 text-green-500 rounded-2xl animate-bounce-in">{successMsg}</div>}
            {error && <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-2xl animate-shake font-bold">{error}</div>}

            {/* Product Grid */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3"><Activity className="text-gold" /> Certified Stock</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full glass-panel p-20 text-center text-gray-500 italic uppercase font-bold tracking-widest">No inventory currently held.</div>
                    ) : (
                        products.map(p => (
                            <div key={p.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 hover:border-gold/30 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-gold/20 transition-all">
                                        <span className="text-2xl">{p.type === 'ring' ? '💍' : p.type === 'necklace' ? '📿' : '💎'}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">BitVerse ID</div>
                                        <div className="font-mono text-xs text-gold">{p.product_id}</div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <h4 className="text-xl font-black text-white uppercase group-hover:text-gold transition-colors">{p.name}</h4>
                                    <div className="flex gap-4 mt-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Mass: <span className="text-white">{p.net_gold_weight}g</span></span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Purity: <span className="text-white">{p.purity}%</span></span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setActiveForm('transfer')
                                        setTransferData({ ...transferData, product_id: p.id })
                                    }}
                                    className="w-full py-4 bg-white/5 hover:bg-gold hover:text-black rounded-2xl text-gold font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                >
                                    <Send size={16} /> Finalize Sale
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Transfer/Sale Modal */}
            {activeForm === 'transfer' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="glass-panel w-full max-w-xl p-10 rounded-[3rem] border border-gold/30 shadow-2xl animate-slide-up">
                        <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-4">
                            <span className="w-2 h-10 bg-gold rounded-full"></span> Register Sale
                        </h3>
                        <p className="text-gray-400 text-sm mb-8">This action permanently assigns the gold provenance of ID <span className="text-gold font-mono">{products.find(p => p.id === transferData.product_id)?.product_id}</span> to the end customer.</p>

                        <form onSubmit={handleTransferSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-black uppercase tracking-widest">Customer Name</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition" size={18} />
                                    <input
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white focus:border-gold outline-none transition font-bold"
                                        placeholder="Enter full name for certificate"
                                        value={transferData.customer_name}
                                        onChange={e => setTransferData({ ...transferData, customer_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-black uppercase tracking-widest">Sale notes (Optional)</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold outline-none transition text-sm"
                                    rows="3"
                                    placeholder="Order number, special hallmarks, or warranty details..."
                                    value={transferData.notes}
                                    onChange={e => setTransferData({ ...transferData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setActiveForm(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition">Abort</button>
                                <button type="submit" disabled={loading} className="flex-1 btn-gold">
                                    {loading ? 'Finalizing...' : 'Finalize & Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
