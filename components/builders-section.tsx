'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const FALLBACK_BUILDERS = [
  {
    name: 'Prestige Group',
    tagline: 'India\'s most trusted luxury developer',
    totalProjects: 60,
    badge: 'ISO 9001',
    color: '#c9a84c',
  },
  {
    name: 'Brigade Group',
    tagline: 'Redefining urban living in South India',
    totalProjects: 250,
    badge: 'CRISIL A+',
    color: '#b8860b',
  },
  {
    name: 'Sobha Limited',
    tagline: 'Backward integration quality leader',
    totalProjects: 100,
    badge: 'ISO 14001',
    color: '#d4a843',
  },
]

export function BuildersSection() {
  const [builders, setBuilders] = useState(FALLBACK_BUILDERS)
  const [loading, setLoading] = useState(true)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (!isInitialMount.current) return
    isInitialMount.current = false
    fetchBuilders()
  }, [])

  const fetchBuilders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/builders?page=1&limit=6')
      const data = await response.json()
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const mappedBuilders = data.data.map((b: any) => ({
          name: b.name || '',
          tagline: b.description || 'Premium real estate developer',
          totalProjects: b.totalProjects || 0,
          badge: b.isVerified ? 'VERIFIED' : 'TIER-1',
          color: '#c9a84c',
        }))
        // Use mapped builders if available, otherwise fall back to default
        if (mappedBuilders.length > 0) {
          setBuilders(mappedBuilders)
        } else {
          setBuilders(FALLBACK_BUILDERS)
        }
      } else {
        // If API returns no data, use fallback
        setBuilders(FALLBACK_BUILDERS)
      }
    } catch (error) {
      console.error('[Builders] API Error:', error)
      setBuilders(FALLBACK_BUILDERS)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="builders" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 max-w-2xl flex items-start justify-between">
          <div className="flex-1">
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
          <Link href="/builders">
            <Button variant="outline" className="ml-4 shrink-0 gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Builder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40">
          {builders.map((b) => (
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
                {b.totalProjects}+ projects delivered
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
