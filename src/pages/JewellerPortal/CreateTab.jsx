import { useState } from 'react'
import { PURITY_OPTIONS, INITIAL_OWNER } from '../../lib/constants'

export function CreateTab({ onCreateBatch }) {
  const [newBatch, setNewBatch] = useState({
    weight: '',
    purity: '24K',
    source: '',
    refiner: 'Global Refining Corp',
    jeweller: INITIAL_OWNER
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!newBatch.weight || !newBatch.source) {
      setError('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onCreateBatch(newBatch)
      setNewBatch({
        weight: '',
        purity: '24K',
        source: '',
        refiner: 'Global Refining Corp',
        jeweller: INITIAL_OWNER
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto glass-panel p-8 rounded-[2.5rem] space-y-8 animate-slide-up relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>

      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">New Identity</h3>
        <p className="text-gray-400 text-sm">Register a new batch of gold into the BitVerse registry.</p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-gold-500 font-bold ml-1 tracking-widest">Weight *</label>
            <input
              type="text"
              placeholder="e.g. 100g"
              value={newBatch.weight}
              onChange={(e) => setNewBatch({ ...newBatch, weight: e.target.value })}
              className="w-full bg-rich-black-800 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition placeholder:text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-gold-500 font-bold ml-1 tracking-widest">Purity</label>
            <div className="relative">
              <select
                value={newBatch.purity}
                onChange={(e) => setNewBatch({ ...newBatch, purity: e.target.value })}
                className="w-full bg-rich-black-800 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition appearance-none"
              >
                {PURITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-gold-500 font-bold ml-1 tracking-widest">Origin / Mine *</label>
          <input
            type="text"
            placeholder="Source Mine Name"
            value={newBatch.source}
            onChange={(e) => setNewBatch({ ...newBatch, source: e.target.value })}
            className="w-full bg-rich-black-800 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition placeholder:text-gray-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-gray-600 font-bold ml-1 tracking-widest">Refiner Name</label>
          <input
            type="text"
            value={newBatch.refiner}
            readOnly
            className="w-full bg-rich-black-900/50 border border-white/5 rounded-xl p-4 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
      >
        {loading ? 'Generating Identity...' : 'Generate Digital Identity'}
      </button>
    </div>
  )
}
