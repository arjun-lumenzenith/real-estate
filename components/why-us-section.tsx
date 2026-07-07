import { Award, Clock3, Users2, BadgeCheck } from 'lucide-react'

const REASONS = [
  {
    icon: Award,
    title: 'Curated Tier-1 Portfolio',
    desc: 'Every project in our portfolio is vetted for RERA compliance, builder track record, and construction quality before we recommend it.',
  },
  {
    icon: Users2,
    title: 'Dedicated Advisor',
    desc: 'You get a single point of contact — a dedicated relationship manager who understands your needs and works only for you.',
  },
  {
    icon: Clock3,
    title: 'Fast-Track Site Visits',
    desc: 'We arrange personal site visits at your convenience, including weekends. No waiting, no group tours.',
  },
  {
    icon: BadgeCheck,
    title: 'Zero Hidden Charges',
    desc: 'Our service is free for buyers. Transparent pricing, no registration fees, no consultancy fees — ever.',
  },
]

export function WhyUsSection() {
  return (
    <section id="about" className="py-24 bg-card/30 border-y border-border/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Left heading */}
          <div className="lg:col-span-1">
            <p
              className="text-xs tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-body)', color: 'oklch(0.75 0.12 80)' }}
            >
              Why Choose Us
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light leading-tight text-balance"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The{' '}
              <span style={{ color: 'oklch(0.75 0.12 80)' }}>LumenZenith</span>{' '}
              Difference
            </h2>
            <p
              className="mt-6 text-muted-foreground leading-relaxed text-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              We are Bangalore&apos;s most trusted channel partner, helping thousands of families
              and investors navigate the premium real estate market with confidence.
            </p>
          </div>

          {/* Right grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {REASONS.map((r) => (
              <div key={r.title} className="flex flex-col gap-4">
                <div
                  className="h-10 w-10 flex items-center justify-center"
                  style={{
                    backgroundColor: 'oklch(0.75 0.12 80 / 0.1)',
                    border: '1px solid oklch(0.75 0.12 80 / 0.3)',
                  }}
                >
                  <r.icon className="h-4 w-4" style={{ color: 'oklch(0.75 0.12 80)' }} />
                </div>
                <div>
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {r.title}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
