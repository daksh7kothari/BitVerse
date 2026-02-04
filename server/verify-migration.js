import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log('🔗 Connecting to Supabase:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyMigration() {
    console.log('\n📊 Verifying Token Traceability System Migration\n')
    console.log('='.repeat(60))

    const expectedTables = [
        'participants',
        'tokens',
        'token_lineage',
        'token_transfers',
        'products',
        'product_token_composition',
        'wastage_logs',
        'wastage_thresholds',
        'audit_log'
    ]

    let allTablesExist = true

    for (const table of expectedTables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })

            if (error) {
                console.log(`❌ ${table.padEnd(30)} - NOT FOUND`)
                allTablesExist = false
            } else {
                console.log(`✅ ${table.padEnd(30)} - EXISTS (${count || 0} rows)`)
            }
        } catch (err) {
            console.log(`❌ ${table.padEnd(30)} - ERROR: ${err.message}`)
            allTablesExist = false
        }
    }

    console.log('='.repeat(60))

    if (allTablesExist) {
        console.log('\n✅ Migration successful! All 9 tables created.')

        // Check sample data
        console.log('\n📋 Checking sample data...\n')

        // Check participants
        const { data: participants } = await supabase
            .from('participants')
            .select('name, role')

        if (participants && participants.length > 0) {
            console.log('👥 Sample Participants:')
            participants.forEach(p => {
                console.log(`   - ${p.name} (${p.role})`)
            })
        }

        // Check wastage thresholds
        const { data: thresholds } = await supabase
            .from('wastage_thresholds')
            .select('operation_type, auto_approve_max, review_required_max')
            .order('operation_type')

        if (thresholds && thresholds.length > 0) {
            console.log('\n⚖️  Wastage Thresholds:')
            thresholds.forEach(t => {
                console.log(`   - ${t.operation_type.padEnd(12)} → auto: ≤${t.auto_approve_max}%, review: ≤${t.review_required_max}%`)
            })
        }

        console.log('\n🎉 Token Traceability System is ready!')
        console.log('\n📝 Next Steps:')
        console.log('   1. Restart the server: npm start')
        console.log('   2. Test endpoints with API client (Postman/Insomnia)')
        console.log('   3. Review walkthrough.md for test scenarios\n')

    } else {
        console.log('\n❌ Migration incomplete. Some tables are missing.')
        console.log('   Please run the SQL migration in Supabase dashboard.\n')
    }
}

verifyMigration()
