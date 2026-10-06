import { Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectData } from '@/lib/projects/sobha-oneworld'

interface LocationBenefitsProps {
  project: ProjectData
  onBookVisit: () => void
}

export function LocationBenefits({ project, onBookVisit }: LocationBenefitsProps) {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(project.mapQuery)}&output=embed`

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-primary">Location</p>
            <h2 className="font-(family-name:--font-display) text-4xl font-light text-balance sm:text-5xl">
              Connected to East Bengaluru
            </h2>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {project.address}
            </p>
          </div>

          <ul className="flex flex-col gap-6">
            {project.locationBenefits.map((benefit) => (
              <li key={benefit.title} className="flex flex-col gap-1 border-l-0 border-t border-border/60 pt-5">
                <h3 className="text-base font-medium text-foreground">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{benefit.detail}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Inside the community</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {project.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={onBookVisit} className="h-12 self-start rounded-none px-8 text-xs uppercase tracking-widest">
            Schedule a Visit
          </Button>
        </div>

        <div className="relative min-h-80 overflow-hidden border border-border bg-card lg:min-h-full">
          <iframe
            title={`Map showing ${project.name}`}
            src={mapSrc}
            className="absolute inset-0 h-full w-full grayscale-[0.4]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
