# Complete Database Schema - Column Mapping

All columns that SHOULD be in your database based on the code schema (lib/db/schema.ts).

## BUILDERS Table (builders)

**Primary Key:**
- `id` (SERIAL)

**Core Fields:**
- `name` (VARCHAR 255) - NOT NULL, UNIQUE
- `email` (VARCHAR 255)
- `phoneNumber` (VARCHAR 20) - **CRITICAL**
- `website` (VARCHAR 255)
- `description` (TEXT)
- `tier` (ENUM: tier1, tier2, tier3) - Default: tier1, NOT NULL
- `isVerified` (BOOLEAN) - Default: true, NOT NULL
- `totalProjects` (INTEGER) - Default: 0
- `established` (INTEGER) - Year established
- `createdAt` (TIMESTAMP) - Default: NOW(), NOT NULL
- `updatedAt` (TIMESTAMP) - Default: NOW(), NOT NULL

**Indexes:**
- UNIQUE INDEX on `name`
- INDEX on `tier`
- INDEX on `isVerified`

---

## PROPERTIES Table (properties)

**Primary Key:**
- `id` (SERIAL)

**Foreign Keys:**
- `builderId` (INTEGER) - NOT NULL, FK → builders.id ON DELETE CASCADE

**Core Fields:**
- `title` (VARCHAR 255) - **CRITICAL** - NOT NULL
- `description` (TEXT)
- `locality` (VARCHAR 255) - NOT NULL
- `city` (VARCHAR 100) - Default: Bangalore, NOT NULL
- `address` (VARCHAR 500)
- `minPrice` (INTEGER) - Starting price
- `maxPrice` (INTEGER) - Maximum price
- `bhkOptions` (VARCHAR 100) - e.g., "2,3,4"
- `amenities` (TEXT) - Comma-separated or detailed list
- `totalUnits` (INTEGER) - Total units in project
- `soldUnits` (INTEGER) - Already sold, Default: 0
- `reraNumber` (VARCHAR 100) - UNIQUE, Registration number
- `imageUrl` (TEXT)
- `status` (ENUM: available, sold_out, upcoming, archived) - Default: available, NOT NULL
- `createdAt` (TIMESTAMP) - Default: NOW(), NOT NULL
- `updatedAt` (TIMESTAMP) - Default: NOW(), NOT NULL

**Indexes:**
- INDEX on `builderId`
- INDEX on `locality`
- INDEX on `city`
- INDEX on `status`
- UNIQUE INDEX on `reraNumber`

---

## LEADS Table (leads)

**Primary Key:**
- `id` (SERIAL)

**Core Fields:**
- `userId` (TEXT) - NOT NULL
- `fullName` (VARCHAR 255) - NOT NULL
- `email` (VARCHAR 255) - NOT NULL
- `phoneNumber` (VARCHAR 20) - NOT NULL, **CRITICAL**
- `locality` (VARCHAR 255)
- `budgetRange` (VARCHAR 50) - e.g., "50-100 lakhs"
- `bhkRequirement` (VARCHAR 10) - e.g., "2 BHK"
- `source` (VARCHAR 50) - Default: web, NOT NULL
- `status` (ENUM: new, contacted, qualified, converted, lost) - Default: new, NOT NULL
- `referenceId` (VARCHAR 50) - NOT NULL, UNIQUE
- `notes` (TEXT)
- `createdAt` (TIMESTAMP) - Default: NOW(), NOT NULL
- `updatedAt` (TIMESTAMP) - Default: NOW(), NOT NULL

**Indexes:**
- INDEX on `userId`
- INDEX on `email`
- INDEX on `status`
- INDEX on `createdAt`
- UNIQUE INDEX on `referenceId`

---

## INQUIRIES Table (inquiries)

**Primary Key:**
- `id` (SERIAL)

**Foreign Keys:**
- `leadId` (INTEGER) - NOT NULL, FK → leads.id ON DELETE CASCADE
- `propertyId` (INTEGER) - NOT NULL, FK → properties.id ON DELETE CASCADE

**Core Fields:**
- `interactionType` (ENUM: view, inquiry, call, email, site_visit, offer) - Default: inquiry, NOT NULL
- `notes` (TEXT)
- `followUpDate` (TIMESTAMP)
- `createdAt` (TIMESTAMP) - Default: NOW(), NOT NULL
- `updatedAt` (TIMESTAMP) - Default: NOW(), NOT NULL

**Indexes:**
- INDEX on `leadId`
- INDEX on `propertyId`
- INDEX on `interactionType`
- INDEX on `createdAt`

---

## AUDIT_LOGS Table (audit_logs)

**Primary Key:**
- `id` (SERIAL)

**Core Fields:**
- `userId` (TEXT)
- `action` (VARCHAR 100) - NOT NULL - e.g., "CREATE", "UPDATE", "DELETE"
- `entity` (VARCHAR 50) - NOT NULL - e.g., "lead", "property"
- `entityId` (INTEGER) - ID of the entity being changed
- `changes` (TEXT) - JSON or formatted change details
- `ipAddress` (VARCHAR 45)
- `userAgent` (TEXT)
- `createdAt` (TIMESTAMP) - Default: NOW(), NOT NULL

**Indexes:**
- INDEX on `userId`
- INDEX on (entity, entityId)
- INDEX on `createdAt`

---

## ENUM Types

### builder_tier
- `tier1` - Premium/Tier 1 builders
- `tier2` - Mid-range builders
- `tier3` - Budget builders

### property_status
- `available` - Currently available
- `sold_out` - All units sold
- `upcoming` - Not yet launched
- `archived` - No longer active

### lead_status
- `new` - New lead
- `contacted` - We've contacted them
- `qualified` - Qualified lead
- `converted` - Converted to customer
- `lost` - Lost opportunity

### interaction_type
- `view` - Property view
- `inquiry` - General inquiry
- `call` - Phone call
- `email` - Email communication
- `site_visit` - Site visit
- `offer` - Made an offer

---

## How to Use This

### Check What's Missing
Run the migration script to see what's missing:
```bash
pnpm migrate
```

### Complete Setup
Adds ALL missing columns and seeds data:
```bash
pnpm setup
```

### Step by Step
```bash
# 1. Add all missing columns
pnpm migrate

# 2. Seed with sample data
pnpm seed

# 3. Start development
pnpm dev
```

---

## Sample Data Included

When you run `pnpm seed`, you get:
- **6 Builders** with full details including phone numbers
- **3 Properties** with complete information linked to builders
- Proper RERA numbers and amenities
- All timestamps and defaults set

---

## Critical Columns (Must Have)

For the app to work without errors:
- **builders.phoneNumber** - Used in API responses and UI
- **properties.title** - Displayed on property cards
- **properties.builderId** - Links properties to builders
- **leads.phoneNumber** - Required for form submission
- All ENUM types created
