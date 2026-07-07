'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { BuildersSection } from '@/components/builders-section'
import { SearchSection } from '@/components/search-section'
import { WhyUsSection } from '@/components/why-us-section'
import { LeadForm } from '@/components/lead-form'
import { Footer } from '@/components/footer'

export default function Home() {
  // Lifted state management arrays shared across siblings
  const [locs, setLocs] = useState<string[]>([])
  const [buds, setBuds] = useState<string[]>([])
  const [bhks, setBhks] = useState<string[]>([])

  return (
    <main>
      <Navbar />
      <HeroSection />
      <BuildersSection />
      
      {/* Pass states and setters down to the search filters */}
      <SearchSection 
        locs={locs} setLocs={setLocs}
        buds={buds} setBuds={setBuds}
        bhks={bhks} setBhks={setBhks}
      />
      
      <WhyUsSection />
      <LeadForm />
      
      {/* Pass localities tracking states into the footer links */}
      <Footer locs={locs} setLocs={setLocs} />
    </main>
  )
}
