import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const MOCK_PARTICIPANTS = [
    { id: '9f53546e-67a2-4d0e-bd43-131479a64c62', name: 'Gold Refinery Inc', role: 'refiner', permissions: { mint_token: true, merge_token: true, transfer_token: true, view_own: true }, active: true },
    { id: 'b3cf56b8-4dc0-4081-9069-2d34d55438e0', name: 'Master Craftsman Ltd', role: 'craftsman', permissions: { split_token: true, merge_token: true, log_wastage: true, transfer_token: true, create_product: true, view_own: true }, active: true },
    { id: '3fb85466-33f9-4ca8-a995-2bf27528e808', name: 'Quality Lab Services', role: 'lab', permissions: { approve_wastage: true, view_all: true }, active: true },
    { id: '505377c0-cb91-474f-9806-fc305ddc0078', name: 'BitVerse Admin', role: 'admin', permissions: { mint_token: true, split_token: true, merge_token: true, transfer_token: true, approve_wastage: true, update_thresholds: true, view_all: true, create_product: true }, active: true },
    { id: 'e3cf56b8-4dc0-4081-9069-2d34d55438e0', name: 'Luxury Gems Jewellers', role: 'admin', permissions: { transfer_token: true, view_own: true }, active: true }
]

const sync = async () => {
    for (const p of MOCK_PARTICIPANTS) {
        const { data, error } = await supabase.from('participants').upsert(p)
        console.log(`Syncing ${p.role}:`, error ? error.message : 'SUCCESS')
    }
}
sync()
