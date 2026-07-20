# Database Seeding Guide

This guide explains how to populate your LumenZenith database with builders and properties data extracted from the hardcoded values.

## Data Extracted

### Builders (6 Total)
- **Prestige Group** - Luxury developer with 60+ projects
- **Brigade Group** - Urban living with 250+ projects  
- **Sobha Limited** - Quality leader with 100+ projects
- **Godrej Properties** - Sustainability-focused with 85+ projects
- **Puravankara** - Premium properties with 60+ projects
- **Embassy Group** - Mixed-use development with 45+ projects

### Properties (3 Total)
- **The Prestige City** (Sarjapur Road) - 2, 3, 4 BHK | ₹75L - ₹1.5Cr
- **Brigade Orchards** (Devanahalli) - 1, 2, 3 BHK | ₹60L - ₹1.2Cr
- **Sobha City** (Whitefield) - 2, 3, 4 BHK | ₹1.2Cr - ₹3Cr

## Seeding Methods

### Method 1: Command Line Script (Recommended)

The fastest and most reliable way to seed the database.

#### Prerequisites
- DATABASE_URL environment variable must be set
- Node.js installed
- All dependencies installed (`pnpm install`)

#### Steps

1. **Set DATABASE_URL** (if not already set):
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

2. **Run the seed script**:
```bash
pnpm seed
```

3. **Verify seeding**:
```bash
# Query builders
SELECT * FROM builder;

# Query properties
SELECT * FROM property;
```

#### What Happens
- Checks database connection
- Inserts 6 builders with all details (name, description, website, contact, email, tier, established year, total projects, certification status)
- Inserts 3 properties with complete information (name, locality, builder relationship, price range, BHK types, amenities, RERA numbers, unit counts)
- Skips duplicates if data already exists
- Provides clear feedback on each insertion

### Method 2: Server Action (From Web App)

You can trigger seeding from within the running application.

#### Implementation (Coming Soon)

Create an admin route or button that calls the server action:

```typescript
import { seedDatabase } from '@/app/actions/seed'

// In a client component or server action:
const result = await seedDatabase()
if (result.success) {
  console.log('✓ Database seeded successfully')
} else {
  console.error('✗ Seeding failed:', result.error)
}
```

### Method 3: Manual SQL (Neon Console)

You can manually insert data using the Neon console.

1. Open Neon console
2. Run SQL for builders:
```sql
INSERT INTO builder (id, name, description, website, contact, email, tier, established, "totalProjects", certified)
VALUES 
  (gen_random_uuid(), 'Prestige Group', '...', 'https://prestigeproperty.com', '+91-80-40616666', 'info@prestigeproperty.com', 'tier1', 1992, 60, true),
  -- ... (repeat for other builders)
```

## Data Schema

### builders Table
```sql
{
  id: uuid (Primary Key),
  name: string (Unique),
  description: string,
  website: string,
  contact: string,
  email: string,
  tier: enum ('tier1', 'tier2', 'tier3'),
  established: integer (year),
  totalProjects: integer,
  certified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### properties Table
```sql
{
  id: uuid (Primary Key),
  name: string (Unique),
  locality: string,
  builderId: uuid (Foreign Key → builders.id),
  address: string,
  description: string,
  bhkTypes: string (comma-separated: "1,2,3"),
  minPrice: decimal,
  maxPrice: decimal,
  status: enum ('available', 'sold-out', 'construction'),
  totalUnits: integer,
  soldUnits: integer,
  reraNumber: string,
  amenities: string,
  imageUrl: string (nullable),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Troubleshooting

### Error: "ENOENT: no such file or directory"
**Cause**: Script not found or incorrect path
**Solution**: Run from project root: `cd /vercel/share/v0-project && pnpm seed`

### Error: "Connection refused"
**Cause**: Database is not running or DATABASE_URL is incorrect
**Solution**: Check DATABASE_URL and ensure Neon database is active

### Error: "Unique constraint violation"
**Cause**: Data already exists in database
**Solution**: This is normal if seeding twice. The script skips duplicates automatically.

### Error: "undefined or null to object"
**Cause**: Database connection not initialized
**Solution**: Ensure DATABASE_URL is set in environment variables

## Verifying the Seed

After running the seed script, verify data was inserted:

```sql
-- Check builders
SELECT COUNT(*) as builder_count FROM builder;
-- Expected: 6

-- Check properties
SELECT COUNT(*) as property_count FROM property;
-- Expected: 3

-- View all builders
SELECT name, tier, "totalProjects", certified FROM builder ORDER BY "totalProjects" DESC;

-- View all properties with builder names
SELECT p.name, p.locality, b.name as builder, p."minPrice", p."maxPrice" 
FROM property p 
JOIN builder b ON p."builderId" = b.id;
```

## Customizing Seed Data

To modify the seed data:

1. **For Script Method**: Edit `/scripts/seed.js`
   - Modify `BUILDERS_DATA` or `PROPERTIES_DATA` arrays
   - Rerun: `pnpm seed`

2. **For Server Action Method**: Edit `/app/actions/seed.ts`
   - Modify `BUILDERS_DATA` or `PROPERTIES_DATA` arrays
   - Call the server action again

3. **For Manual Method**: Use Neon console to update/delete/insert

## Next Steps

After seeding:

1. ✅ Verify data in database
2. ✅ Test API endpoints: `/api/builders`, `/api/properties`
3. ✅ Check UI displays data correctly
4. ✅ Remove fallback data from API route files if desired

## Support

If you encounter issues:
1. Check DATABASE_URL environment variable is set
2. Verify database connection works
3. Check Neon console for table structure
4. Review script output for error details
5. Check debug logs: `tail -f user_read_only_context/v0_debug_logs.log`
