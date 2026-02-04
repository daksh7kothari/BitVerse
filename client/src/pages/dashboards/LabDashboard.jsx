import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export const LabDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lab Dashboard</h1>
            <p className="text-gray-400 mb-8">Review and approve wastage logs</p>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-yellow-500" size={20} />
                        <span className="text-yellow-300 text-sm">Pending Review</span>
                    </div>
                    <div className="text-3xl font-bold text-white">0</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-green-300 text-sm">Approved</span>
                    </div>
                    <div className="text-3xl font-bold text-white">0</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-red-500" size={20} />
                        <span className="text-red-300 text-sm">Flagged</span>
                    </div>
                    <div className="text-3xl font-bold text-white">0</div>
                </div>
            </div>

            {/* Pending Wastage Logs */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Wastage Logs Pending Approval</h3>
                <div className="text-center text-gray-500 py-8">
                    No pending wastage logs to review.
                </div>
            </div>
        </div>
    )
}
