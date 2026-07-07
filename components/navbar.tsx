'use client'

import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { label: 'Projects', href: '#projects' },
    { label: 'Builders', href: '#builders' },
    { label: 'Localities', href: '#search' },
    { label: 'About', href: '#about' },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span
              className="text-xl font-semibold tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.75 0.12 80)' }}
            >
              Lumen<span className="text-foreground">Zenith</span>
            </span>
            <span className="hidden sm:block text-xs tracking-widest text-muted-foreground uppercase">
              Realty
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+919900891647"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              +91 99008 91647
            </a>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-wide text-xs uppercase"
              asChild
            >
              <a href="#lead">Book a Site Visit</a>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-t border-border/40 px-6 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Button size="sm" className="mt-2 bg-primary text-primary-foreground w-full text-xs uppercase tracking-wide" asChild>
            <a href="#lead">Book a Site Visit</a>
          </Button>
        </div>
      )}
    </header>
  )
}
