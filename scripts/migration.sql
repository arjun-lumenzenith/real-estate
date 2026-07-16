-- ============================================================================
-- DATABASE SCHEMA MIGRATION
-- Run this SQL directly in your database editor (Neon)
-- This adds all missing columns and creates necessary ENUM types
-- ============================================================================

-- Step 1: Create ENUM types if they don't exist
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE builder_tier AS ENUM ('tier1', 'tier2', 'tier3');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('available', 'sold_out', 'upcoming', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inquiry_type AS ENUM ('general', 'site_visit', 'price_quote', 'payment_plan', 'registration');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add missing columns to builders table
-- ============================================================================

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS phoneNumber VARCHAR(20);

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS tier builder_tier DEFAULT 'tier1' NOT NULL;

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT true NOT NULL;

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS totalProjects INTEGER DEFAULT 0;

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS established INTEGER;

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

ALTER TABLE builders
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Step 3: Add missing columns to properties table
-- ============================================================================

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS locality VARCHAR(255);

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Bangalore';

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS address VARCHAR(500);

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "builderId" INTEGER;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS minPrice INTEGER;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS maxPrice INTEGER;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "bhkOptions" VARCHAR(100);

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS amenities TEXT;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS totalUnits INTEGER;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "soldUnits" INTEGER DEFAULT 0;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "reraNumber" VARCHAR(100);

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS status property_status DEFAULT 'available' NOT NULL;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Step 4: Add foreign key constraint for builderId in properties
-- ============================================================================

ALTER TABLE properties
ADD CONSTRAINT IF NOT EXISTS properties_builderId_fk 
FOREIGN KEY ("builderId") REFERENCES builders(id) ON DELETE CASCADE;

-- Step 5: Add missing columns to leads table
-- ============================================================================

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT 'system';

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "fullName" VARCHAR(255);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(20);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS locality VARCHAR(255);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "budgetRange" VARCHAR(50);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "bhkRequirement" VARCHAR(10);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web' NOT NULL;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS status lead_status DEFAULT 'new' NOT NULL;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "referenceId" VARCHAR(50);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Step 6: Add missing columns to inquiries table (if exists)
-- ============================================================================

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "leadId" INTEGER;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "propertyId" INTEGER;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "inquiryType" inquiry_type DEFAULT 'general' NOT NULL;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending' NOT NULL;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Step 7: Add missing columns to audit_logs table (if exists)
-- ============================================================================

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "userId" TEXT;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS action VARCHAR(255) NOT NULL;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS entity VARCHAR(100) NOT NULL;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "entityId" INTEGER;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS changes JSONB;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Step 8: Create indexes for better query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS builders_tier_idx ON builders(tier);
CREATE INDEX IF NOT EXISTS builders_isVerified_idx ON builders("isVerified");
CREATE INDEX IF NOT EXISTS properties_builderId_idx ON properties("builderId");
CREATE INDEX IF NOT EXISTS properties_locality_idx ON properties(locality);
CREATE INDEX IF NOT EXISTS properties_city_idx ON properties(city);
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS leads_userId_idx ON leads("userId");
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_createdAt_idx ON leads("createdAt");

-- Step 9: Verify schema by showing table structures
-- ============================================================================

-- Show builders table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'builders' 
ORDER BY ordinal_position;

-- Show properties table structure  
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- Show leads table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All columns have been added. You can now run:
-- pnpm seed
-- 
-- This will populate:
-- - 6 builders with phone numbers and details
-- - 3 properties with all information
-- ============================================================================
