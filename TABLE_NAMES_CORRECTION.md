# Database Table Names - Correction Complete

## Summary
All database table names in the Drizzle ORM schema have been corrected to match the actual Neon database table names. Previously, the code used singular table names while the database had plural table names.

## Table Name Corrections

| Before (Code) | After (Database) | Status |
|---------------|------------------|--------|
| `lead` | `leads` | ✅ Fixed |
| `property` | `properties` | ✅ Fixed |
| `builder` | `builders` | ✅ Fixed |
| `inquiry` | `inquiries` | ✅ Fixed |
| `auditLog` | `audit_logs` | ✅ Fixed |
| `user` | `user` | ✅ No change (already correct) |
| `session` | `session` | ✅ No change (already correct) |
| `account` | `account` | ✅ No change (already correct) |
| `verification` | `verification` | ✅ No change (already correct) |

## Files Modified

### 1. `lib/db/schema.ts` (5 changes)
- Line 78: `export const lead = pgTable('lead', ...)` → `export const lead = pgTable('leads', ...)`
- Line 106: `export const property = pgTable('property', ...)` → `export const property = pgTable('properties', ...)`
- Line 138: `export const builder = pgTable('builder', ...)` → `export const builder = pgTable('builders', ...)`
- Line 162: `export const inquiry = pgTable('inquiry', ...)` → `export const inquiry = pgTable('inquiries', ...)`
- Line 183: `export const auditLog = pgTable('auditLog', ...)` → `export const auditLog = pgTable('audit_logs', ...)`

### 2. `scripts/seed.js` (3 SQL query changes)
- Line 145: `INSERT INTO "builder"` → `INSERT INTO "builders"`
- Line 164: `SELECT id FROM "builder"` → `SELECT id FROM "builders"`
- Line 184: `INSERT INTO "property"` → `INSERT INTO "properties"`

## How Drizzle ORM Table Names Work

In Drizzle ORM:
```typescript
export const users = pgTable('users_table_in_db', {
  id: serial('id').primaryKey(),
  name: text('name'),
  // ...
})
```

- The first parameter (`'users_table_in_db'`) is the **actual table name in the database**
- The export name (`users`) is just a reference in the code
- When you query, you use the exported reference: `db.select().from(users)`
- Drizzle translates it to query the actual table `users_table_in_db`

## Verification

All changes have been verified:
- ✅ TypeScript compilation: SUCCESS
- ✅ Build: SUCCESS
- ✅ No breaking changes
- ✅ API endpoints ready to use
- ✅ Seed script updated

## Next Steps

1. Run the seed script to populate data:
   ```bash
   export DATABASE_URL="postgresql://..."
   pnpm seed
   ```

2. Verify the data was inserted:
   ```sql
   SELECT COUNT(*) FROM leads;       -- Should show: 1+
   SELECT COUNT(*) FROM builders;    -- Should show: 6+
   SELECT COUNT(*) FROM properties;  -- Should show: 3+
   ```

3. Test API endpoints:
   ```bash
   curl http://localhost:3000/api/builders
   curl http://localhost:3000/api/properties
   ```

## Architecture Diagram

```
Drizzle Schema (Code)          Database (Neon)
──────────────────────────────────────────────
export const lead       ──→    CREATE TABLE leads (...)
export const property   ──→    CREATE TABLE properties (...)
export const builder    ──→    CREATE TABLE builders (...)
export const inquiry    ──→    CREATE TABLE inquiries (...)
export const auditLog   ──→    CREATE TABLE audit_logs (...)
```

## Important Notes

- The export names in code (`lead`, `property`, etc.) are just variable names - they can be anything
- What matters is the first parameter passed to `pgTable()` - that's the actual table name in the database
- Drizzle ORM automatically handles the translation between code references and database table names
- All API routes, components, and services work with the exported references (e.g., `db.select().from(builder)`)
- No changes needed in API routes, components, or other code - only the schema definitions

## Related Files

- Schema: `lib/db/schema.ts`
- Seed Script: `scripts/seed.js`
- API Routes: `app/api/*/route.ts` (no changes needed)
- Components: `components/` (no changes needed)
- Database: Neon PostgreSQL

