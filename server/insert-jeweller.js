import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function insertJeweller() {
    try {
        const jewellerId = 'e3cf56b8-4dc0-4081-9069-2d34d55438e0'

        // Check if exists
        const { data: existing } = await supabase
            .from('participants')
            .select('id')
            .eq('id', jewellerId)
            .single()

        if (existing) {
            console.log('Jeweller already exists in database.')
            return
        }

        const { data, error } = await supabase
            .from('participants')
            .insert([{
                id: jewellerId,
                name: 'Luxury Gems Jewellers',
                role: 'jeweller',
                permissions: { transfer_token: true, view_own: true },
                active: true
            }])
            .select()

        if (error) {
            console.error('Insert Failed:', error.message)
            return
        }
        console.log('Jeweller inserted successfully!', data)

    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

insertJeweller()
