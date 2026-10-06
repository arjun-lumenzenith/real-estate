'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectData } from '@/lib/projects/sobha-oneworld'
import { SiteVisitDialog } from './site-visit-dialog'
import { ProjectHero } from './project-hero'
import { RenderGallery } from './render-gallery'
import { UnitOptions } from './unit-options'
import { LocationBenefits } from './location-benefits'

const AUTO_OPEN_DELAY_MS = 700

export function ProjectLanding({ project }: { project: ProjectData }) {
  const [visitOpen, setVisitOpen] = useState(false)
  const openVisit = () => setVisitOpen(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisitOpen(true), AUTO_OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
          <Link href="/" className="font-(family-name:--font-display) text-xl tracking-wide text-foreground">
            LumenZenith <span className="text-primary">Realty</span>
          </Link>
          <Button onClick={openVisit} className="h-10 rounded-none px-5 text-xs uppercase tracking-widest">
            Book a Site Visit
          </Button>
        </div>
      </header>

      <main className="font-(family-name:--font-body)">
        <ProjectHero project={project} onBookVisit={openVisit} />
        <RenderGallery renders={project.renders} projectName={project.name} />
        <UnitOptions project={project} onBookVisit={openVisit} />
        <LocationBenefits project={project} onBookVisit={openVisit} />
      </main>

      <footer className="border-t border-border/60 bg-background pb-24 pt-10 font-(family-name:--font-body) md:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-xs leading-relaxed text-muted-foreground lg:px-8">
          <p>
            {project.name} by {project.builder} · RERA: <span className="font-mono">{project.reraNumber}</span>
          </p>
          <p className="text-pretty">
            Images are artistic impressions. Prices, configurations and availability are indicative and subject to change
            by the developer. LumenZenith Realty is an authorised channel partner.{' '}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>

      {!visitOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:inset-x-auto md:bottom-6 md:right-6 md:border-0 md:bg-transparent md:p-0">
          <Button
            onClick={openVisit}
            className="h-12 w-full gap-2 rounded-none px-6 text-xs uppercase tracking-widest shadow-lg md:w-auto"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Book a Site Visit
          </Button>
        </div>
      )}

      <SiteVisitDialog open={visitOpen} onOpenChange={setVisitOpen} projectName={project.name} />
    </>
  )
}
