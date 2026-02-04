import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function debugData() {
    console.log('--- Participants ---')
    const { data: participants } = await supabase.from('participants').select('*')
    console.table(participants)

    console.log('\n--- Products ---')
    const { data: products } = await supabase.from('products').select('*')
    console.table(products)

    console.log('\n--- Tokens ---')
    const { data: tokens } = await supabase.from('tokens').select('id, token_id, weight, status, current_owner_id')
    console.table(tokens)
}

debugData()
