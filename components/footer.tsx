import { Separator } from '@/components/ui/separator'
import { Phone, Mail, MapPin } from 'lucide-react'

const LOCALITIES = [
  'Whitefield',
  'Sarjapur Road',
  'Electronic City',
  'Hebbal',
  'Kanakapura Road',
  'Devanahalli',
]

const BUILDERS = [
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
  
  // Custom click logic block
  const handleLocalityClick = (e: React.MouseEvent, localityName: string) => {
    // 1. Prevent native hashtag jumping behavior
    e.preventDefault();
    
    if (setLocs) {
      // 2. Add to active filters array list if it isn't present
      if (!locs.includes(localityName)) {
        setLocs([...locs, localityName]);
      }
      
      // 3. Smooth scroll up instantly to the top edge of your matching grid cards
      setTimeout(() => {
        document.getElementById('property-grid')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      // Fallback fallback if state bridges fail
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
              real estate. Serving buyers and investors since 2016.
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
            <p
              className="text-xs tracking-widest uppercase mb-5 text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Localities
            </p>
            <ul className="flex flex-col gap-2.5">
              {LOCALITIES.map((l) => (
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
          </div>

          {/* Builders */}
          <div>
            <p
              className="text-xs tracking-widest uppercase mb-5 text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Our Builders
            </p>
            <ul className="flex flex-col gap-2.5">
              {BUILDERS.map((b) => (
                <li key={b}>
                  <a
                    href="#builders"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {b}
                  </a>
                </li>
              ))}
            </ul>
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
              {[
                { label: 'About Us', href: '#about' },
                { label: 'All Projects', href: '#search' },
                { label: 'Book a Site Visit', href: '#lead' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'RERA Disclosure', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
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
            RERA Reg. No: PRM/KA/RERA/7890/AG
          </p>
          <p
            className="text-xs text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            MahaRERA &bull; CREDAI Member &bull; NAR India Affiliate
          </p>
        </div>
      </div>
    </footer>
  )
}