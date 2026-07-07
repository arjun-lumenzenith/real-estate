import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'

const STATS = [
  { value: '500+', label: 'Projects Sold' },
  { value: '12+', label: 'Tier-1 Builders' },
  { value: '₹2500 Cr', label: 'Transactions' },
  { value: '8 Yrs', label: 'In Bangalore' },
]

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bangalore.png"
          alt="Luxury Bangalore skyline"
          className="w-full h-full object-cover object-center"
        />
        {/* Layered overlays */}
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-8 pb-24 pt-40">
        <div className="max-w-3xl">
          <Badge
            className="mb-6 rounded-none px-3 py-1 text-xs tracking-widest uppercase border"
            style={{
              backgroundColor: 'oklch(0.75 0.12 80 / 0.15)',
              borderColor: 'oklch(0.75 0.12 80 / 0.5)',
              color: 'oklch(0.75 0.12 80)',
            }}
          >
            <ShieldCheck className="h-3 w-3 mr-1.5" />
            RERA Registered Channel Partner
          </Badge>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight text-balance mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Find Your Perfect{' '}
            <span style={{ color: 'oklch(0.75 0.12 80)' }}>
              Bangalore
            </span>{' '}
            Home
          </h1>

          <p
            className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Exclusive access to premium residential projects by India&apos;s most trusted builders —
            Prestige, Brigade, Sobha, Godrej &amp; more. Zero brokerage. Expert guidance.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="rounded-none px-8 text-sm tracking-widest uppercase font-medium"
              style={{ backgroundColor: 'oklch(0.75 0.12 80)', color: 'oklch(0.13 0.025 255)' }}
              asChild
            >
              <a href="#search">
                Explore Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-none px-8 text-sm tracking-widest uppercase font-medium border-foreground/30 text-foreground hover:bg-foreground/10"
              asChild
            >
              <a href="#lead">Get Expert Advice</a>
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/40">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-card/60 backdrop-blur-sm px-6 py-5 flex flex-col gap-1"
            >
              <span
                className="text-3xl font-light"
                style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.75 0.12 80)' }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs tracking-widest uppercase text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
