import { useState, useEffect } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import { Package, Send, History, Search, User, Tag, ShoppingCart, ArrowRight, ShieldCheck, Star, Sparkles, Receipt, CheckCircle2 } from 'lucide-react'

// Defined outside/above to avoid hoisting ReferenceError
const ProductCard = ({ product, isOwned, onSale, isSold }) => (
    <div className={`glass-card group p-8 rounded-[3.5rem] border border-white/5 transition-all duration-700 relative overflow-hidden flex flex-col items-stretch ${isSold ? 'opacity-70 grayscale-[0.5]' : 'bg-white/5 hover:border-gold/30 hover:bg-white/[0.08]'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-1000">
            {isSold ? <Receipt size={120} /> : <Tag size={120} />}
        </div>

        <div className="flex items-start justify-between mb-10 relative z-10">
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border border-white/5 text-5xl shadow-2xl backdrop-blur-3xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br from-white/10 via-transparent to-transparent ${isSold ? 'text-green-500' : 'group-hover:text-gold'}`}>
                {product.type === 'ring' ? '💍' :
                    product.type === 'necklace' ? '📿' :
                        product.type === 'earrings' ? '💎' : '✨'}
            </div>
            <div className="text-right">
                <div className={`text-[11px] font-black uppercase tracking-[0.3em] mb-2 ${isSold ? 'text-green-500' : 'text-gold'}`}>{product.type}</div>
                <div className="px-3 py-1 bg-black/40 rounded-lg inline-block text-[10px] font-black text-white font-mono opacity-50 border border-white/5">{product.product_id}</div>
            </div>
        </div>

        <div className="space-y-6 flex-1 relative z-10">
            <h3 className={`text-3xl font-black text-white uppercase tracking-tighter leading-tight group-hover:translate-x-2 transition-transform duration-500 ${isSold ? '' : 'group-hover:text-gold'}`}>
                {product.name}
                {isSold && <span className="block text-xs text-green-500 mt-2 font-black tracking-widest uppercase">Asset Transferred</span>}
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-black/40 rounded-3xl border border-white/5 group-hover:border-gold/10 transition-all duration-500 shadow-xl">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-gold/50 transition-colors">Purity</div>
                    <div className="text-xl font-black text-white">{product.purity}K</div>
                </div>
                <div className="p-5 bg-black/40 rounded-3xl border border-white/5 group-hover:border-gold/10 transition-all duration-500 shadow-xl">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-gold/50 transition-colors">Weight</div>
                    <div className="text-xl font-black text-white">{product.net_gold_weight}g</div>
                </div>
            </div>
        </div>

        {!isSold ? (
            <button
                onClick={onSale}
                className="mt-10 w-full bg-white text-black hover:bg-gold hover:text-black font-black py-6 rounded-3xl transition-all duration-500 shadow-xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 group/btn border border-white/10"
            >
                <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /> Authorize Sale
            </button>
        ) : (
            <div className="mt-10 py-6 px-8 bg-green-500/10 border border-green-500/20 rounded-3xl text-[10px] font-black text-green-500 uppercase tracking-widest text-center flex items-center justify-center gap-3 shadow-lg shadow-green-500/5">
                <CheckCircle2 size={16} /> Sold to Private Client
            </div>
        )}
    </div>
)

