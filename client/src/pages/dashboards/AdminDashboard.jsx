import { Settings, Database, Users, BarChart3 } from 'lucide-react'

export const AdminDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 mb-8">System overview and configuration</p>

            {/* System Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm">Total Tokens</div>
                    <div className="text-3xl font-bold text-white">0</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm">Total Products</div>
                    <div className="text-3xl font-bold text-yellow-500">0</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm">Active Participants</div>
                    <div className="text-3xl font-bold text-green-500">4</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm">Total Gold</div>
                    <div className="text-3xl font-bold text-orange-500">0g</div>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Settings className="text-yellow-500" size={24} />
                        <h3 className="text-xl font-bold text-white">Wastage Thresholds</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                            <span>Casting:</span>
                            <span>2% / 3%</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                            <span>Handmade:</span>
                            <span>2% / 7%</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                            <span>Filigree:</span>
                            <span>2% / 10%</span>
                        </div>
                    </div>
                    <button className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition">
                        Configure Thresholds
                    </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="text-blue-500" size={24} />
                        <h3 className="text-xl font-bold text-white">Participants</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                        <div>🏭 1 Refiner</div>
                        <div>🔨 1 Craftsman</div>
                        <div>🧪 1 Lab</div>
                        <div>👑 1 Admin</div>
                    </div>
                    <button className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition">
                        Manage Participants
                    </button>
                </div>
            </div>

            {/* Audit Log */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="text-green-500" size={24} />
                    <h3 className="text-xl font-bold text-white">Recent Audit Log</h3>
                </div>
                <div className="text-center text-gray-500 py-8">
                    No activity yet. System is ready!
                </div>
            </div>
        </div>
    )
}
