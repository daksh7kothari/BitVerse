import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useBatches = () => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('gold_batches')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBatch = async (formData) => {
    try {
      const newBatchId = `BV-GOLD-${Math.floor(10000 + Math.random() * 90000)}`
      const hash = '0000x' + Math.random().toString(16).slice(2, 10)

      const { data: batchData, error: batchError } = await supabase
        .from('gold_batches')
        .insert([{
          batch_id: newBatchId,
          weight: formData.weight,
          purity: formData.purity,
          source: formData.source,
          refiner: formData.refiner,
          current_owner: formData.jeweller,
          status: 'Created',
          hash: hash
        }])
        .select()

      if (batchError) throw batchError

      const batch = batchData[0]

      await supabase
        .from('batch_history')
        .insert([{
          batch_id: batch.id,
          from_party: 'System',
          to_party: formData.refiner,
          action: 'Digital Birth',
          transaction_date: new Date().toISOString().split('T')[0]
        }])

      await fetchBatches()
      return batch
    } catch (error) {
      console.error('Error creating batch:', error)
      throw error
    }
  }

  const transferOwnership = async (batchId, recipient) => {
    try {
      const batch = batches.find(b => b.id === batchId)
      if (!batch) throw new Error('Batch not found')

      const { error: updateError } = await supabase
        .from('gold_batches')
        .update({
          current_owner: recipient,
          hash: '0000x' + Math.random().toString(16).slice(2, 10)
        })
        .eq('id', batchId)

      if (updateError) throw updateError

      await supabase
        .from('batch_history')
        .insert([{
          batch_id: batchId,
          from_party: batch.current_owner,
          to_party: recipient,
          action: 'Ownership Transfer',
          transaction_date: new Date().toISOString().split('T')[0]
        }])

      await fetchBatches()
    } catch (error) {
      console.error('Error transferring ownership:', error)
      throw error
    }
  }

  const getBatchHistory = async (batchId) => {
    try {
      const { data, error } = await supabase
        .from('batch_history')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: true })

      if (error) throw error
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