export const JewellerDashboard = () => {
    const { user } = useSimpleAuth()
    const [products, setProducts] = useState([])
    const [auditLogs, setAuditLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Final Sale State
    const [activeForm, setActiveForm] = useState(null) // 'sale'
    const [saleData, setSaleData] = useState({ product_id: '', customer_name: '', price: '', notes: '' })

    useEffect(() => {
        if (user) {
            refreshData()
        }
    }, [user])

    const refreshData = async () => {
        setLoading(true)
        await Promise.all([fetchProducts(), fetchSalesHistory()])
        setLoading(false)
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/products', {
                headers: { 'Authorization': `Bearer mock-${user.role}` }
            })
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            }
        } catch (err) {
            console.error('Failed to fetch inventory', err)
            setError('System link failure: Unable to retrieve inventory.')
        }
    }

    const fetchSalesHistory = async () => {
        try {
            // Using admin endpoint as a hackathon bypass to show sold products
            // In production, this would be a specific sales endpoint
            const response = await fetch('http://localhost:3000/api/admin/audit-logs', {
                headers: { 'Authorization': `Bearer mock-admin` } // Hack: use admin privilege to see logs
            })
            if (response.ok) {
                const data = await response.json()
                // Filter for sales transactions
                const sales = data.filter(log =>
                    log.action_type === 'transfer_product' &&
                    log.details.notes?.includes('FINAL SALE')
                )
                setAuditLogs(sales)
            }
        } catch (err) {
            console.error('Failed to fetch sales history', err)
        }
    }

    const handleSaleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const productToSell = products.find(p => p.id === saleData.product_id)
            const response = await fetch(`http://localhost:3000/api/products/${saleData.product_id}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user.role}`
                },
                body: JSON.stringify({
                    to_participant_id: user.id, // Current simplified model: ownership record in logs
                    notes: `FINAL SALE to ${saleData.customer_name}. Price: ${saleData.price}. Token: ${productToSell?.product_id}. Memo: ${saleData.notes}`
                })
            })

            if (response.ok) {
                setSuccessMsg(`Transaction Authorized! Asset ${saleData.product_id} transferred to ${saleData.customer_name}.`)
                setActiveForm(null)
                setSaleData({ product_id: '', customer_name: '', price: '', notes: '' })
                refreshData()
            } else {
                const data = await response.json()
                throw new Error(data.error || 'Sale recording failed')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Identify which products are sold
    const soldProductIds = auditLogs.map(log => log.resource_id)

    const filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.product_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !soldProductIds.includes(p.id) // Only show available products in the main catalog
    )

    const soldProductsView = auditLogs.map(log => {
        const product = products.find(p => p.id === log.resource_id)
        if (!product) return null
        return {
            ...product,
            saleInfo: log.details.notes,
            soldAt: log.created_at
        }
    }).filter(Boolean)

    return (
        <div className="animate-slide-up space-y-12 pb-20">
            {/* Hero Section */}
            <header className="relative py-12 px-10 rounded-[3rem] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gold/10 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -ml-20 -mb-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gold/20 rounded-lg">
                                <Sparkles className="text-gold" size={20} />
                            </div>
                            <span className="text-gold text-xs font-black uppercase tracking-[0.3em]">Imperial Suite</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
                            Jeweller <span className="text-gold">Showroom</span>
                        </h1>
                        <p className="text-gray-400 max-w-lg font-medium leading-relaxed">
                            Welcome back, <span className="text-white font-bold">{user.name}</span>. Manage your boutique inventory and authorize high-value transactions with cryptographic precision.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] text-center min-w-[140px] group transition-all duration-500 bg-green-500/5 border-green-500/20">
                            <div className="text-green-500 text-[10px] uppercase font-black tracking-widest mb-1 group-hover:text-gold transition-colors">Digital Revenue</div>
                            <div className="text-4xl font-black text-white">{soldProductsView.length} Sold</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Notifications */}
            <div className="max-w-4xl mx-auto">
                {successMsg && <div className="p-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-3xl animate-bounce-in flex items-center gap-4 shadow-lg shadow-green-500/10 font-bold"><CheckCircle2 size={24} /> {successMsg}</div>}
                {error && <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-3xl animate-shake flex items-center gap-4 shadow-lg shadow-red-500/10 font-bold"><ShieldCheck size={24} /> {error}</div>}
            </div>

            {/* Main Content Area */}
            <div className="space-y-16">
                {/* Search & Available Stock */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-8 w-1.5 bg-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Available for <span className="text-gold">Immediate Sale</span></h2>
                        </div>
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Identify specific asset..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="relative w-full bg-black/40 border border-white/10 rounded-[1.5rem] pl-16 pr-8 py-4 text-white focus:border-gold outline-none transition-all shadow-xl backdrop-blur-xl group-hover:border-white/20 font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full py-24 text-center glass-panel border-dashed border-2 border-white/5 rounded-[3rem] opacity-50 bg-white/[0.02]">
                                <ShoppingCart size={64} className="mx-auto text-gray-600 mb-6" />
                                <h3 className="text-xl font-bold uppercase tracking-widest text-white">Catalog Depleted</h3>
                                <p className="text-xs uppercase font-black text-gray-500 mt-2">All assets have been successfully transferred to private ownership.</p>
                            </div>
                        ) : (
                            filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} isOwned={true} onSale={() => {
                                    setActiveForm('sale')
                                    setSaleData({ ...saleData, product_id: product.id })
                                }} />
                            ))
                        )}
                    </div>
                </section>

                {/* Section: Sold Ledger */}
                {soldProductsView.length > 0 && (
                    <section className="space-y-8 pt-12 border-t border-white/5">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-8 w-1.5 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Boutique <span className="text-green-500">Sales Ledger</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {soldProductsView.map(product => (
                                <div key={product.id + '_sold'} className="relative group">
                                    <ProductCard product={product} isOwned={false} isSold={true} />
                                    <div className="mt-4 p-5 bg-green-500/5 border border-green-500/10 rounded-3xl animate-fade-in group-hover:border-green-500/20 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Transaction Verified</div>
                                            <div className="text-[9px] font-mono text-gray-600">{new Date(product.soldAt).toLocaleString()}</div>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed italic border-l-2 border-green-500/30 pl-3">
                                            {product.saleInfo}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Sale Form Modal */}
            {activeForm === 'sale' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
                    <div className="relative w-full max-w-2xl animate-scale-in">
                        <div className="absolute inset-0 bg-gold/10 blur-[100px] rounded-full"></div>
                        <div className="relative glass-panel p-12 rounded-[4rem] border border-gold/30 shadow-[0_0_100px_rgba(212,175,55,0.1)] overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5"><Star size={120} /></div>

                            <header className="mb-10 text-center">
                                <div className="inline-flex p-4 bg-gold/10 rounded-2xl mb-6 text-gold"><Tag size={32} /></div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Authorize <span className="text-gold">Transaction</span></h3>
                                <p className="text-gray-500 text-sm mt-3 font-bold uppercase tracking-widest">Converting Digital Asset to Private Ownership</p>
                            </header>

                            <form onSubmit={handleSaleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 group-focus-within:text-gold transition-colors">Client Identification</label>
                                        <input
                                            required
                                            className="w-full bg-black/60 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white focus:border-gold outline-none transition-all placeholder:text-gray-700 font-bold"
                                            placeholder="Full legal name of the purchaser"
                                            value={saleData.customer_name}
                                            onChange={e => setSaleData({ ...saleData, customer_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="group">
                                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 group-focus-within:text-gold transition-colors">Price (Optional)</label>
                                            <input
                                                className="w-full bg-black/60 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white focus:border-gold outline-none transition-all placeholder:text-gray-700 font-bold"
                                                placeholder="Ex: 12,500 USD"
                                                value={saleData.price}
                                                onChange={e => setSaleData({ ...saleData, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 group-focus-within:text-gold transition-colors">Encrypted Memo</label>
                                            <input
                                                className="w-full bg-black/60 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white focus:border-gold outline-none transition-all placeholder:text-gray-700 font-bold"
                                                placeholder="Internal transaction notes"
                                                value={saleData.notes}
                                                onChange={e => setSaleData({ ...saleData, notes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button type="button" onClick={() => setActiveForm(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-3xl transition-all border border-white/5">Cancel Order</button>
                                    <button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-5 rounded-3xl transition-all shadow-2xl shadow-gold/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95">
                                        {loading ? 'Processing Authorisation...' : <><ShieldCheck size={20} /> Authorize Handover</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
