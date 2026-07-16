import { getDb } from '@/lib/db'
import { builder, property } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'

// Hardcoded builders data
const BUILDERS_DATA = [
  {
    name: 'Prestige Group',
    description: "India's most trusted luxury developer with 60+ projects delivered",
    website: 'https://prestigeproperty.com',
    contact: '+91-80-40616666',
    email: 'info@prestigeproperty.com',
    tier: 'tier1',
    established: 1992,
    totalProjects: 60,
    certified: true,
  },
  {
    name: 'Brigade Group',
    description: 'Redefining urban living in South India with 250+ projects',
    website: 'https://brigadegroup.com',
    contact: '+91-80-67616666',
    email: 'sales@brigadegroup.com',
    tier: 'tier1',
    established: 1993,
    totalProjects: 250,
    certified: true,
  },
  {
    name: 'Sobha Limited',
    description: 'Backward integration quality leader with 100+ projects delivered',
    website: 'https://sobharealty.com',
    contact: '+91-80-25716666',
    email: 'info@sobharealty.com',
    tier: 'tier1',
    established: 1995,
    totalProjects: 100,
    certified: true,
  },
  {
    name: 'Godrej Properties',
    description: 'Premium developer known for sustainability and innovation',
    website: 'https://godrejproperties.com',
    contact: '+91-22-61151111',
    email: 'enquiry@godrejproperties.com',
    tier: 'tier1',
    established: 1999,
    totalProjects: 85,
    certified: true,
  },
  {
    name: 'Puravankara',
    description: 'Developer of premium residential and commercial properties',
    website: 'https://puravankara.com',
    contact: '+91-80-40156666',
    email: 'info@puravankara.com',
    tier: 'tier1',
    established: 2000,
    totalProjects: 60,
    certified: true,
  },
  {
    name: 'Embassy Group',
    description: 'Mixed-use development leader with iconic projects',
    website: 'https://embassygroup.com',
    contact: '+91-80-46666666',
    email: 'sales@embassygroup.com',
    tier: 'tier1',
    established: 2000,
    totalProjects: 45,
    certified: true,
  },
]

// Hardcoded properties data
const PROPERTIES_DATA = [
  {
    name: 'The Prestige City',
    locality: 'Sarjapur Road',
    builderId: 'prestige-group',
    address: 'Sarjapur Road, Bangalore',
    description: 'Luxury 2, 3, and 4 BHK apartments in prime location',
    bhkTypes: '2,3,4',
    minPrice: 7500000,
    maxPrice: 15000000,
    status: 'available',
    totalUnits: 120,
    soldUnits: 25,
    reraNumber: 'PRM/KA/RERA/1251',
    amenities: 'Swimming pool, Gym, Clubhouse, Landscaped gardens, 24/7 Security',
  },
  {
    name: 'Brigade Orchards',
    locality: 'Devanahalli',
    builderId: 'brigade-group',
    address: 'Devanahalli, Bangalore',
    description: 'Ready to Move 1, 2, and 3 BHK units',
    bhkTypes: '1,2,3',
    minPrice: 6000000,
    maxPrice: 12000000,
    status: 'available',
    totalUnits: 200,
    soldUnits: 80,
    reraNumber: 'PRM/KA/RERA/1389',
    amenities: 'Jogging track, Kids play area, Meditation center, Power backup, Water purification',
  },
  {
    name: 'Sobha City',
    locality: 'Whitefield',
    builderId: 'sobha-limited',
    address: 'Whitefield, Bangalore',
    description: 'New Launch luxury residential project',
    bhkTypes: '2,3,4',
    minPrice: 12000000,
    maxPrice: 30000000,
    status: 'available',
    totalUnits: 150,
    soldUnits: 15,
    reraNumber: 'PRM/KA/RERA/1102',
    amenities: 'Smart homes, Solar panels, Rainwater harvesting, Yoga studio, Gaming zone',
  },
]

async function seedDatabase() {
  try {
    console.log('Starting database seeding...')
    const db = getDb()

    // Insert builders
    console.log('Inserting builders...')
    const builderMap: Record<string, string> = {}

    for (const builderData of BUILDERS_DATA) {
      const builderId = uuidv4()
      builderMap[builderData.name] = builderId

      await db.insert(builder).values({
        id: builderId,
        name: builderData.name,
        description: builderData.description,
        website: builderData.website,
        contact: builderData.contact,
        email: builderData.email,
        tier: builderData.tier as any,
        established: builderData.established,
        totalProjects: builderData.totalProjects,
        certified: builderData.certified,
      })

      console.log(`✓ Inserted builder: ${builderData.name}`)
    }

    // Insert properties
    console.log('Inserting properties...')
    for (const propData of PROPERTIES_DATA) {
      const propertyId = uuidv4()
      const builderName = Object.keys(builderMap).find(
        (name) => propData.builderId.includes(name.toLowerCase().replace(/\s+/g, '-'))
      )

      const builderId = builderName ? builderMap[builderName] : Object.values(builderMap)[0]

      await db.insert(property).values({
        id: propertyId,
        name: propData.name,
        locality: propData.locality,
        builderId: builderId,
        address: propData.address,
        description: propData.description,
        bhkTypes: propData.bhkTypes,
        minPrice: propData.minPrice,
        maxPrice: propData.maxPrice,
        status: propData.status as any,
        totalUnits: propData.totalUnits,
        soldUnits: propData.soldUnits,
        reraNumber: propData.reraNumber,
        amenities: propData.amenities,
      })

      console.log(`✓ Inserted property: ${propData.name}`)
    }

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
