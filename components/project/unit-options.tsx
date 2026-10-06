import { ArrowRight } from 'lucide-react'
import type { ProjectData } from '@/lib/projects/sobha-oneworld'

interface UnitOptionsProps {
  project: ProjectData
  onBookVisit: () => void
}

export function UnitOptions({ project, onBookVisit }: UnitOptionsProps) {
  return (
    <section className="border-y border-border/60 bg-card py-20 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-primary">Residences</p>
            <h2 className="font-(family-name:--font-display) text-4xl font-light text-balance sm:text-5xl">
              {project.configurations} homes
            </h2>
          </div>
          <p className="font-(family-name:--font-display) text-3xl text-foreground">{project.priceRange}</p>
        </div>

        <ul className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {project.units.map((unit) => (
            <li key={unit.bhk} className="flex flex-col gap-6 border-b border-r border-border p-6">
              <div className="flex flex-col gap-2">
                <h3 className="font-(family-name:--font-display) text-4xl font-light text-foreground">{unit.bhk}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{unit.note}</p>
              </div>
              <div className="mt-auto flex flex-col gap-4">
                <p className="text-sm font-medium text-primary">{unit.price}</p>
                <button
                  type="button"
                  onClick={onBookVisit}
                  className="group flex items-center gap-2 text-xs uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                >
                  Get floor plan & price
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
