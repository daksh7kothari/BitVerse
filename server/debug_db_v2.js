import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function debugData() {
    try {
        const { data: participants } = await supabase.from('participants').select('*')
        console.log('PARTICIPANTS_START')
        console.log(JSON.stringify(participants, null, 2))
        console.log('PARTICIPANTS_END')

        const { data: products } = await supabase.from('products').select('*')
        console.log('PRODUCTS_START')
        console.log(JSON.stringify(products, null, 2))
        console.log('PRODUCTS_END')

        const { data: tokens } = await supabase.from('tokens').select('id, token_id, weight, status, current_owner_id')
        console.log('TOKENS_START')
        console.log(JSON.stringify(tokens, null, 2))
        console.log('TOKENS_END')
    } catch (err) {
        console.error('Debug script failed:', err)
    }
}

debugData()
