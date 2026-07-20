# SQL Migration - Add All Missing Columns

## ⚠️ ERROR FIX

The previous `migration.sql` had a syntax error. Use this instead:

## 📄 File to Use

**`scripts/migration-fixed.sql`** ← Use this file

## 🎯 What To Do

### Step 1: Copy the SQL
Open `/scripts/migration-fixed.sql` and copy ALL the content.

### Step 2: Paste in Database Editor
1. Go to your Neon database editor
2. Create a new query/script
3. Paste ALL the SQL code
4. Click "Run" or "Execute"

### Step 3: Wait for Completion
You should see:
```
✅ Migration completed successfully!
builder_count: (number)
properties_count: (number)  
leads_count: (number)
```

### Step 4: Verify in Your Editor
Look at your tables - you should now see:

**builders table columns:**
- id, name, email, phoneNumber, website, description
- tier, isVerified, totalProjects, established
- createdAt, updatedAt

**properties table columns:**
- id, builderId, title, description, locality, city
- address, minPrice, maxPrice, bhkOptions, amenities
- totalUnits, soldUnits, reraNumber, imageUrl, status
- createdAt, updatedAt

**leads table columns:**
- id, userId, fullName, email, phoneNumber, locality
- budgetRange, bhkRequirement, source, status, referenceId
- notes, createdAt, updatedAt

## ✅ After Migration

Run this command to seed data:

```bash
pnpm seed
```

This will add:
- 6 builders with phone numbers
- 3 properties with all details

## ⚡ Safe to Run

This SQL uses:
- `ALTER TABLE IF EXISTS` - won't fail if table doesn't exist
- `ADD COLUMN IF NOT EXISTS` - won't fail if column already exists
- `CREATE INDEX IF NOT EXISTS` - won't fail if index exists
- `CREATE TYPE` with exception handling - won't fail if type exists

You can run it multiple times safely - it's idempotent.

## 🔍 If You Get Errors

1. **"syntax error near NOT"** - Make sure you copied the ENTIRE file
2. **"relation does not exist"** - Table might not exist yet (that's OK, will be created when seeding)
3. **"duplicate_object"** - ENUM type already exists (that's OK, exception handles it)

All of these are safe and the script will continue.

## 🚀 Next Steps

After running the SQL:

```bash
# Seed the database with 6 builders + 3 properties
pnpm seed

# Start development server
pnpm dev
```

Your database is now ready!
