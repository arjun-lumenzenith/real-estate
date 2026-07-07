import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

const BUILDERS = [
  {
    name: 'Prestige Group',
    tagline: 'India\'s most trusted luxury developer',
    projects: '60+ projects delivered',
    badge: 'ISO 9001',
    color: '#c9a84c',
  },
  {
    name: 'Brigade Group',
    tagline: 'Redefining urban living in South India',
    projects: '250+ million sq ft developed',
    badge: 'CRISIL A+',
    color: '#b8860b',
  },
  {
    name: 'Sobha Limited',
    tagline: 'Backward integration quality leader',
    projects: '100M+ sq ft constructed',
    badge: 'ISO 14001',
    color: '#d4a843',
  },
  {
    name: 'Godrej Properties',
    tagline: 'Sustainable premium communities',
    projects: 'Pan-India developer',
    badge: 'LEED Gold',
    color: '#c9a84c',
  },
  {
    name: 'Puravankara',
    tagline: '48+ years of building excellence',
    projects: '80M sq ft delivered',
    badge: 'NSE Listed',
    color: '#b8860b',
  },
  {
    name: 'Embassy Group',
    tagline: 'Premium mixed-use developments',
    projects: '62M sq ft portfolio',
    badge: 'REIT Backed',
    color: '#d4a843',
  },
]

export function BuildersSection() {
  return (
    <section id="builders" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 max-w-2xl">
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ fontFamily: 'var(--font-body)', color: 'oklch(0.75 0.12 80)' }}
          >
            Our Builder Partners
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light leading-tight text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Only the Best Builders,{' '}
            <span style={{ color: 'oklch(0.75 0.12 80)' }}>Curated for You</span>
          </h2>
          <p
            className="mt-4 text-muted-foreground leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            We partner exclusively with RERA-compliant Tier-1 developers with proven delivery records
            across Bangalore.
          </p>
        </div>

        {/* Builder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40">
          {BUILDERS.map((b) => (
            <div
              key={b.name}
              className="bg-card group hover:bg-secondary/60 transition-colors duration-300 p-8 flex flex-col gap-4"
            >
              {/* Builder initial / logo placeholder */}
              <div className="flex items-center justify-between">
                <div
                  className="h-12 w-12 flex items-center justify-center text-lg font-semibold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    backgroundColor: `${b.color}20`,
                    color: b.color,
                    border: `1px solid ${b.color}40`,
                  }}
                >
                  {b.name.charAt(0)}
                </div>
                <Badge
                  className="rounded-none text-xs border"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'oklch(0.75 0.12 80 / 0.3)',
                    color: 'oklch(0.75 0.12 80)',
                  }}
                >
                  {b.badge}
                </Badge>
              </div>

              <div>
                <h3
                  className="text-xl font-medium mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {b.name}
                </h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {b.tagline}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto" style={{ fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.75 0.12 80)' }} />
                {b.projects}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
