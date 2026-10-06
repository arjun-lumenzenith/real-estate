export const sobhaOneWorld = {
  name: 'Sobha OneWorld',
  builder: 'Sobha Limited',
  tagline: 'An integrated township on the eastern edge of Bengaluru',
  locality: 'Old Madras Road, Greater Whitefield',
  address: 'Old Madras Road, near Hoskote, Bengaluru',
  priceRange: '₹1.15 Cr – ₹3.86 Cr',
  configurations: '1, 2, 3 & 4 BHK',
  reraNumber: 'PRM/KA/RERA/1250/304/PR/080526/008634',
  mapQuery: 'Sobha OneWorld, Old Madras Road, Hoskote, Bengaluru',
  overview:
    'A large, master-planned township by Sobha, built with the developer’s in-house design and construction. Residences open onto landscaped greens, with a full clubhouse and sports facilities inside the community.',
  heroImage: '/projects/sobha-one-world-night-elevation.jpg',
  renders: [
    { src: '/projects/sobha-one-world-night-elevation.jpg', title: 'The Towers', caption: 'Exterior at dusk' },
    { src: '/projects/sobha-oneworld/clubhouse-pool.png', title: 'Clubhouse & Pool', caption: 'Resort-style leisure deck' },
    { src: '/projects/sobha-oneworld/central-park.png', title: 'Central Greens', caption: 'Landscaped walking trails' },
    { src: '/projects/sobha-oneworld/living-room.png', title: 'Living Room', caption: 'Light-filled interiors' },
    { src: '/projects/sobha-oneworld/master-bedroom.png', title: 'Master Bedroom', caption: 'Calm, private spaces' },
  ],
  units: [
    { bhk: '1 BHK', note: 'Compact, efficient layouts for first homes and investors', price: 'Starting ₹1.15 Cr' },
    { bhk: '2 BHK', note: 'Balanced plans for young families', price: 'Price on request' },
    { bhk: '3 BHK', note: 'Generous living with flexible third room', price: 'Price on request' },
    { bhk: '4 BHK', note: 'Expansive residences for larger households', price: 'Up to ₹3.86 Cr' },
  ],
  amenities: [
    'Clubhouse',
    'Swimming pool',
    'Fully equipped gym',
    'Landscaped gardens',
    'Sports courts',
    'Kids’ play areas',
  ],
  locationBenefits: [
    { title: 'Old Madras Road frontage', detail: 'Direct access to NH-75 towards the city and Kolar.' },
    { title: 'Whitefield & ITPL nearby', detail: 'Short commute to East Bengaluru’s largest tech corridor.' },
    { title: 'Metro & rail access', detail: 'KR Puram metro and railway station within easy reach.' },
    { title: 'Airport connectivity', detail: 'Hoskote–Devanahalli route and the Satellite Town Ring Road.' },
  ],
}

export type ProjectData = typeof sobhaOneWorld
