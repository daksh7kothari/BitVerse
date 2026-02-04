import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log('Testing connection to:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        // 1. Try Select
        const { data, error } = await supabase
            .from('gold_batches')
            .select('*')
            .limit(1)

        if (error) {
            console.error('Select Failed:', error.message)
            return
        }
        console.log('Select Success! Found records:', data.length)

        // 2. Try Insert (Mock)
        const testBatchId = `TEST-${Date.now()}`
        const { data: insertData, error: insertError } = await supabase
            .from('gold_batches')
            .insert([{
                batch_id: testBatchId,
                weight: '1g',
                purity: '24K',
                source: 'Test Script',
                refiner: 'Test Refiner',
                current_owner: 'Tester',
                status: 'Test',
                hash: 'test-hash'
            }])
            .select()

        if (insertError) {
            console.error('Insert Failed:', insertError.message)
        } else {
            console.log('Insert Success!', insertData)
        }

    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

testConnection()
