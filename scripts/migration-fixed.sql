-- ============================================================================
-- DATABASE SCHEMA MIGRATION - FIXED FOR POSTGRESQL
-- Run this SQL directly in your Neon database editor
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

-- ============================================================================
-- BUILDERS TABLE - Add Missing Columns
-- ============================================================================

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(20);

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS tier builder_tier NOT NULL DEFAULT 'tier1';

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS "totalProjects" INTEGER DEFAULT 0;

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS established INTEGER;

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS builders
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- PROPERTIES TABLE - Add Missing Columns
-- ============================================================================

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS locality VARCHAR(255);

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Bangalore';

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS address VARCHAR(500);

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "minPrice" INTEGER;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "maxPrice" INTEGER;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "bhkOptions" VARCHAR(100);

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS amenities TEXT;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "totalUnits" INTEGER;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "soldUnits" INTEGER DEFAULT 0;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "reraNumber" VARCHAR(100) UNIQUE;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS status property_status NOT NULL DEFAULT 'available';

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS properties
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add Foreign Key if not exists
DO $$ BEGIN
    ALTER TABLE properties
    ADD CONSTRAINT properties_builderId_fkey
    FOREIGN KEY ("builderId") REFERENCES builders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- LEADS TABLE - Add Missing Columns
-- ============================================================================

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT 'anonymous';

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "fullName" VARCHAR(255);

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(20);

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS locality VARCHAR(255);

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "budgetRange" VARCHAR(50);

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "bhkRequirement" VARCHAR(10);

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS source VARCHAR(50) NOT NULL DEFAULT 'web';

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS status lead_status NOT NULL DEFAULT 'new';

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "referenceId" VARCHAR(50) UNIQUE;

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- INQUIRIES TABLE - Add Missing Columns
-- ============================================================================

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "leadId" INTEGER;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "propertyId" INTEGER;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS type inquiry_type DEFAULT 'general';

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "followUpDate" TIMESTAMP;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS inquiries
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- AUDIT_LOGS TABLE - Add Missing Columns
-- ============================================================================

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "userId" TEXT;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS action VARCHAR(50) NOT NULL;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "tableName" VARCHAR(100);

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "recordId" INTEGER;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "oldValues" JSONB;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "newValues" JSONB;

ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_builders_tier ON builders(tier);
CREATE INDEX IF NOT EXISTS idx_builders_verified ON builders("isVerified");
CREATE INDEX IF NOT EXISTS idx_properties_builderId ON properties("builderId");
CREATE INDEX IF NOT EXISTS idx_properties_locality ON properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_leads_userId ON leads("userId");
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_createdAt ON leads("createdAt");
CREATE INDEX IF NOT EXISTS idx_audit_logs_userId ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_createdAt ON audit_logs("createdAt");

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT '✅ Migration completed successfully!' as status;
SELECT COUNT(*) as builder_count FROM builders;
SELECT COUNT(*) as properties_count FROM properties;
SELECT COUNT(*) as leads_count FROM leads;
