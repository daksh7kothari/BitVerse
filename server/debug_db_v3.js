import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function debugData() {
    try {
        const { data: participants } = await supabase.from('participants').select('*')
        const { data: products } = await supabase.from('products').select('*')
        const { data: tokens } = await supabase.from('tokens').select('id, token_id, weight, status, current_owner_id')

        const output = {
            participants,
            products,
            tokens
        }

        fs.writeFileSync('debug_output_v3.json', JSON.stringify(output, null, 2), 'utf-8')
        console.log('Successfully wrote debug_output_v3.json')
    } catch (err) {
        console.error('Debug script failed:', err)
    }
}

debugData()
