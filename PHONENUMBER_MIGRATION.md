# PhoneNumber Column Migration Guide

## Overview

This migration adds the `phoneNumber` column to the `builders` table in your Neon PostgreSQL database.

## Status

- **Schema Definition**: ✅ Already defined in `lib/db/schema.ts`
- **Seed Data**: ✅ Ready to use with phoneNumber
- **Migration Script**: ✅ Created and ready to run

## Quick Start

### Step 1: Set Environment Variable

```bash
export DATABASE_URL="postgresql://user:password@host/database"
```

### Step 2: Run Migration

```bash
pnpm migrate
```

**Expected Output:**
```
🔄 Starting migration: Add phoneNumber to builders table...

✓ phoneNumber column already exists in builders table
  OR
✓ Successfully added phoneNumber column to builders table

📋 Updated builders table structure:
   • id: integer (NOT NULL)
   • name: character varying (NOT NULL)
   • email: character varying (nullable)
   • phoneNumber: character varying (nullable)
   • website: character varying (nullable)
   • description: text (nullable)
   • tier: builder_tier (NOT NULL)
   • isVerified: boolean (NOT NULL)
   • totalProjects: integer (nullable)
   • established: integer (nullable)
   • createdAt: timestamp with time zone (NOT NULL)
   • updatedAt: timestamp with time zone (NOT NULL)

✅ Migration completed successfully!
```

### Step 3: Seed Database (Optional)

After migration, you can seed sample data:

```bash
pnpm seed
```

This will populate the 6 Tier-1 builders with all their phoneNumbers.

## Migration Details

**File**: `scripts/migrate-phoneNumber.js`

**What it does**:
1. Connects to your Neon PostgreSQL database
2. Checks if `phoneNumber` column exists in `builders` table
3. If missing, adds the column as `varchar(20)`
4. Shows updated table structure
5. Gracefully handles if column already exists

**Data Type**: `varchar(20)`
- Suitable for phone numbers in various formats
- Examples: `+91-80-40616666`, `+1-234-567-8900`

## Verification

To verify the migration was successful, run this in Neon console:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'builders' AND column_name = 'phoneNumber';

-- Expected result:
-- column_name  | data_type
-- ─────────────┼──────────
-- phoneNumber  | character varying
```

## Rollback (if needed)

If you need to remove the column:

```sql
ALTER TABLE "builders" DROP COLUMN "phoneNumber";
```

## Schema Definition

In `lib/db/schema.ts`, the builder table now includes:

```typescript
phoneNumber: varchar('phoneNumber', { length: 20 }),
```

## API Usage

After migration, all API endpoints that return builder data will include `phoneNumber`:

```json
{
  "id": 1,
  "name": "Prestige Group",
  "phoneNumber": "+91-80-40616666",
  "email": "info@prestigeproperty.com",
  "tier": "tier1",
  "totalProjects": 60,
  "established": 1992,
  "isVerified": true
}
```

## Seed Data

The seed script (`scripts/seed.js`) includes phoneNumbers for all 6 builders:

| Builder | Phone |
|---------|-------|
| Prestige Group | +91-80-40616666 |
| Brigade Group | +91-80-67616666 |
| Sobha Limited | +91-80-25716666 |
| Godrej Properties | +91-22-61151111 |
| Puravankara | +91-80-40156666 |
| Embassy Group | +91-80-46666666 |

## Safety

✅ **Safe to run multiple times**: The script checks if the column exists and skips if already present
✅ **Non-destructive**: Only adds the column, no data loss
✅ **Automatic**: No manual SQL editing needed

## Troubleshooting

### Error: "Connection refused"
- Verify DATABASE_URL is set correctly
- Check if Neon database is accessible

### Error: "Column already exists"
- This is fine! The column is already in the database
- You can proceed with seeding

### Column not appearing in schema
- Run `pnpm build` to ensure TypeScript recognizes the schema changes
- Clear Next.js cache: `rm -rf .next`

## Next Steps

1. ✅ Run migration: `pnpm migrate`
2. ✅ Verify in Neon console
3. ✅ Seed data: `pnpm seed`
4. ✅ Test API: `curl http://localhost:3000/api/builders`
5. ✅ Deploy when ready

## Questions?

Refer to:
- Schema definition: `lib/db/schema.ts` (lines 138-158)
- Migration script: `scripts/migrate-phoneNumber.js`
- Seed script: `scripts/seed.js`
