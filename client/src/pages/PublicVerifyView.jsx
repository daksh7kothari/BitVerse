import { useState } from 'react'
import { Search, CheckCircle2, QrCode, ShieldCheck, History } from 'lucide-react'
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
      const { data: batch, error: batchError } = await supabase
        .from('gold_batches')
        .select('*')
        .ilike('batch_id', search)
        .maybeSingle()

      if (batchError) throw batchError

      if (batch) {
        setResult(batch)
        setError(false)

        const { data: historyData, error: historyError } = await supabase
          .from('batch_history')
          .select('*')
          .eq('batch_id', batch.id)
          .order('created_at', { ascending: true })

        if (historyError) throw historyError
        setHistory(historyData || [])
      } else {
        setResult(null)
        setError(true)
      }
    } catch (err) {
      console.error('Error searching:', err)
      setError(true)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-white p-6 pt-24">
      <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold mb-2">Public Verification Portal</h2>
          <p className="text-gray-400">Scan QR or enter BitVerse ID to verify authenticity</p>
        </div>

        {!result ? (
          <div className="glass-panel p-8 rounded-3xl">
            <div className="space-y-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. BV-GOLD-77291"
                className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-xl text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition placeholder:text-gray-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-yellow-500 text-black px-6 py-4 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Searching...' : 'Verify Certificate'}
              </button>
            </div>
            {error && <p className="text-red-400 text-center text-sm font-medium animate-pulse mt-4">Record not found. This might be an uncertified batch.</p>}

            <div className="mt-8 border-t border-white/5 pt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl flex flex-col items-center gap-2 cursor-pointer border border-transparent hover:border-gold-500/30 hover:bg-gold-500/5 transition group">
                <QrCode size={40} className="text-gold-500 group-hover:scale-110 transition duration-300" />
                <span className="text-sm">Scan QR Code</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex flex-col items-center gap-2 border border-transparent hover:border-green-500/30 hover:bg-green-500/5 transition group">
                <ShieldCheck size={40} className="text-green-500 group-hover:scale-110 transition duration-300" />
                <span className="text-sm">Instant Audit</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="p-0.5 rounded-[2rem] bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
              <div className="bg-rich-black-900 rounded-[1.95rem] p-8 backdrop-blur-3xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-gold-500 font-bold mb-1 block">Verified Gold Identity</span>
                    <h3 className="text-4xl font-black tracking-tight">{result.batch_id}</h3>
                  </div>
                  <div className="bg-green-500/10 text-green-500 p-2 rounded-full flex items-center gap-2 px-4 py-1 text-sm font-bold border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={16} /> Authentic
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Weight</p>
                    <p className="text-xl font-medium">{result.weight}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Purity</p>
                    <p className="text-xl font-medium">{result.purity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Source / Mine</p>
                    <p className="text-xl font-medium">{result.source}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Birth Date</p>
                    <p className="text-xl font-medium">{result.created_at?.split('T')[0]}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-gold-500">
                    <History size={16} /> Chain of Custody
                  </h4>
                  <div className="space-y-4 relative">
                    <div className="absolute left-[3.5px] top-2 bottom-2 w-0.5 bg-white/10"></div>
                    {history.map((h, i) => (
                      <div key={i} className="flex gap-4 items-start relative z-10">
                        <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.8)] border border-black"></div>
                        <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-gold-500/30 transition">
                          <p className="text-sm font-bold text-white">{h.action}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{h.from_party} → {h.to_party}</p>
                          <p className="text-[10px] text-gray-600 mt-2 uppercase font-bold tracking-tighter flex items-center justify-between">
                            <span>{h.transaction_date}</span>
                            <span className="font-mono opacity-50">{result.hash.slice(0, 10)}...</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => { setResult(null); setSearch(''); setHistory([]); }} className="w-full text-gray-500 hover:text-white transition font-bold py-4">Verify Another Batch</button>
          </div>
        )}
      </div>
    </div>
  )
}
