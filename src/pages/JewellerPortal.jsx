import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { DashboardTab } from './JewellerPortal/DashboardTab'
import { CreateTab } from './JewellerPortal/CreateTab'
import { InventoryTab } from './JewellerPortal/InventoryTab'
import { LedgerTab } from './JewellerPortal/LedgerTab'
import { useBatches } from '../hooks/useBatches'
import { ROLES } from '../lib/constants'

export function JewellerPortal({ isSidebarOpen, setIsSidebarOpen }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { batches, loading, createBatch, transferOwnership, getBatchHistory } = useBatches()
  const [batchesWithHistory, setBatchesWithHistory] = useState([])

  useEffect(() => {
    const fetchAllHistory = async () => {
      const updated = await Promise.all(
        batches.map(async (batch) => ({
          ...batch,
          history: await getBatchHistory(batch.id)
        }))
      )
      setBatchesWithHistory(updated)
    }
    if (batches.length > 0) {
      fetchAllHistory()
    }
  }, [batches])

  const handleCreateBatch = async (formData) => {
    await createBatch(formData)
    setActiveTab('my-inventory')
  }

  const handleTransfer = async (batchId, recipient) => {
    await transferOwnership(batchId, recipient)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading inventory...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar
        role={ROLES.JEWELLER}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className="flex-1 md:ml-64 p-8 pt-24 min-h-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
        {activeTab === 'dashboard' && <DashboardTab batches={batchesWithHistory} />}
        {activeTab === 'create' && <CreateTab onCreateBatch={handleCreateBatch} />}
        {activeTab === 'my-inventory' && <InventoryTab batches={batchesWithHistory} onTransfer={handleTransfer} />}
        {activeTab === 'ledger' && <LedgerTab batches={batchesWithHistory} />}
      </main>
    </div>
  )
}
