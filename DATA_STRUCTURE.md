# Database Data Structure & Seeding Map

## Visual Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         BUILDERS TABLE                          │
│  (6 Tier-1 Developers - Real Estate Companies)                  │
├─────────────────────────────────────────────────────────────────┤
│ ID (UUID)  │ Name                    │ Tier  │ Projects │ Since │
├─────────────────────────────────────────────────────────────────┤
│ uuid-1     │ Prestige Group          │ tier1 │    60    │ 1992  │
│ uuid-2     │ Brigade Group           │ tier1 │   250    │ 1993  │
│ uuid-3     │ Sobha Limited           │ tier1 │   100    │ 1995  │
│ uuid-4     │ Godrej Properties       │ tier1 │    85    │ 1999  │
│ uuid-5     │ Puravankara             │ tier1 │    60    │ 2000  │
│ uuid-6     │ Embassy Group           │ tier1 │    45    │ 2000  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Foreign Key Relationship)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PROPERTIES TABLE                           │
│  (3 Premium Residential Projects)                                │
├─────────────────────────────────────────────────────────────────┤
│ ID (UUID)  │ Name               │ BuilderId  │ Locality    │    │
├─────────────────────────────────────────────────────────────────┤
│ uuid-101   │ The Prestige City  │ uuid-1     │ Sarjapur Rd │ ●  │
│ uuid-102   │ Brigade Orchards   │ uuid-2     │ Devanahalli │ ●  │
│ uuid-103   │ Sobha City         │ uuid-3     │ Whitefield  │ ●  │
└─────────────────────────────────────────────────────────────────┘
```

## Complete Data Mapping

### BUILDER 1: Prestige Group
```json
{
  "id": "auto-generated-uuid",
  "name": "Prestige Group",
  "description": "India's most trusted luxury developer with 60+ projects delivered",
  "website": "https://prestigeproperty.com",
  "contact": "+91-80-40616666",
  "email": "info@prestigeproperty.com",
  "tier": "tier1",
  "established": 1992,
  "totalProjects": 60,
  "certified": true
}
└─ LINKED PROPERTY: "The Prestige City"
   ├─ Locality: Sarjapur Road, Bangalore
   ├─ Price Range: ₹75,00,000 - ₹1,50,00,000
   ├─ BHK Types: 2, 3, 4 BHK
   ├─ Total Units: 120
   ├─ Sold Units: 25
   ├─ RERA No: PRM/KA/RERA/1251
   └─ Amenities: Swimming pool, Gym, Clubhouse, Landscaped gardens, 24/7 Security
```

### BUILDER 2: Brigade Group
```json
{
  "id": "auto-generated-uuid",
  "name": "Brigade Group",
  "description": "Redefining urban living in South India with 250+ projects",
  "website": "https://brigadegroup.com",
  "contact": "+91-80-67616666",
  "email": "sales@brigadegroup.com",
  "tier": "tier1",
  "established": 1993,
  "totalProjects": 250,
  "certified": true
}
└─ LINKED PROPERTY: "Brigade Orchards"
   ├─ Locality: Devanahalli, Bangalore
   ├─ Price Range: ₹60,00,000 - ₹1,20,00,000
   ├─ BHK Types: 1, 2, 3 BHK
   ├─ Total Units: 200
   ├─ Sold Units: 80
   ├─ RERA No: PRM/KA/RERA/1389
   └─ Amenities: Jogging track, Kids play area, Meditation center, Power backup, Water purification
```

### BUILDER 3: Sobha Limited
```json
{
  "id": "auto-generated-uuid",
  "name": "Sobha Limited",
  "description": "Backward integration quality leader with 100+ projects delivered",
  "website": "https://sobharealty.com",
  "contact": "+91-80-25716666",
  "email": "info@sobharealty.com",
  "tier": "tier1",
  "established": 1995,
  "totalProjects": 100,
  "certified": true
}
└─ LINKED PROPERTY: "Sobha City"
   ├─ Locality: Whitefield, Bangalore
   ├─ Price Range: ₹1,20,00,000 - ₹3,00,00,000
   ├─ BHK Types: 2, 3, 4 BHK
   ├─ Total Units: 150
   ├─ Sold Units: 15
   ├─ RERA No: PRM/KA/RERA/1102
   └─ Amenities: Smart homes, Solar panels, Rainwater harvesting, Yoga studio, Gaming zone
