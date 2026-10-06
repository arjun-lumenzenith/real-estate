import type { Metadata } from 'next'
import { ProjectLanding } from '@/components/project/project-landing'
import { sobhaOneWorld } from '@/lib/projects/sobha-oneworld'

const SITE_URL = 'https://www.lumenzenith.com'
const PAGE_PATH = '/projects/sobha-oneworld'

export const metadata: Metadata = {
  title: `${sobhaOneWorld.name} — ${sobhaOneWorld.configurations} on Old Madras Road`,
  description: `${sobhaOneWorld.name} by ${sobhaOneWorld.builder}: ${sobhaOneWorld.configurations} homes from ${sobhaOneWorld.priceRange} in ${sobhaOneWorld.locality}, Bengaluru. Book a free site visit.`,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: `${sobhaOneWorld.name} | LumenZenith Realty`,
    description: `${sobhaOneWorld.configurations} homes from ${sobhaOneWorld.priceRange}. Book a free site visit.`,
    url: PAGE_PATH,
    images: [sobhaOneWorld.heroImage],
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ApartmentComplex',
  name: sobhaOneWorld.name,
  description: sobhaOneWorld.overview,
  url: `${SITE_URL}${PAGE_PATH}`,
  image: sobhaOneWorld.renders.map((render) => `${SITE_URL}${render.src}`),
  address: {
    '@type': 'PostalAddress',
    streetAddress: sobhaOneWorld.address,
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
  amenityFeature: sobhaOneWorld.amenities.map((name) => ({
    '@type': 'LocationFeatureSpecification',
    name,
    value: true,
  })),
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'INR',
    lowPrice: 11500000,
    highPrice: 38600000,
    offerCount: sobhaOneWorld.units.length,
    seller: { '@type': 'RealEstateAgent', name: 'LumenZenith Realty', url: SITE_URL },
  },
}

export default function SobhaOneWorldPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <ProjectLanding project={sobhaOneWorld} />
    </>
  )
}
