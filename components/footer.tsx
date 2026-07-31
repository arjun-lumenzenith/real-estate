'use client'

import { Separator } from '@/components/ui/separator'
import { Phone, Mail, MapPin } from 'lucide-react'
import LeadDialog from '@/components/lead-dialog'
import { useEffect, useState, useRef } from 'react'

const FALLBACK_LOCALITIES = [
  'Whitefield',
  'Sarjapur Road',
  'Electronic City',
  'Hebbal',
  'Kanakapura Road',
  'Devanahalli',
]

const FALLBACK_BUILDERS = [
  'Prestige Group',
  'Brigade Group',
  'Sobha Limited',
  'Godrej Properties',
  'Puravankara',
  'Embassy Group',
]

// ADD COMPONENT PROP DEFINITIONS FOR YOUR STATE MANAGEMENT HOOKS
interface FooterProps {
  locs?: string[];
  setLocs?: (v: string[]) => void;
}

export function Footer({ locs = [], setLocs }: FooterProps) {
  const [builders, setBuilders] = useState<Array<{ name: string }>>([])
  const [localities, setLocalities] = useState<string[]>([])
  const [totalBuilders, setTotalBuilders] = useState(0)
  const [totalLocalities, setTotalLocalities] = useState(0)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (!isInitialMount.current) return
    isInitialMount.current = false

    const fetchData = async () => {
      try {
        // Fetch top 6 tier1 builders (single API call, use pagination metadata for total)
        const buildersRes = await fetch('/api/builders?page=1&limit=6')
        const buildersData = await buildersRes.json()
        if (buildersData.success && Array.isArray(buildersData.data)) {
          setBuilders(buildersData.data)
          // Use pagination metadata to get total count instead of making another call
          if (buildersData.pagination) {
            setTotalBuilders(buildersData.pagination.total)
          }
        } else {
          setBuilders(FALLBACK_BUILDERS.map(name => ({ name })))
          setTotalBuilders(FALLBACK_BUILDERS.length)
        }
      } catch (error) {
        console.error('[Footer] Error fetching builders:', error)
        setBuilders(FALLBACK_BUILDERS.map(name => ({ name })))
        setTotalBuilders(FALLBACK_BUILDERS.length)
      }

      try {
        // Fetch unique localities from properties table
        const propsRes = await fetch('/api/properties?limit=10')
        const propsData = await propsRes.json()
        if (propsData.success && Array.isArray(propsData.data)) {
          const uniqueLocs = Array.from(new Set(propsData.data.map((p: any) => p.locality))).filter(Boolean)
          setLocalities(uniqueLocs.slice(0, 6) as string[])
          setTotalLocalities(uniqueLocs.length)
        } else {
          setLocalities(FALLBACK_LOCALITIES)
          setTotalLocalities(FALLBACK_LOCALITIES.length)
        }
      } catch (error) {
        console.error('[Footer] Error fetching localities:', error)
        setLocalities(FALLBACK_LOCALITIES)
        setTotalLocalities(FALLBACK_LOCALITIES.length)
      }
    }

    fetchData()
  }, [])
  
  // Custom click logic block - now triggers API call through state update
  const handleLocalityClick = (e: React.MouseEvent, localityName: string) => {
    // 1. Prevent native hashtag jumping behavior
    e.preventDefault();
    
    if (setLocs) {
      // 2. Add to active filters array list if it isn't present
      if (!locs.includes(localityName)) {
        setLocs([...locs, localityName]);
      }
      
      // 3. Smooth scroll up to the property grid - loading will be handled by useEffect in SearchSection
      setTimeout(() => {
        document.getElementById('property-grid')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      // Fallback if state bridges fail
      document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p
              className="text-xl font-semibold tracking-widest uppercase mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.75 0.12 80)' }}
            >
              Lumen<span className="text-foreground">Zenith</span>
            </p>
            <p
              className="text-xs text-muted-foreground leading-relaxed mb-6"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Bangalore&apos;s trusted RERA-registered channel partner for premium residential
              real estate. Serving buyers and investors since 2026.
            </p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              <a href="tel:+919900891647" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                +91 99008 91647
              </a>
              <a href="mailto:info@lumenzenith.in" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                info@lumenzenith.com
              </a>
              <span className="flex items-start gap-2 text-xs leading-normal">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                235, 2nd & 3rd Floor, 13th Cross Road, Indiranagar 2nd Stage, Hoysala Nagar Bangalore — 560038
              </span>
            </div>
          </div>

          {/* Localities (Linked up to active state checks) */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p
                className="text-xs tracking-widest uppercase text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Localities
              </p>
              {totalLocalities > 6 && (
                <span className="text-[10px] text-muted-foreground">+{totalLocalities - 6} more</span>
              )}
            </div>
            <ul className="flex flex-col gap-2.5">
              {localities.map((l) => (
                <li key={l}>
                  <a
                    href="#search"
                    onClick={(e) => handleLocalityClick(e, l)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-between"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <span>{l}</span>
                    {locs.includes(l) && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            {totalLocalities > 6 && (
              <a
                href="#search"
                className="text-xs text-primary hover:text-primary/80 transition-colors mt-3 inline-block"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                View All Localities →
              </a>
            )}
          </div>

          {/* Builders */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p
                className="text-xs tracking-widest uppercase text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Our Builders
              </p>
              {totalBuilders > 6 && (
                <span className="text-[10px] text-muted-foreground">+{totalBuilders - 6} more</span>
              )}
            </div>
            <ul className="flex flex-col gap-2.5">
              {builders.map((b) => (
                <li key={b.name}>
                  <a
                    href="#builders"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {b.name}
                  </a>
                </li>
              ))}
            </ul>
            {totalBuilders > 6 && (
              <a
                href="#builders"
                className="text-xs text-primary hover:text-primary/80 transition-colors mt-3 inline-block"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                View All Builders →
              </a>
            )}
          </div>

          {/* Quick links */}
          <div>
            <p
              className="text-xs tracking-widest uppercase mb-5 text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Quick Links
            </p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="#about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#search"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  All Projects
                </a>
              </li>
              <li style={{ fontFamily: 'var(--font-body)' }}>
                <LeadDialog
                  triggerText="Book a Site Visit"
                  triggerVariant="ghost"
                  className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground justify-start"
                />
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  RERA Disclosure
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-border/60" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-xs text-muted-foreground text-center sm:text-left"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            &copy; {new Date().getFullYear()} LumenZenith Realty Pvt. Ltd. All rights reserved.
            RERA Reg. No: To be updated soon
          </p>
          <p
            className="text-xs text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            ** KRERA Certified
          </p>
        </div>
      </div>
    </footer>
  )
}
