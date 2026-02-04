import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  QrCode,
  History,
  UserCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  LayoutDashboard,
  Coins,
  MapPin,
  FileText,
  Menu,
  X,
  Database
} from 'lucide-react';

const APP_ID = "bitverse-mvp-1";

// --- Mock Data & Helpers ---
const INITIAL_BATCHES = [
  {
    id: "BV-GOLD-77291",
    weight: "500g",
    purity: "24K",
    source: "South Deep Mine, SA",
    date: "2023-10-15",
    refiner: "Valcambi SA",
    currentOwner: "Prestige Jewellers",
    status: "In Stock",
    history: [
      { from: "South Deep Mine", to: "Valcambi SA", date: "2023-10-15", action: "Mining & Refining" },
      { from: "Valcambi SA", to: "Prestige Jewellers", date: "2023-11-02", action: "Wholesale Purchase" }
    ],
    hash: "0000x8f2e...4a1b"
  }
];

const ROLES = {
  ADMIN: 'admin',
  JEWELLER: 'jeweller',
  PUBLIC: 'public'
};

const App = () => {
  const [view, setView] = useState('landing'); // landing, admin, jeweller, public, verify
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Functions ---
  const createBatch = (formData) => {
    const newId = `BV-GOLD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBatch = {
      ...formData,
      id: newId,
      status: "Created",
      history: [{
        from: "System",
        to: formData.refiner,
        date: new Date().toISOString().split('T')[0],
        action: "Digital Birth"
      }],
      hash: "0000x" + Math.random().toString(16).slice(2, 10)
    };
    setBatches([newBatch, ...batches]);
    setActiveTab('my-inventory');
  };

  const transferOwnership = (batchId, recipient) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        const newHistory = [
          ...batch.history,
          {
            from: batch.currentOwner,
            to: recipient,
            date: new Date().toISOString().split('T')[0],
            action: "Ownership Transfer"
          }
        ];
        return { ...batch, currentOwner: recipient, history: newHistory, hash: "0000x" + Math.random().toString(16).slice(2, 10) };
      }
      return batch;
    }));
  };

  // --- Components ---

  const Navbar = () => (
    <nav className="bg-black text-white p-4 flex justify-between items-center border-b border-yellow-500/30 sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
        <div className="bg-yellow-500 p-1.5 rounded-lg">
          <ShieldCheck className="text-black" size={24} />
        </div>
        <span className="font-bold text-xl tracking-tighter italic">BIT<span className="text-yellow-500 underline">VERSE</span></span>
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <button onClick={() => setView('public')} className="text-sm hover:text-yellow-500 transition">Public Verify</button>
        <button onClick={() => setView('jeweller')} className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-yellow-400 transition">
          Jeweller Portal
        </button>
        <button onClick={() => setView('admin')} className="text-gray-400 hover:text-white"><UserCircle /></button>
      </div>
      <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu /></button>
    </nav>
  );

  const Sidebar = ({ role }) => (
    <div className={`fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-white/10 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out z-40 pt-20 px-4`}>
      <div className="space-y-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        {role === ROLES.JEWELLER && (
          <>
            <button
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'create' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <PlusCircle size={20} /> Birth Certificate
            </button>
            <button
              onClick={() => setActiveTab('my-inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'my-inventory' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Coins size={20} /> My Inventory
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('ledger')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'ledger' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Database size={20} /> Blockchain Ledger
        </button>
      </div>
    </div>
  );

  // --- Views ---

  const LandingView = () => (
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
          <button onClick={() => setView('public')} className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:scale-105 transition active:scale-95">
            Verify a Certificate
          </button>
          <button onClick={() => setView('jeweller')} className="w-full md:w-auto px-8 py-4 bg-yellow-500 text-black font-bold rounded-full text-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
            Jeweller Portal <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 opacity-50 grayscale hover:grayscale-0 transition duration-500">
          <div className="flex flex-col items-center"><ShieldCheck size={32} /><span className="text-xs mt-2 uppercase">Tamper-Proof</span></div>
          <div className="flex flex-col items-center"><QrCode size={32} /><span className="text-xs mt-2 uppercase">QR Verified</span></div>
          <div className="flex flex-col items-center"><History size={32} /><span className="text-xs mt-2 uppercase">Full Custody</span></div>
          <div className="flex flex-col items-center"><Lock size={32} /><span className="text-xs mt-2 uppercase">Encrypted</span></div>
        </div>
      </div>
    </div>
  );

  const PublicVerifyView = () => {
    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(false);

    const handleSearch = () => {
      const batch = batches.find(b => b.id.toLowerCase() === search.toLowerCase());
      if (batch) {
        setResult(batch);
        setError(false);
      } else {
        setResult(null);
        setError(true);
      }
    };

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
                  placeholder="e.g. BV-GOLD-77291"
                  className="w-full bg-black border border-white/20 rounded-2xl py-4 px-6 text-xl focus:outline-none focus:border-yellow-500 transition"
                />
                <button onClick={handleSearch} className="absolute right-2 top-2 bottom-2 bg-yellow-500 text-black px-6 rounded-xl font-bold">
                  Verify
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
                      <h3 className="text-4xl font-black">{result.id}</h3>
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
                      <p className="text-xl font-medium">{result.date}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <History size={16} /> Chain of Custody
                    </h4>
                    <div className="space-y-4">
                      {result.history.map((h, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">{h.action}</p>
                            <p className="text-xs text-gray-400">{h.from} → {h.to}</p>
                            <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-tighter">{h.date} • Encrypted Hash: {result.hash}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setResult(null)} className="w-full text-gray-500 hover:text-white transition font-bold py-4">Verify Another Batch</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const JewellerPortal = () => {
    const [newBatch, setNewBatch] = useState({
      weight: '',
      purity: '24K',
      source: '',
      refiner: 'Global Refining Corp',
      jeweller: 'My Shop'
    });

    const DashboardTab = () => (
      <div className="space-y-8 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-sm">Total Assets</p>
            <h4 className="text-3xl font-bold">{batches.filter(b => b.currentOwner === 'Prestige Jewellers').length} Units</h4>
          </div>
          <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-sm">Certified Weight</p>
            <h4 className="text-3xl font-bold">12.45 Kg</h4>
          </div>
          <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-sm">Pending Transfers</p>
            <h4 className="text-3xl font-bold text-yellow-500">2 Actions</h4>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {batches.slice(0, 3).map(b => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                    <ShieldCheck />
                  </div>
                  <div>
                    <p className="font-bold">{b.id}</p>
                    <p className="text-xs text-gray-500">{b.weight} • {b.purity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{b.status}</p>
                  <p className="text-xs text-gray-500">{b.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const CreateTab = () => (
      <div className="max-w-xl mx-auto bg-zinc-900 p-8 rounded-3xl border border-white/5 space-y-6 animate-in slide-in-from-bottom-4">
        <h3 className="text-2xl font-bold">New Digital Birth Certificate</h3>
        <p className="text-gray-400 text-sm">Register a new batch of gold into the BitVerse registry.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase text-gray-500 font-bold ml-1">Weight</label>
              <input
                type="text"
                placeholder="e.g. 100g"
                className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-yellow-500 transition"
                onChange={(e) => setNewBatch({ ...newBatch, weight: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase text-gray-500 font-bold ml-1">Purity</label>
              <select
                className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-yellow-500 transition appearance-none"
                onChange={(e) => setNewBatch({ ...newBatch, purity: e.target.value })}
              >
                <option>24K</option>
                <option>22K</option>
                <option>18K</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-bold ml-1">Origin / Mine</label>
            <input
              type="text"
              placeholder="Source Mine Name"
              className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-yellow-500 transition"
              onChange={(e) => setNewBatch({ ...newBatch, source: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-bold ml-1">Refiner Name</label>
            <input
              type="text"
              className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-yellow-500 transition"
              value={newBatch.refiner}
              readOnly
            />
          </div>
        </div>

        <button
          onClick={() => createBatch(newBatch)}
          className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition"
        >
          Generate Identity
        </button>
      </div>
    );

    const InventoryTab = () => (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Current Assets</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input placeholder="Search ID..." className="bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batches.map(b => (
            <div key={b.id} className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-yellow-500 tracking-widest uppercase">Batch ID</span>
                    <h4 className="text-2xl font-black">{b.id}</h4>
                  </div>
                  <div className="bg-yellow-500/10 p-3 rounded-2xl group-hover:scale-110 transition duration-300">
                    <QrCode className="text-yellow-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div><p className="text-[10px] uppercase text-gray-500">Weight</p><p className="font-bold">{b.weight}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">Purity</p><p className="font-bold">{b.purity}</p></div>
                  <div><p className="text-[10px] uppercase text-gray-500">Owner</p><p className="font-bold text-xs truncate">{b.currentOwner}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const recipient = prompt("Enter Recipient Name (Customer or Jeweller):");
                    if (recipient) transferOwnership(b.id, recipient);
                  }} className="flex-1 bg-white text-black text-sm font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200">
                    Transfer <ArrowRight size={14} />
                  </button>
                  <button className="flex-1 bg-zinc-800 text-white text-sm font-bold py-2 rounded-xl hover:bg-zinc-700">
                    History
                  </button>
                </div>
              </div>
              <div className="bg-black/40 px-6 py-2 border-t border-white/5 text-[10px] text-gray-500 flex justify-between font-mono">
                <span>TX_ID: {b.hash}</span>
                <span>SECURE</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const LedgerTab = () => (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">Tamper-Proof Ledger</h3>
            <p className="text-gray-500 text-sm">Real-time immutable data stream. Any fraud attempts cause a hash mismatch.</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-green-500 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sync Complete
          </div>
        </div>

        <div className="bg-zinc-900 rounded-[2rem] border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">Block Hash</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">Transaction</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">Timestamp</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold">State</th>
              </tr>
            </thead>
            <tbody>
              {batches.flatMap(b => b.history.map((h, i) => ({ ...h, id: b.id, hash: b.hash, i }))).map((entry, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-xs text-yellow-500">
                      <Lock size={12} /> {entry.hash.slice(0, 15)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{entry.action}</p>
                    <p className="text-xs text-gray-500">{entry.id}: {entry.from} → {entry.to}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {entry.date} 14:02:{20 + idx}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar role={ROLES.JEWELLER} />
        <main className="flex-1 md:ml-64 p-8 pt-24 min-h-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'create' && <CreateTab />}
          {activeTab === 'my-inventory' && <InventoryTab />}
          {activeTab === 'ledger' && <LedgerTab />}
        </main>
      </div>
    );
  };

  const AdminPortal = () => (
    <div className="min-h-screen bg-black text-white p-8 pt-24 flex items-center justify-center">
      <div className="text-center space-y-4">
        <UserCircle size={64} className="mx-auto text-yellow-500" />
        <h2 className="text-3xl font-bold">Admin Headquarters</h2>
        <p className="text-gray-400 max-w-md">System-level controls for approving Miners, Refiners, and Jewellers into the BitVerse Trust Network.</p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
            <h4 className="text-2xl font-bold">14</h4>
            <p className="text-xs text-gray-500 uppercase">Verified Partners</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
            <h4 className="text-2xl font-bold">1,023</h4>
            <p className="text-xs text-gray-500 uppercase">Total Certs Issued</p>
          </div>
        </div>
        <button onClick={() => setView('jeweller')} className="mt-8 text-yellow-500 font-bold hover:underline">Switch to Jeweller View for Operations</button>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      <Navbar />
      {view === 'landing' && <LandingView />}
      {view === 'public' && <PublicVerifyView />}
      {view === 'jeweller' && <JewellerPortal />}
      {view === 'admin' && <AdminPortal />}

      {/* Footer Simulation */}
      {view !== 'landing' && (
        <footer className="bg-black border-t border-white/5 p-8 text-center text-gray-600 text-xs">
          <p>© 2024 BITVERSE FOUNDATION. ALL TRANSACTIONS RECORDED ON THE SECURE GOLD LEDGER.</p>
        </footer>
      )}
    </div>
  );
};

export default App;
