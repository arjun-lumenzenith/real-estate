import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectData } from '@/lib/projects/sobha-oneworld'

interface ProjectHeroProps {
  project: ProjectData
  onBookVisit: () => void
}

export function ProjectHero({ project, onBookVisit }: ProjectHeroProps) {
  const facts = [
    { label: 'Configurations', value: project.configurations },
    { label: 'Price', value: project.priceRange },
    { label: 'Developer', value: project.builder },
  ]

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden">
      <Image
        src={project.heroImage}
        alt={`${project.name} residential towers`}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/70 to-background/10" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-14 pt-32 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {project.locality}
          </p>
          <h1 className="font-(family-name:--font-display) text-5xl font-light leading-none text-balance text-foreground sm:text-7xl">
            {project.name}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-pretty text-foreground/80">{project.overview}</p>
        </div>

        <dl className="grid max-w-3xl grid-cols-1 border border-border/70 bg-background/60 backdrop-blur sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 border-border/70 px-5 py-4 not-last:border-b sm:not-last:border-b-0 sm:not-last:border-r">
              <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{fact.label}</dt>
              <dd className="font-(family-name:--font-display) text-2xl text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onBookVisit} className="h-12 rounded-none px-8 text-xs uppercase tracking-widest">
            Book a Free Site Visit
          </Button>
          <Button
            variant="outline"
            render={<a href="#renders" />}
            nativeButton={false}
            className="h-12 rounded-none border-foreground/30 bg-transparent px-8 text-xs uppercase tracking-widest text-foreground hover:bg-foreground/10"
          >
            View Renders
          </Button>
        </div>
      </div>
    </section>
  )
}