```

### BUILDER 4: Godrej Properties
```json
{
  "id": "auto-generated-uuid",
  "name": "Godrej Properties",
  "description": "Premium developer known for sustainability and innovation",
  "website": "https://godrejproperties.com",
  "contact": "+91-22-61151111",
  "email": "enquiry@godrejproperties.com",
  "tier": "tier1",
  "established": 1999,
  "totalProjects": 85,
  "certified": true
}
└─ No linked properties in current seed (ready to add)
```

### BUILDER 5: Puravankara
```json
{
  "id": "auto-generated-uuid",
  "name": "Puravankara",
  "description": "Developer of premium residential and commercial properties",
  "website": "https://puravankara.com",
  "contact": "+91-80-40156666",
  "email": "info@puravankara.com",
  "tier": "tier1",
  "established": 2000,
  "totalProjects": 60,
  "certified": true
}
└─ No linked properties in current seed (ready to add)
```

### BUILDER 6: Embassy Group
```json
{
  "id": "auto-generated-uuid",
  "name": "Embassy Group",
  "description": "Mixed-use development leader with iconic projects",
  "website": "https://embassygroup.com",
  "contact": "+91-80-46666666",
  "email": "sales@embassygroup.com",
  "tier": "tier1",
  "established": 2000,
  "totalProjects": 45,
  "certified": true
}
└─ No linked properties in current seed (ready to add)
```

## Database Schema Details

### Builder Table Schema
```sql
CREATE TABLE builder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  website VARCHAR,
  contact VARCHAR,
  email VARCHAR,
  tier ENUM('tier1', 'tier2', 'tier3') NOT NULL DEFAULT 'tier3',
  established INTEGER,  -- Year founded
  totalProjects INTEGER DEFAULT 0,
  certified BOOLEAN DEFAULT false,
  logo VARCHAR,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Property Table Schema
```sql
CREATE TABLE property (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  locality VARCHAR NOT NULL,
  address TEXT,
  builderId UUID NOT NULL REFERENCES builder(id) ON DELETE CASCADE,
  description TEXT,
  bhkTypes VARCHAR,  -- "1,2,3,4" format
  minPrice DECIMAL(15, 2),
  maxPrice DECIMAL(15, 2),
  status ENUM('available', 'sold-out', 'construction') NOT NULL DEFAULT 'available',
  totalUnits INTEGER,
  soldUnits INTEGER DEFAULT 0,
  reraNumber VARCHAR,  -- RERA registration
  amenities TEXT,
  imageUrl VARCHAR,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Seeding Flow Diagram

```
┌──────────────────────┐
│  Seed Script Start   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│  Connect to Database (Neon)  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Insert 6 Builders           │
│  ├─ Prestige Group           │
│  ├─ Brigade Group            │
│  ├─ Sobha Limited            │
│  ├─ Godrej Properties        │
│  ├─ Puravankara              │
│  └─ Embassy Group            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Insert 3 Properties         │
│  (each linked to a builder)  │
│  ├─ The Prestige City        │
│  ├─ Brigade Orchards         │
│  └─ Sobha City               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  ✅ Seeding Complete         │
│  - 6 builders inserted       │
│  - 3 properties inserted     │
└──────────────────────────────┘
```

## Data Statistics

| Metric | Count |
|--------|-------|
| Total Builders | 6 |
| Total Properties | 3 |
| Total BHK Types | 10 (1,2,3,4 combinations) |
| Avg Price Range | ₹70L - ₹2Cr |
| Total Units (combined) | 470 |
| Total Sold Units | 120 |
| RERA Registered Properties | 3/3 (100%) |

## API Response Example

After seeding, API calls will return actual database data:

### GET /api/builders
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Prestige Group",
      "description": "India's most trusted luxury developer...",
      "totalProjects": 60,
      "tier": "tier1",
      "certified": true
    },
    ... (5 more builders)
  ],
  "fromCache": false
}
```

### GET /api/properties
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-101",
      "name": "The Prestige City",
      "locality": "Sarjapur Road",
      "minPrice": 7500000,
      "maxPrice": 15000000,
      "bhkTypes": "2,3,4",
      "status": "available",
      "totalUnits": 120,
      "amenities": "Swimming pool, Gym, ..."
    },
    ... (2 more properties)
  ],
  "total": 3,
  "fromCache": false
}
```

## Usage Timeline

```
Day 1: Extract hardcoded data ✓
Day 1: Create seeding scripts ✓
Day 1: Create documentation ✓
Day 2: Run seed script → pnpm seed
Day 2: Verify in Neon console
Day 2: Test API endpoints
Day 3: Deploy to production
Day 3: Seed production database
```

---

**Next Step**: Run `pnpm seed` to populate your database!
