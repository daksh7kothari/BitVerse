import { Scissors, Layers, Package } from 'lucide-react'

export const CraftsmanDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Craftsman Dashboard</h1>
            <p className="text-gray-400 mb-8">Split tokens and create products</p>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <button className="bg-purple-500 hover:bg-purple-400 text-white p-6 rounded-xl font-bold flex items-center gap-3 transition">
                    <Scissors size={24} />
                    <span>Split Token</span>
                </button>
                <button className="bg-blue-500 hover:bg-blue-400 text-white p-6 rounded-xl font-bold flex items-center gap-3 transition">
                    <Layers size={24} />
                    <span>Merge Tokens</span>
                </button>
                <button className="bg-green-500 hover:bg-green-400 text-white p-6 rounded-xl font-bold flex items-center gap-3 transition">
                    <Package size={24} />
                    <span>Create Product</span>
                </button>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm">My Tokens</div>
                    <div className="text-3xl font-bold text-white">0</div>
                </div>
            </div>

            {/* My Tokens */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Active Tokens</h3>
                <div className="text-center text-gray-500 py-8">
                    No active tokens. Request transfer from refiner to begin crafting.
                </div>
            </div>

            {/* My Products */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Created Products</h3>
                <div className="text-center text-gray-500 py-8">
                    No products created yet.
                </div>
            </div>
        </div>
    )
}
