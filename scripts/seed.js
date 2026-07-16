const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const BUILDERS_DATA = [
  {
    name: 'Prestige Group',
    description: "India's most trusted luxury developer with 60+ projects delivered",
    website: 'https://prestigeproperty.com',
    phoneNumber: '+91-80-40616666',
    email: 'info@prestigeproperty.com',
    tier: 'tier1',
    established: 1992,
    totalProjects: 60,
    isVerified: true,
  },
  {
    name: 'Brigade Group',
    description: 'Redefining urban living in South India with 250+ projects',
    website: 'https://brigadegroup.com',
    phoneNumber: '+91-80-67616666',
    email: 'sales@brigadegroup.com',
    tier: 'tier1',
    established: 1993,
    totalProjects: 250,
    isVerified: true,
  },
  {
    name: 'Sobha Limited',
    description: 'Backward integration quality leader with 100+ projects delivered',
    website: 'https://sobharealty.com',
    phoneNumber: '+91-80-25716666',
    email: 'info@sobharealty.com',
    tier: 'tier1',
    established: 1995,
    totalProjects: 100,
    isVerified: true,
  },
  {
    name: 'Godrej Properties',
    description: 'Premium developer known for sustainability and innovation',
    website: 'https://godrejproperties.com',
    phoneNumber: '+91-22-61151111',
    email: 'enquiry@godrejproperties.com',
    tier: 'tier1',
    established: 1999,
    totalProjects: 85,
    isVerified: true,
  },
  {
    name: 'Puravankara',
    description: 'Developer of premium residential and commercial properties',
    website: 'https://puravankara.com',
    phoneNumber: '+91-80-40156666',
    email: 'info@puravankara.com',
    tier: 'tier1',
    established: 2000,
    totalProjects: 60,
    isVerified: true,
  },
  {
    name: 'Embassy Group',
    description: 'Mixed-use development leader with iconic projects',
    website: 'https://embassygroup.com',
    phoneNumber: '+91-80-46666666',
    email: 'sales@embassygroup.com',
    tier: 'tier1',
    established: 2000,
    totalProjects: 45,
    isVerified: true,
  },
];

const PROPERTIES_DATA = [
  {
    title: 'The Prestige City',
    locality: 'Sarjapur Road',
    builderName: 'Prestige Group',
    address: 'Sarjapur Road, Bangalore',
    description: 'Luxury 2, 3, and 4 BHK apartments in prime location',
    bhkOptions: '2,3,4',
    minPrice: 7500000,
    maxPrice: 15000000,
    status: 'available',
    totalUnits: 120,
    soldUnits: 25,
    reraNumber: 'PRM/KA/RERA/1251',
    amenities: 'Swimming pool, Gym, Clubhouse, Landscaped gardens, 24/7 Security',
  },
  {
    title: 'Brigade Orchards',
    locality: 'Devanahalli',
    builderName: 'Brigade Group',
    address: 'Devanahalli, Bangalore',
    description: 'Ready to Move 1, 2, and 3 BHK units',
    bhkOptions: '1,2,3',
    minPrice: 6000000,
    maxPrice: 12000000,
    status: 'available',
    totalUnits: 200,
    soldUnits: 80,
    reraNumber: 'PRM/KA/RERA/1389',
    amenities: 'Jogging track, Kids play area, Meditation center, Power backup, Water purification',
  },
  {
    title: 'Sobha City',
    locality: 'Whitefield',
    builderName: 'Sobha Limited',
    address: 'Whitefield, Bangalore',
    description: 'New Launch luxury residential project',
    bhkOptions: '2,3,4',
    minPrice: 12000000,
    maxPrice: 30000000,
    status: 'available',
    totalUnits: 150,
    soldUnits: 15,
    reraNumber: 'PRM/KA/RERA/1102',
    amenities: 'Smart homes, Solar panels, Rainwater harvesting, Yoga studio, Gaming zone',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if database connection is available
    const client = await pool.connect();
    console.log('✓ Connected to database');
    client.release();

    // Insert builders
    console.log('\n📝 Inserting builders...');
    const builderMap = {};

    for (const builderData of BUILDERS_DATA) {
      const builderId = uuidv4();
      builderMap[builderData.name] = builderId;

      try {
        await pool.query(
          `INSERT INTO "builders" (name, description, website, "phoneNumber", email, tier, established, "totalProjects", "isVerified")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (name) DO NOTHING`,
          [
            builderData.name,
            builderData.description,
            builderData.website,
            builderData.phoneNumber,
            builderData.email,
            builderData.tier,
            builderData.established,
            builderData.totalProjects,
            builderData.isVerified,
          ]
        );
        console.log(`✓ Inserted builder: ${builderData.name}`);
      } catch (err) {
        console.warn(`⚠ Builder ${builderData.name} may already exist:`, err.message);
        // Get existing ID
        const result = await pool.query('SELECT id FROM "builders" WHERE name = $1', [builderData.name]);
        if (result.rows.length > 0) {
          builderMap[builderData.name] = result.rows[0].id;
        }
      }
    }

    // Insert properties
    console.log('\n📝 Inserting properties...');
    for (const propData of PROPERTIES_DATA) {
      const propertyId = uuidv4();
      const builderId = builderMap[propData.builderName];

      if (!builderId) {
        console.warn(`⚠ Builder ID not found for ${propData.builderName}, skipping property`);
        continue;
      }

      try {
        await pool.query(
          `INSERT INTO "properties" (title, locality, "builderId", address, description, "bhkOptions", "minPrice", "maxPrice", status, "totalUnits", "soldUnits", "reraNumber", amenities)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT ("reraNumber") DO NOTHING`,
          [
            propData.title,
            propData.locality,
            builderId,
            propData.address,
            propData.description,
            propData.bhkOptions,
            propData.minPrice,
            propData.maxPrice,
            propData.status,
            propData.totalUnits,
            propData.soldUnits,
            propData.reraNumber,
            propData.amenities,
          ]
        );
        console.log(`✓ Inserted property: ${propData.title}`);
      } catch (err) {
        console.warn(`⚠ Property ${propData.title} may already exist:`, err.message);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
