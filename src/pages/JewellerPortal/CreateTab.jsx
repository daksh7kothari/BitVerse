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
    <div className="max-w-xl mx-auto bg-zinc-900 p-8 rounded-3xl border border-white/5 space-y-6 animate-in slide-in-from-bottom-4">
      <h3 className="text-2xl font-bold">New Digital Birth Certificate</h3>
      <p className="text-gray-400 text-sm">Register a new batch of gold into the BitVerse registry.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-bold ml-1">Weight *</label>
            <input
              type="text"
              placeholder="e.g. 100g"
              value={newBatch.weight}
              onChange={(e) => setNewBatch({...newBatch, weight: e.target.value})}
              className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-yellow-500 transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-bold ml-1">Purity</label>
            <select
              value={newBatch.purity}
              onChange={(e) => setNewBatch({...newBatch, purity: e.target.value})}
              className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-yellow-500 transition appearance-none"
            >
              {PURITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase text-gray-500 font-bold ml-1">Origin / Mine *</label>
          <input
            type="text"
            placeholder="Source Mine Name"
            value={newBatch.source}
            onChange={(e) => setNewBatch({...newBatch, source: e.target.value})}
            className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-yellow-500 transition"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase text-gray-500 font-bold ml-1">Refiner Name</label>
          <input
            type="text"
            value={newBatch.refiner}
            readOnly
            className="w-full bg-black border border-white/10 rounded-xl p-3 cursor-not-allowed opacity-60"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition"
      >
        {loading ? 'Generating...' : 'Generate Identity'}
      </button>
    </div>
  )
}
