import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function listParticipants() {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('*')

        if (error) {
            console.error('Select Failed:', error.message)
            return
        }
        console.log('Participants Header:', ['id', 'name', 'role'])
        data.forEach(p => {
            console.log([p.id, p.name, p.role])
        })

    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

listParticipants()
