import { useState } from 'react'
import { useSimpleAuth } from '../../context/SimpleAuthContext'
import { Coins, Send } from 'lucide-react'

export const RefinerDashboard = () => {
    const { user } = useSimpleAuth()
    const [showMintForm, setShowMintForm] = useState(false)

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Refiner Dashboard</h1>
            <p className="text-gray-400 mb-8">Mint and manage gold tokens</p>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => setShowMintForm(!showMintForm)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black p-6 rounded-xl font-bold flex items-center gap-3 transition"
                >
                    <Coins size={24} />
                    <span>Mint New Token</span>
                </button>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm">My Tokens</div>
                    <div className="text-3xl font-bold text-white">0</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm">Total Minted</div>
                    <div className="text-3xl font-bold text-yellow-500">0g</div>
                </div>
            </div>

            {/* Mint Form */}
            {showMintForm && (
                <div className="bg-gray-800/50 border border-yellow-500/30 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Mint New Token</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm mb-2">Gold Batch ID</label>
                            <input
                                type="text"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                placeholder="Select or enter batch ID"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-2">Weight (grams)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                placeholder="100.00"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-2">Owner</label>
                            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                                <option>Select participant...</option>
                                <option>Master Craftsman Ltd</option>
                                <option>Quality Lab Services</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="confirm" className="w-4 h-4" />
                            <label htmlFor="confirm" className="text-gray-300 text-sm">
                                I confirm this token creation (human confirmation required)
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition">
                                Mint Token
                            </button>
                            <button
                                onClick={() => setShowMintForm(false)}
                                className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Tokens */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">My Tokens</h3>
                <div className="text-center text-gray-500 py-8">
                    No tokens yet. Mint your first token to get started!
                </div>
            </div>
        </div>
    )
}
