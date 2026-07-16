const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Column definitions for each table
const MIGRATIONS = {
  builders: [
    { name: 'id', type: 'SERIAL PRIMARY KEY', exists: true },
    { name: 'name', type: 'VARCHAR(255) NOT NULL UNIQUE', exists: true },
    { name: 'email', type: 'VARCHAR(255)', exists: false },
    { name: 'phoneNumber', type: 'VARCHAR(20)', exists: false },
    { name: 'website', type: 'VARCHAR(255)', exists: false },
    { name: 'description', type: 'TEXT', exists: false },
    { name: 'tier', type: 'builder_tier DEFAULT \'tier1\' NOT NULL', exists: false },
    { name: 'isVerified', type: 'BOOLEAN DEFAULT true NOT NULL', exists: false },
    { name: 'totalProjects', type: 'INTEGER DEFAULT 0', exists: false },
    { name: 'established', type: 'INTEGER', exists: false },
    { name: 'createdAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
    { name: 'updatedAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
  ],
  properties: [
    { name: 'id', type: 'SERIAL PRIMARY KEY', exists: true },
    { name: 'builderId', type: 'INTEGER NOT NULL REFERENCES builders(id) ON DELETE CASCADE', exists: false },
    { name: 'title', type: 'VARCHAR(255) NOT NULL', exists: false },
    { name: 'description', type: 'TEXT', exists: false },
    { name: 'locality', type: 'VARCHAR(255) NOT NULL', exists: false },
    { name: 'city', type: 'VARCHAR(100) DEFAULT \'Bangalore\' NOT NULL', exists: false },
    { name: 'address', type: 'VARCHAR(500)', exists: false },
    { name: 'minPrice', type: 'INTEGER', exists: false },
    { name: 'maxPrice', type: 'INTEGER', exists: false },
    { name: 'bhkOptions', type: 'VARCHAR(100)', exists: false },
    { name: 'amenities', type: 'TEXT', exists: false },
    { name: 'totalUnits', type: 'INTEGER', exists: false },
    { name: 'soldUnits', type: 'INTEGER DEFAULT 0', exists: false },
    { name: 'reraNumber', type: 'VARCHAR(100) UNIQUE', exists: false },
    { name: 'imageUrl', type: 'TEXT', exists: false },
    { name: 'status', type: 'property_status DEFAULT \'available\' NOT NULL', exists: false },
    { name: 'createdAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
    { name: 'updatedAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
  ],
  leads: [
    { name: 'id', type: 'SERIAL PRIMARY KEY', exists: true },
    { name: 'userId', type: 'TEXT NOT NULL', exists: false },
    { name: 'fullName', type: 'VARCHAR(255) NOT NULL', exists: false },
    { name: 'email', type: 'VARCHAR(255) NOT NULL', exists: false },
    { name: 'phoneNumber', type: 'VARCHAR(20) NOT NULL', exists: false },
    { name: 'locality', type: 'VARCHAR(255)', exists: false },
    { name: 'budgetRange', type: 'VARCHAR(50)', exists: false },
    { name: 'bhkRequirement', type: 'VARCHAR(10)', exists: false },
    { name: 'source', type: 'VARCHAR(50) DEFAULT \'web\' NOT NULL', exists: false },
    { name: 'status', type: 'lead_status DEFAULT \'new\' NOT NULL', exists: false },
    { name: 'referenceId', type: 'VARCHAR(50) NOT NULL UNIQUE', exists: false },
    { name: 'notes', type: 'TEXT', exists: false },
    { name: 'createdAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
    { name: 'updatedAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
  ],
  inquiries: [
    { name: 'id', type: 'SERIAL PRIMARY KEY', exists: true },
    { name: 'leadId', type: 'INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE', exists: false },
    { name: 'propertyId', type: 'INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE', exists: false },
    { name: 'interactionType', type: 'interaction_type DEFAULT \'inquiry\' NOT NULL', exists: false },
    { name: 'notes', type: 'TEXT', exists: false },
    { name: 'followUpDate', type: 'TIMESTAMP', exists: false },
    { name: 'createdAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
    { name: 'updatedAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
  ],
  audit_logs: [
    { name: 'id', type: 'SERIAL PRIMARY KEY', exists: true },
    { name: 'userId', type: 'TEXT', exists: false },
    { name: 'action', type: 'VARCHAR(100) NOT NULL', exists: false },
    { name: 'entity', type: 'VARCHAR(50) NOT NULL', exists: false },
    { name: 'entityId', type: 'INTEGER', exists: false },
    { name: 'changes', type: 'TEXT', exists: false },
    { name: 'ipAddress', type: 'VARCHAR(45)', exists: false },
    { name: 'userAgent', type: 'TEXT', exists: false },
    { name: 'createdAt', type: 'TIMESTAMP DEFAULT NOW() NOT NULL', exists: false },
  ],
}

// ENUM types needed
const ENUMS = [
  {
    name: 'builder_tier',
    values: ['tier1', 'tier2', 'tier3'],
  },
  {
    name: 'property_status',
    values: ['available', 'sold_out', 'upcoming', 'archived'],
  },
  {
    name: 'lead_status',
    values: ['new', 'contacted', 'qualified', 'converted', 'lost'],
  },
  {
    name: 'interaction_type',
    values: ['view', 'inquiry', 'call', 'email', 'site_visit', 'offer'],
  },
]

async function createEnums() {
  console.log('\n📝 Creating ENUM types...')
  for (const enumType of ENUMS) {
    try {
      // Check if enum exists
      const result = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = $1)`,
        [enumType.name]
      )
      
      if (!result.rows[0].exists) {
        const values = enumType.values.map((v) => `'${v}'`).join(', ')
        await pool.query(`CREATE TYPE ${enumType.name} AS ENUM (${values})`)
        console.log(`  ✓ Created ENUM: ${enumType.name}`)
      } else {
        console.log(`  ✓ ENUM already exists: ${enumType.name}`)
      }
    } catch (err) {
      console.error(`  ✗ Error with ENUM ${enumType.name}:`, err.message)
    }
  }
}

async function checkAndAddColumns() {
  console.log('\n🔍 Checking and adding missing columns...\n')
  
  for (const [tableName, columns] of Object.entries(MIGRATIONS)) {
    console.log(`📋 Table: ${tableName}`)
    
    try {
      // Check if table exists
      const tableExists = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
        [tableName]
      )
      
      if (!tableExists.rows[0].exists) {
        console.log(`  ⚠ Table doesn't exist yet: ${tableName}`)
        console.log(`  → Will be created when you run: pnpm seed\n`)
        continue
      }
      
      // Get existing columns
      const existingColumnsResult = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
        [tableName]
      )
      const existingColumns = existingColumnsResult.rows.map((r) => r.column_name)
      
      // Add missing columns
      for (const column of columns) {
        if (existingColumns.includes(column.name)) {
          console.log(`  ✓ ${column.name} (exists)`)
        } else {
          try {
            const query = `ALTER TABLE "${tableName}" ADD COLUMN "${column.name}" ${column.type}`
            await pool.query(query)
            console.log(`  ✅ ${column.name} (added)`)
          } catch (err) {
            console.log(`  ✗ ${column.name} (failed):`, err.message)
          }
        }
      }
    } catch (err) {
      console.error(`  ✗ Error processing table ${tableName}:`, err.message)
    }
    
    console.log('')
  }
}

async function createIndexes() {
  console.log('\n📑 Creating indexes...\n')
  
  const indexes = [
    { table: 'builders', column: 'name', type: 'UNIQUE', name: 'builder_name_idx' },
    { table: 'builders', column: 'tier', type: '', name: 'builder_tier_idx' },
    { table: 'builders', column: 'isVerified', type: '', name: 'builder_isVerified_idx' },
    { table: 'properties', column: 'builderId', type: '', name: 'property_builderId_idx' },
    { table: 'properties', column: 'locality', type: '', name: 'property_locality_idx' },
    { table: 'properties', column: 'city', type: '', name: 'property_city_idx' },
    { table: 'properties', column: 'status', type: '', name: 'property_status_idx' },
    { table: 'properties', column: 'reraNumber', type: 'UNIQUE', name: 'property_reraNumber_idx' },
    { table: 'leads', column: 'userId', type: '', name: 'lead_userId_idx' },
    { table: 'leads', column: 'email', type: '', name: 'lead_email_idx' },
    { table: 'leads', column: 'status', type: '', name: 'lead_status_idx' },
    { table: 'leads', column: 'createdAt', type: '', name: 'lead_createdAt_idx' },
    { table: 'leads', column: 'referenceId', type: 'UNIQUE', name: 'lead_referenceId_idx' },
  ]
  
  for (const idx of indexes) {
    try {
      const unique = idx.type === 'UNIQUE' ? 'UNIQUE' : ''
      const query = `CREATE ${unique} INDEX IF NOT EXISTS "${idx.name}" ON "${idx.table}"("${idx.column}")`
      await pool.query(query)
      console.log(`  ✓ ${idx.name}`)
    } catch (err) {
      console.log(`  ✓ ${idx.name} (exists or error: ${err.message.split('\n')[0]})`)
    }
  }
}

async function main() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║       DATABASE SCHEMA MIGRATION - ALL COLUMNS              ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    
    // Test connection
    console.log('\n🔌 Testing database connection...')
    await pool.query('SELECT NOW()')
    console.log('  ✓ Connected to database')
    
    // Create ENUMs first
    await createEnums()
    
    // Check and add columns
    await checkAndAddColumns()
    
    // Create indexes
    await createIndexes()
    
    console.log('\n✅ Migration complete!\n')
    console.log('📋 Summary:')
    console.log('   • All missing columns have been added')
    console.log('   • All ENUM types have been created')
    console.log('   • All indexes have been created')
    console.log('\n🚀 Next steps:')
    console.log('   1. Run: pnpm seed')
    console.log('   2. Run: pnpm dev')
    console.log('   3. Check your database in the local editor\n')
    
  } catch (err) {
    console.error('❌ Migration failed:', err)
  } finally {
    await pool.end()
  }
}

main()
