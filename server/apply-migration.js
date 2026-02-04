import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log('🔗 Connecting to Supabase:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '../supabase/migrations/20260205_token_traceability_system.sql')
        console.log('📄 Reading migration file:', migrationPath)

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

        console.log('⚙️  Applying migration...')
        console.log('   This will create 9 tables and 3 database functions\n')

        // Execute the migration
        // Note: Supabase client doesn't support direct SQL execution in client mode
        // We need to use the SQL editor in dashboard or use service role key

        console.log('❌ Direct SQL execution not supported with anon key')
        console.log('\n📋 MANUAL MIGRATION STEPS:')
        console.log('1. Go to: https://romuvpbdyiklfhdzmxez.supabase.co/project/romuvpbdyiklfhdzmxez/sql')
        console.log('2. Click "New Query"')
        console.log('3. Copy the contents of:')
        console.log(`   ${migrationPath}`)
        console.log('4. Paste into the SQL editor')
        console.log('5. Click "Run"\n')

        console.log('📝 Migration file contains:')
        console.log('   - 9 tables (participants, tokens, lineage, transfers, products, composition, wastage_logs, thresholds, audit_log)')
        console.log('   - 3 functions (calculate_token_ancestry, validate_mass_balance, get_wastage_approval_status)')
        console.log('   - Indexes, RLS policies, triggers')
        console.log('   - 4 sample participants')
        console.log('   - 6 wastage threshold configurations\n')

        // Alternative: Show how to verify tables after manual migration
        console.log('✅ After running the migration, verify with this script:')
        console.log('   node verify-migration.js\n')

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

applyMigration()
