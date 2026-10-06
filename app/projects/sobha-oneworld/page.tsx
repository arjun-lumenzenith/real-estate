import type { Metadata } from 'next'
import { ProjectLanding } from '@/components/project/project-landing'
import { sobhaOneWorld } from '@/lib/projects/sobha-oneworld'

export const metadata: Metadata = {
  title: `${sobhaOneWorld.name} — ${sobhaOneWorld.configurations} on Old Madras Road`,
  description: `${sobhaOneWorld.name} by ${sobhaOneWorld.builder}: ${sobhaOneWorld.configurations} homes from ${sobhaOneWorld.priceRange} in ${sobhaOneWorld.locality}, Bengaluru. Book a free site visit.`,
  alternates: { canonical: '/projects/sobha-oneworld' },
  openGraph: {
    title: `${sobhaOneWorld.name} | LumenZenith Realty`,
    description: `${sobhaOneWorld.configurations} homes from ${sobhaOneWorld.priceRange}. Book a free site visit.`,
    images: [sobhaOneWorld.heroImage],
  },
}

export default function SobhaOneWorldPage() {
  return <ProjectLanding project={sobhaOneWorld} />
}
