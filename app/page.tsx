import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { BuildersSection } from '@/components/builders-section'
import { SearchSection } from '@/components/search-section'
import { WhyUsSection } from '@/components/why-us-section'
import { LeadForm } from '@/components/lead-form'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <BuildersSection />
      <SearchSection />
      <WhyUsSection />
      <LeadForm />
      <Footer />
    </main>
  )
}
