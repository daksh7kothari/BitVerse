import { useState, useEffect } from 'react'


export const useBatches = () => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/batches')
      if (!response.ok) throw new Error('Failed to fetch batches')
      const data = await response.json()
      setBatches(data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBatch = async (formData) => {
    try {
      const response = await fetch('http://localhost:3000/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create batch')
      const batch = await response.json()

      await fetchBatches()
      return batch
    } catch (error) {
      console.error('Error creating batch:', error)
      throw error
    }
  }

  const transferOwnership = async (batchId, recipient) => {
    try {
      const response = await fetch('http://localhost:3000/api/batches/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, recipient })
      })

      if (!response.ok) throw new Error('Failed to transfer ownership')

      await fetchBatches()
    } catch (error) {
      console.error('Error transferring ownership:', error)
      throw error
    }
  }

  const getBatchHistory = async (batchId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/batches/${batchId}/history`)
      if (!response.ok) throw new Error('Failed to fetch history')
      const data = await response.json()
      return data || []
    } catch (error) {
      console.error('Error fetching history:', error)
      return []
    }
  }

  return {
    batches,
    loading,
    createBatch,
    transferOwnership,
    getBatchHistory,
    refetch: fetchBatches
  }
}
