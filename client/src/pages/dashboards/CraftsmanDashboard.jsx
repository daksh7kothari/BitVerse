import { useState, useEffect } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import { Scissors, Layers, Package, Plus, Trash2, Send, History } from 'lucide-react'

export const CraftsmanDashboard = () => {
    const { user } = useSimpleAuth()
    const [tokens, setTokens] = useState([])
    const [products, setProducts] = useState([])
    const [participants, setParticipants] = useState([])
    const [activeForm, setActiveForm] = useState(null) // 'split', 'create_product', 'transfer_product'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    // Split Form State
    const [splitData, setSplitData] = useState({
        parent_token_id: '',
        child_weights: ['']
    })

    // Product Form State
    const [productData, setProductData] = useState({
        name: '',
        type: 'ring',
        gross_weight: '',
        net_gold_weight: '',
        token_composition: [{ token_id: '', weight_used: '' }]
    })

    // Transfer State
    const [transferData, setTransferData] = useState({ product_id: '', to_participant_id: '', notes: '' })

    useEffect(() => {
        if (user) {
            fetchTokens()
            fetchProducts()
            fetchParticipants()
        }
    }, [user])

    const fetchParticipants = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/participants', {
                headers: { 'Authorization': `Bearer mock-${user.role}` }
            })
            if (response.ok) {
                const data = await response.json()
                setParticipants(data)
            }
        } catch (err) {
            console.error('Failed to fetch participants', err)
        }
    }

    const fetchTokens = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tokens', {
                headers: {
                    'Authorization': `Bearer mock-${user.role}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setTokens(data)
            }
        } catch (err) {
            console.error('Failed to fetch tokens', err)
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/products/my', {
                headers: {
                    'Authorization': `Bearer mock-${user.role}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            }
        } catch (err) {
            console.error('Failed to fetch products', err)
        }
    }

    // --- Split Handlers ---
    const handleAddChild = () => {
        setSplitData({
            ...splitData,
            child_weights: [...splitData.child_weights, '']
        })
    }

    const handleRemoveChild = (index) => {
        const newWeights = splitData.child_weights.filter((_, i) => i !== index)
        setSplitData({ ...splitData, child_weights: newWeights })
    }

    const handleWeightChange = (index, value) => {
        const newWeights = [...splitData.child_weights]
        newWeights[index] = value
        setSplitData({ ...splitData, child_weights: newWeights })
    }

    const calculateRemaining = () => {
        const parentToken = tokens.find(t => t.id === splitData.parent_token_id)
        if (!parentToken) return 0
        const currentSum = splitData.child_weights.reduce((acc, w) => acc + (parseFloat(w) || 0), 0)
        return parseFloat(parentToken.weight) - currentSum
    }

    const remainingWeight = calculateRemaining()

    const handleAutoFill = () => {
        if (remainingWeight <= 0) return
        setSplitData({
            ...splitData,
            child_weights: [...splitData.child_weights, remainingWeight.toFixed(2)]
        })
    }

    const handleSplitSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const weights = splitData.child_weights.map(w => parseFloat(w))
            const parentToken = tokens.find(t => t.id === splitData.parent_token_id)
            if (!parentToken) throw new Error('Parent token not found')

            const response = await fetch(`http://localhost:3000/api/tokens/${parentToken.id}/split`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user.role}`
                },
                body: JSON.stringify({
                    child_weights: weights
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Split failed')
            }

            setSuccessMsg(`Token Split Successfully! Created ${data.children.length} new tokens.`)
            setActiveForm(null)
            setSplitData({ parent_token_id: '', child_weights: [''] })
            fetchTokens()

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Product Transfer Handler ---
    const handleTransferSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const product = products.find(p => p.id === transferData.product_id)
            if (!product) throw new Error('Product not found')

            const response = await fetch(`http://localhost:3000/api/products/${product.id}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user.role}`
                },
                body: JSON.stringify({
                    to_participant_id: transferData.to_participant_id,
                    notes: transferData.notes
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Product transfer failed')
            }

            setSuccessMsg(`Product ${data.product_id} transferred successfully!`)
            setActiveForm(null)
            setTransferData({ product_id: '', to_participant_id: '', notes: '' })
            fetchProducts()

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Product Creation Handlers ---
    const handleAddComposition = () => {
        setProductData({
            ...productData,
            token_composition: [...productData.token_composition, { token_id: '', weight_used: '' }]
        })
    }

    const handleRemoveComposition = (index) => {
        const newComp = productData.token_composition.filter((_, i) => i !== index)
        setProductData({ ...productData, token_composition: newComp })
    }

    const handleCompositionChange = (index, field, value) => {
        const newComp = [...productData.token_composition]
        newComp[index] = { ...newComp[index], [field]: value }
        setProductData({ ...productData, token_composition: newComp })
    }

    const handleProductSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const composition = productData.token_composition.map(c => ({
                token_id: c.token_id,
                weight_used: parseFloat(c.weight_used)
            }))

            const response = await fetch('http://localhost:3000/api/products/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer mock-${user.role}`
                },
                body: JSON.stringify({
                    ...productData,
                    gross_weight: parseFloat(productData.gross_weight),
                    net_gold_weight: parseFloat(productData.net_gold_weight),
                    token_composition: composition
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to create product')

            setSuccessMsg(`Product Created! ID: ${data.product_id}`)
            setActiveForm(null)
            setProductData({
                name: '', type: 'ring', gross_weight: '', net_gold_weight: '',
                token_composition: [{ token_id: '', weight_used: '' }]
            })
            fetchTokens()
            fetchProducts()
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
                    <h1 className="text-4xl font-black text-white mb-2">Craftsman <span className="text-gold">Studio</span></h1>
                    <p className="text-gray-400">Design jewelry and manage gold inventory</p>
                </div>
                <div className="flex gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-right glass-panel">
                        <div className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">Raw Inventory</div>
                        <div className="text-2xl font-black text-white">{tokens.filter(t => t.status === 'active').length} <span className="text-sm font-normal text-gray-400">Tokens</span></div>
                    </div>
                </div>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                    onClick={() => setActiveForm(activeForm === 'split' ? null : 'split')}
                    className={`group p-6 rounded-3xl border transition-all duration-300 flex items-center gap-6 ${activeForm === 'split' ? 'bg-yellow-500 border-yellow-400 ring-4 ring-yellow-500/20' : 'bg-white/5 border-white/10 hover:border-yellow-500/50 glass-card'}`}
                >
                    <div className={`p-4 rounded-2xl transition-colors ${activeForm === 'split' ? 'bg-black/10' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        <Scissors size={32} />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold text-xl ${activeForm === 'split' ? 'text-black' : 'text-white'}`}>Split Token</div>
                        <div className={`text-sm ${activeForm === 'split' ? 'text-black/60' : 'text-gray-500'}`}>Divide bulk gold into parts</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveForm(activeForm === 'create_product' ? null : 'create_product')}
                    className={`group p-6 rounded-3xl border transition-all duration-300 flex items-center gap-6 ${activeForm === 'create_product' ? 'bg-green-600 border-green-500 ring-4 ring-green-600/20' : 'bg-white/5 border-white/10 hover:border-green-500/50 glass-card'}`}
                >
                    <div className={`p-4 rounded-2xl transition-colors ${activeForm === 'create_product' ? 'bg-black/10 text-white' : 'bg-green-500/10 text-green-500'}`}>
                        <Package size={32} />
                    </div>
                    <div className="text-left">
                        <div className="text-white font-bold text-xl">Craft Jewelry</div>
                        <div className={`text-sm ${activeForm === 'create_product' ? 'text-white/60' : 'text-gray-500'}`}>Mint new verified products</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveForm(activeForm === 'transfer_jeweller' ? null : 'transfer_jeweller')}
                    className={`group p-6 rounded-3xl border transition-all duration-300 flex items-center gap-6 ${activeForm === 'transfer_jeweller' ? 'bg-gold border-yellow-400 ring-4 ring-gold/20' : 'bg-white/5 border-white/10 hover:border-gold/50 glass-card'}`}
                >
                    <div className={`p-4 rounded-2xl transition-colors ${activeForm === 'transfer_jeweller' ? 'bg-black/10' : 'bg-gold/10 text-gold'}`}>
                        <Send size={32} />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold text-xl ${activeForm === 'transfer_jeweller' ? 'text-black' : 'text-white'}`}>To Jeweller</div>
                        <div className={`text-sm ${activeForm === 'transfer_jeweller' ? 'text-black/60' : 'text-gray-500'}`}>Ship to retail showrooms</div>
                    </div>
                </button>
            </div>

            {/* Notifications */}
            {successMsg && <div className="p-4 bg-green-500/10 border border-green-500 text-green-500 rounded-2xl animate-bounce-in">{successMsg}</div>}
            {error && <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-2xl animate-shake">{error}</div>}

            {/* Dynamic Forms */}
            {activeForm === 'split' && (
                <div className="glass-panel p-8 rounded-[2.5rem] border border-yellow-500/20 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Scissors className="text-yellow-500" /> Split Source Token
                    </h3>
                    <form onSubmit={handleSplitSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Select Token</label>
                                <select
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-500 outline-none transition"
                                    onChange={e => setSplitData({ ...splitData, parent_token_id: e.target.value })}
                                >
                                    <option value="">Choose token...</option>
                                    {tokens.filter(t => t.status === 'active').map(t => (
                                        <option key={t.id} value={t.id}>{t.token_id} ({t.weight}g)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex-1 text-center">
                                    <span className="text-gray-500 text-xs font-bold mr-2">REMAINING:</span>
                                    <span className={`text-xl font-black ${remainingWeight < 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                                        {remainingWeight.toFixed(2)}g
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest">Child Token Weights</label>
                            {splitData.child_weights.map((w, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <input
                                        type="number" step="0.01" value={w} required
                                        onChange={e => handleWeightChange(i, e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-500 outline-none transition"
                                        placeholder={`Child ${i + 1} weight (g)`}
                                    />
                                    {splitData.child_weights.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveChild(i)} className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition"><Trash2 /></button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <div className="flex gap-4">
                                <button type="button" onClick={handleAddChild} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-yellow-500 font-bold transition flex items-center gap-2">
                                    <Plus size={20} /> Add Child
                                </button>
                                {remainingWeight > 0 && (
                                    <button type="button" onClick={handleAutoFill} className="px-6 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl text-yellow-500 font-bold transition">
                                        Use Remainder ({remainingWeight.toFixed(2)}g)
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setActiveForm(null)} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-gold px-12">{loading ? 'Processing...' : 'Execute Split'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {activeForm === 'create_product' && (
                <div className="glass-panel p-8 rounded-[2.5rem] border border-green-500/20 shadow-2xl animate-slide-up">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Package className="text-green-500" /> Professional Crafting Studio
                    </h3>
                    <form onSubmit={handleProductSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Jewellery Name</label>
                                <input
                                    required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-green-500 outline-none transition"
                                    placeholder="Ex: Royal Heritage Ring"
                                    value={productData.name}
                                    onChange={e => setProductData({ ...productData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Item Type</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-green-500 outline-none transition"
                                    value={productData.type}
                                    onChange={e => setProductData({ ...productData, type: e.target.value })}
                                >
                                    <option value="ring">Ring</option>
                                    <option value="necklace">Necklace</option>
                                    <option value="bracelet">Bracelet</option>
                                    <option value="earrings">Earrings</option>
                                    <option value="pendant">Pendant</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Gross Weight (g)</label>
                                <input
                                    type="number" step="0.01" required
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-green-500 outline-none transition"
                                    placeholder="Total mass"
                                    value={productData.gross_weight}
                                    onChange={e => setProductData({ ...productData, gross_weight: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Composition & Net Weight */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-white/5">
                            <div className="lg:col-span-2 space-y-4">
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest">Gold Token Composition</label>
                                {productData.token_composition.map((comp, i) => (
                                    <div key={i} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <select
                                                required className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none"
                                                value={comp.token_id}
                                                onChange={e => handleCompositionChange(i, 'token_id', e.target.value)}
                                            >
                                                <option value="">Select Token Source...</option>
                                                {tokens.filter(t => t.status === 'active').map(t => (
                                                    <option key={t.id} value={t.id}>{t.token_id} ({t.weight}g / {t.purity}%)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number" step="0.01" required placeholder="Grams"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none"
                                                value={comp.weight_used}
                                                onChange={e => handleCompositionChange(i, 'weight_used', e.target.value)}
                                            />
                                        </div>
                                        {productData.token_composition.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveComposition(i)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={18} /></button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddComposition} className="flex items-center gap-2 text-green-500 text-xs font-black uppercase tracking-widest hover:text-green-400 transition italic">
                                    <Plus size={16} /> Integrate Additional Token
                                </button>
                            </div>

                            <div className="glass-panel p-6 rounded-3xl border border-green-500/10 flex flex-col justify-center text-center space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Token Weight</label>
                                <div className="text-3xl font-black text-white">
                                    {productData.token_composition.reduce((acc, c) => acc + (parseFloat(c.weight_used) || 0), 0).toFixed(2)}g
                                </div>
                                <div className="h-[1px] bg-white/5 w-1/2 mx-auto"></div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Target Net Weight</label>
                                <input
                                    type="number" step="0.01" required
                                    className="bg-transparent text-xl font-black text-green-500 text-center outline-none border-b-2 border-green-500/30 focus:border-green-500 transition pb-1 w-full"
                                    placeholder="0.00"
                                    value={productData.net_gold_weight}
                                    onChange={e => setProductData({ ...productData, net_gold_weight: e.target.value })}
                                />
                                <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">Difference should be {'<'} 0.01g</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-white/5">
                            <div className="flex-1 max-w-xs text-left">
                                <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 italic">Optional: Select Approved Wastage Log</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-green-500 outline-none"
                                    onChange={e => setProductData({ ...productData, wastage_log_id: e.target.value })}
                                >
                                    <option value="">No Wastage Log</option>
                                    {/* In a real app, fetch wastage logs here */}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setActiveForm(null)} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition">Abort Studio</button>
                                <button type="submit" disabled={loading} className="px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition shadow-xl shadow-green-600/20 active:scale-95">
                                    {loading ? 'Finalizing Craft...' : 'Authorize Product Creation'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* My Inventory Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Products Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3"><Package className="text-green-500" /> Finished Products</h2>
                    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                        {products.length === 0 ? (
                            <div className="glass-panel p-12 rounded-3xl text-center text-gray-500 italic">No products crafted yet. Start designing above.</div>
                        ) : (
                            products.map(p => (
                                <div key={p.id} className="glass-card group p-6 rounded-3xl flex justify-between items-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="flex gap-6 items-center flex-1">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                            <span className="text-2xl">💍</span> {/* Replace with dynamic icons if possible */}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xl text-white group-hover:text-green-400 transition-colors uppercase">{p.name}</h4>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-xs uppercase font-bold text-gray-500 tracking-tighter">ID: <span className="text-gray-300 font-mono">{p.product_id}</span></span>
                                                <span className="text-xs uppercase font-bold text-gray-500 tracking-tighter">GOLD: <span className="text-green-500">{p.net_gold_weight}g</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setActiveForm('transfer_product')
                                            setTransferData({ ...transferData, product_id: p.id })
                                        }}
                                        className="relative z-10 px-6 py-3 bg-white/5 hover:bg-green-600 hover:text-white rounded-2xl text-green-500 font-bold transition-all duration-300 flex items-center gap-2 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                    >
                                        <Send size={18} /> Transfer
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Raw Tokens Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3"><Layers className="text-yellow-500" /> Raw Inventory</h2>
                    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                        {tokens.length === 0 ? (
                            <div className="glass-panel p-12 rounded-3xl text-center text-gray-500 italic">Inventory is empty. Wait for Refiner transfer.</div>
                        ) : (
                            tokens.map(t => (
                                <div key={t.id} className="glass-card p-6 rounded-3xl flex justify-between items-center">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                                            <Layers className="text-yellow-500" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-mono text-sm text-yellow-500 tracking-widest">{t.token_id}</h4>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Mass: <span className="text-white">{t.weight}g</span></span>
                                                <span className="text-xs font-bold text-gray-400 uppercase">Purity: <span className="text-white">{t.purity}%</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${t.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                        {t.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Transfer Product Modal/Form (Now supporting specific Jeweller transfer) */}
            {(activeForm === 'transfer_product' || activeForm === 'transfer_jeweller') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className={`glass-panel w-full max-w-xl p-8 rounded-[2.5rem] border ${activeForm === 'transfer_jeweller' ? 'border-gold/30' : 'border-green-500/30'} shadow-2xl animate-slide-up`}>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Send className={activeForm === 'transfer_jeweller' ? 'text-gold' : 'text-green-500'} />
                            {activeForm === 'transfer_jeweller' ? 'Dispatch to Showroom' : 'Transfer Ownership'}
                        </h3>
                        {transferData.product_id ? (
                            <p className="text-gray-400 text-sm mb-6">Product: <span className="text-white font-mono">{products.find(p => p.id === transferData.product_id)?.product_id} - {products.find(p => p.id === transferData.product_id)?.name}</span></p>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Select Product to Transfer</label>
                                <select
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold outline-none transition"
                                    value={transferData.product_id}
                                    onChange={e => setTransferData({ ...transferData, product_id: e.target.value })}
                                >
                                    <option value="">Choose product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.product_id} - {p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <form onSubmit={handleTransferSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                                    {activeForm === 'transfer_jeweller' ? 'Showroom Name / Destination' : 'Recipient Party'}
                                </label>
                                {activeForm === 'transfer_jeweller' ? (
                                    <select
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold outline-none transition"
                                        value={transferData.to_participant_id}
                                        onChange={e => setTransferData({ ...transferData, to_participant_id: e.target.value })}
                                    >
                                        <option value="">Select Showroom/Jeweller...</option>
                                        {participants
                                            .filter(p => p.role === 'jeweller' || p.role === 'admin' || p.name.toLowerCase().includes('jewell'))
                                            .map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} (JEWELLER)
                                                </option>
                                            ))}
                                    </select>
                                ) : (
                                    <select
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-500 outline-none transition"
                                        value={transferData.to_participant_id}
                                        onChange={e => setTransferData({ ...transferData, to_participant_id: e.target.value })}
                                    >
                                        <option value="">Select recipient...</option>
                                        {participants
                                            .filter(p => p.id !== user.id)
                                            .map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({p.role.toUpperCase()})
                                                </option>
                                            ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Transfer Memo / Name</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-500 outline-none transition"
                                    rows="3"
                                    placeholder={activeForm === 'transfer_jeweller' ? "e.g. Batch for seasonal display" : "e.g. Sent for final hallmarking"}
                                    value={transferData.notes}
                                    onChange={e => setTransferData({ ...transferData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => { setActiveForm(null); setTransferData({ product_id: '', to_participant_id: '', notes: '' }) }} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition">Cancel</button>
                                <button type="submit" className={`flex-1 ${activeForm === 'transfer_jeweller' ? 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black' : 'bg-green-600 hover:bg-green-500 text-white'} font-black py-4 rounded-2xl transition shadow-xl active:scale-95 uppercase text-xs tracking-widest`}>
                                    {activeForm === 'transfer_jeweller' ? 'Ship to Store' : 'Verify & Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
