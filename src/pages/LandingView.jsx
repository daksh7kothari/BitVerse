import { ShieldCheck, QrCode, History, Lock, ArrowRight } from 'lucide-react'

export function LandingView({ onViewChange }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl space-y-8 animate-fade-in relative z-10">
        <div className="inline-block px-4 py-1.5 mb-4 border border-gold-500/30 bg-gold-500/10 rounded-full text-gold-400 text-xs font-bold tracking-[0.2em] shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          THE FUTURE OF GOLD TRUST
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none drop-shadow-2xl">
          GIVE GOLD A <br />
          <span className="text-gradient-gold drop-shadow-sm">DIGITAL BIRTH.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          A tamper-proof identity for every gram of gold. From the deep mines to the customer's hand—certified, verified, and immutable.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8">
          <button onClick={() => onViewChange('public')} className="w-full md:w-auto px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-bold rounded-full text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-xl">
            Verify a Certificate
          </button>
          <button onClick={() => onViewChange('jeweller')} className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-full text-lg hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl">
            Jeweller Portal <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 opacity-60">
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition duration-500 hover:scale-110 cursor-pointer">
            <div className="p-3 bg-gold-500/10 rounded-xl text-gold-400"><ShieldCheck size={24} /></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Tamper-Proof</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition duration-500 hover:scale-110 cursor-pointer">
            <div className="p-3 bg-gold-500/10 rounded-xl text-gold-400"><QrCode size={24} /></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">QR Verified</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition duration-500 hover:scale-110 cursor-pointer">
            <div className="p-3 bg-gold-500/10 rounded-xl text-gold-400"><History size={24} /></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Full Custody</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition duration-500 hover:scale-110 cursor-pointer">
            <div className="p-3 bg-gold-500/10 rounded-xl text-gold-400"><Lock size={24} /></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
