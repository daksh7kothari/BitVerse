import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const getBatches = async (req, res) => {
    try {
        // In real app, we might filter by user.id for Jewellers
        const { data, error } = await supabase
            .from('gold_batches')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const createBatch = async (req, res) => {
    try {
        const formData = req.body
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

        res.json(batch)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const transferBatch = async (req, res) => {
    try {
        const { batchId, recipient } = req.body

        // 1. Get current batch
        const { data: batch, error: fetchError } = await supabase
            .from('gold_batches')
            .select('*')
            .eq('id', batchId)
            .single()

        if (fetchError) throw fetchError

        // 2. Update owner
        const { error: updateError } = await supabase
            .from('gold_batches')
            .update({
                current_owner: recipient,
                hash: '0000x' + Math.random().toString(16).slice(2, 10)
            })
            .eq('id', batchId)

        if (updateError) throw updateError

        // 3. Add to history
        await supabase
            .from('batch_history')
            .insert([{
                batch_id: batchId,
                from_party: batch.current_owner,
                to_party: recipient,
                action: 'Ownership Transfer',
                transaction_date: new Date().toISOString().split('T')[0]
            }])

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getBatchHistory = async (req, res) => {
    try {
        const { id } = req.params
        const { data, error } = await supabase
            .from('batch_history')
            .select('*')
            .eq('batch_id', id)
            .order('created_at', { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
