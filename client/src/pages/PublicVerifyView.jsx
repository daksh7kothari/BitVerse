import { useState } from 'react'
import { Search, CheckCircle2, QrCode, ShieldCheck, History, History as HistoryIcon, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function PublicVerifyView() {
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(false)

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .ilike('product_id', search)
        .maybeSingle()

      if (!productError && product) {
        setResult(product)
        setHistory([])
        return
      }

      const { data: batch, error: batchError } = await supabase
        .from('gold_batches')
        .select('*')
        .ilike('batch_id', search)
        .maybeSingle()

      if (batchError) throw batchError

      if (batch) {
        setResult(batch)
        const { data: historyData } = await supabase
          .from('batch_history')
          .select('*')
          .eq('batch_id', batch.id)
          .order('created_at', { ascending: true })
        setHistory(historyData || [])
      } else {
        setError(true)
        setResult(null)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-12 md:pt-24 selection:bg-gold selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-12 relative animate-slide-up">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl border border-white/5 transition flex items-center gap-3 group font-bold"
          >
            <HistoryIcon size={20} className="group-hover:rotate-[-45deg] transition duration-300" />
            Return Home
          </button>
          <div className="text-center md:text-right">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Gold <span className="text-gold">Verification</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Immutable BitVerse Ledger Access</p>
          </div>
        </header>

        {!result ? (
          <div className="glass-panel p-10 md:p-16 rounded-[3rem] border-white/5 shadow-2xl space-y-10">
            <div className="space-y-6 text-center">
              <h3 className="text-2xl font-bold">Trace Gold Provenance</h3>
              <p className="text-gray-400 max-w-md mx-auto">Enter the unique Token ID or Product ID to view the complete immutable history of your gold asset.</p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition" size={24} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. PROD-XXXX-XXXX"
                  className="w-full bg-black/40 border-2 border-white/5 rounded-[2rem] py-6 px-16 text-2xl text-white focus:outline-none focus:border-gold transition-all placeholder:text-gray-700 shadow-inner"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn-gold w-full text-xl py-6 rounded-[2rem] shadow-yellow-500/20"
              >
                {loading ? 'Consulting Ledger...' : 'Verify Authenticity'}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-center rounded-2xl font-bold animate-shake">
                Record not found in BitVerse ledger. Verify your ID input.
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4 cursor-pointer group">
                <div className="p-4 bg-gold/10 text-gold rounded-2xl group-hover:bg-gold group-hover:text-black transition-all">
                  <QrCode size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scan Certificate</span>
              </div>
              <div className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4 cursor-pointer group border-green-500/10 hover:border-green-500/40">
                <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl group-hover:bg-green-500 group-hover:text-white transition-all">
                  <ShieldCheck size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Audit Compliance</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            <div className="glass-panel p-1 md:p-2 rounded-[3.5rem] bg-gradient-to-br from-yellow-400/20 via-white/5 to-yellow-900/20 shadow-2xl">
              <div className="bg-black/90 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
                  <ShieldCheck size={400} />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-black mb-2 block">Verified Asset Identity</span>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">{result.product_id || result.batch_id}</h3>
                  </div>
                  <div className="bg-green-500/10 text-green-500 px-6 py-2 rounded-full flex items-center gap-3 text-sm font-black uppercase tracking-widest border border-green-500/30">
                    <CheckCircle2 size={20} /> Authentic & Certified
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 border-y border-white/5 py-12">
                  <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Weight (Net)</p>
                    <p className="text-3xl font-black text-white">{result.net_gold_weight || result.weight} <span className="text-sm font-normal text-gray-500">g</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Chemical Purity</p>
                    <p className="text-3xl font-black text-gold">{result.purity}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Mine Source</p>
                    <p className="text-2xl font-black text-white uppercase truncate">{result.source || 'Aggregated'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Mint Date</p>
                    <p className="text-2xl font-black text-white">{result.created_at?.split('T')[0]}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-gold">
                    <History size={18} /> Immutable Chain of Custody
                  </h4>
                  <div className="space-y-6 relative ml-4">
                    <div className="absolute left-[3px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-gold via-white/10 to-transparent opacity-30"></div>

                    {history.length > 0 ? history.map((h, i) => (
                      <div key={i} className="flex gap-8 items-start relative z-10 group">
                        <div className="mt-2 w-2 h-2 rounded-full bg-gold shadow-[0_0_15px_rgba(245,158,11,0.8)] border-2 border-black group-hover:scale-150 transition-transform"></div>
                        <div className="flex-1 glass-card p-6 rounded-2xl">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-black text-white uppercase tracking-tight">{h.action}</p>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock size={12} />
                              <span className="text-[10px] font-bold uppercase">{h.transaction_date}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">{h.from_party} <span className="text-gold mx-2">→</span> {h.to_party}</p>
                          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] font-mono text-gray-700 uppercase tracking-tighter">Auth Hash: {result.hash?.slice(0, 24) || 'OX-V1-LEDGER-HASH-IMMUTABLE'}...</span>
                            <ShieldCheck size={14} className="text-green-500/30" />
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="flex gap-8 items-start relative z-10 group">
                        <div className="mt-2 w-2 h-2 rounded-full bg-gold shadow-[0_0_15px_rgba(245,158,11,0.8)] border-2 border-black"></div>
                        <div className="flex-1 glass-card p-6 rounded-2xl">
                          <p className="text-sm font-black text-gold uppercase tracking-widest">Initial Issuance</p>
                          <p className="text-xs text-gray-500 mt-2 uppercase font-bold tracking-tight">Verified Batch Registry at Refiner Node</p>
                          <p className="text-[9px] font-mono text-gray-700 uppercase tracking-tighter mt-4 italic">No further transfer events recorded on chain.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setResult(null); setSearch(''); setHistory([]); }}
              className="w-full text-gray-500 hover:text-white transition font-black uppercase tracking-[0.3em] text-xs py-8"
            >
              Verify New Asset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
