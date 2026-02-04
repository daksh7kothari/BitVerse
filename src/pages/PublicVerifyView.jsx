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
    <div className="min-h-screen bg-zinc-950 text-white p-6 pt-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Public Verification Portal</h2>
          <p className="text-gray-400">Scan QR or enter BitVerse ID to verify authenticity</p>
        </div>

        {!result ? (
          <div className="bg-zinc-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="relative mb-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. BV-GOLD-77291"
                className="w-full bg-black border border-white/20 rounded-2xl py-4 px-6 text-xl focus:outline-none focus:border-yellow-500 transition"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-yellow-500 text-black px-6 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Verify'}
              </button>
            </div>
            {error && <p className="text-red-400 text-center text-sm font-medium">Record not found. This might be an uncertified batch.</p>}

            <div className="mt-8 border-t border-white/5 pt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl flex flex-col items-center gap-2 cursor-pointer border border-transparent hover:border-yellow-500/50">
                <QrCode size={40} className="text-yellow-500" />
                <span className="text-sm">Scan QR Code</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex flex-col items-center gap-2">
                <ShieldCheck size={40} className="text-green-500" />
                <span className="text-sm">Instant Audit</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-0.5 rounded-[2rem]">
              <div className="bg-zinc-900 rounded-[1.95rem] p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-yellow-500 font-bold">Verified Gold Identity</span>
                    <h3 className="text-4xl font-black">{result.batch_id}</h3>
                  </div>
                  <div className="bg-green-500/10 text-green-500 p-2 rounded-full flex items-center gap-2 px-4 py-1 text-sm font-bold border border-green-500/50">
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

                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History size={16} /> Chain of Custody
                  </h4>
                  <div className="space-y-4">
                    {history.map((h, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">{h.action}</p>
                          <p className="text-xs text-gray-400">{h.from_party} → {h.to_party}</p>
                          <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-tighter">{h.transaction_date} • Encrypted Hash: {result.hash}</p>
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
