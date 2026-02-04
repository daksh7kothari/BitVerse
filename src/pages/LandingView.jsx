import { ShieldCheck, QrCode, History, Lock, ArrowRight } from 'lucide-react'

export function LandingView({ onViewChange }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
        <div className="inline-block px-4 py-1.5 mb-4 border border-yellow-500/50 rounded-full text-yellow-500 text-sm font-medium tracking-wide">
          THE FUTURE OF GOLD TRUST
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
          GIVE GOLD A <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">DIGITAL BIRTH.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
          A tamper-proof identity for every gram of gold. From the deep mines to the customer's hand—certified, verified, and immutable.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8">
          <button onClick={() => onViewChange('public')} className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:scale-105 transition active:scale-95">
            Verify a Certificate
          </button>
          <button onClick={() => onViewChange('jeweller')} className="w-full md:w-auto px-8 py-4 bg-yellow-500 text-black font-bold rounded-full text-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
            Jeweller Portal <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 opacity-50 grayscale hover:grayscale-0 transition duration-500">
          <div className="flex flex-col items-center"><ShieldCheck size={32}/><span className="text-xs mt-2 uppercase">Tamper-Proof</span></div>
          <div className="flex flex-col items-center"><QrCode size={32}/><span className="text-xs mt-2 uppercase">QR Verified</span></div>
          <div className="flex flex-col items-center"><History size={32}/><span className="text-xs mt-2 uppercase">Full Custody</span></div>
          <div className="flex flex-col items-center"><Lock size={32}/><span className="text-xs mt-2 uppercase">Encrypted</span></div>
        </div>
      </div>
    </div>
  )
}
