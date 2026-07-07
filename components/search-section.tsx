'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, MapPin, IndianRupee, Home, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import Image from 'next/image'

const LOCALITIES = ['Whitefield', 'Sarjapur Road', 'Electronic City', 'Hebbal', 'Kanakapura Road', 'Bannerghatta Road', 'Koramangala', 'Indiranagar', 'Yelahanka', 'Devanahalli', 'North Bangalore']
const BUDGETS = ['Under ₹50 Lakhs', '₹50 L — ₹1 Cr', '₹1 Cr — ₹1.5 Cr', '₹1.5 Cr — ₹2 Cr', '₹2 Cr — ₹3 Cr', '₹3 Cr — ₹5 Cr', 'Above ₹5 Cr']
const BHK_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK / Penthouse']

const FEATURED = [
  { image: '/property-1.png', name: 'The Prestige City', locality: 'Sarjapur Road', builder: 'Prestige Group', price: '₹75 L onwards', bhk: '2, 3, 4 BHK', status: 'Under Construction', rera: 'PRM/KA/RERA/1251' },
  { image: '/property-2.png', name: 'Brigade Orchards', locality: 'Devanahalli', builder: 'Brigade Group', price: '₹60 L onwards', bhk: '1, 2, 3 BHK', status: 'Ready to Move', rera: 'PRM/KA/RERA/1389' },
  { image: '/property-3.png', name: 'Sobha City', locality: 'Whitefield', builder: 'Sobha Limited', price: '₹1.2 Cr onwards', bhk: '2, 3, 4 BHK', status: 'New Launch', rera: 'PRM/KA/RERA/1102' }
]

const STATUS_COLORS: Record<string, string> = { 'Under Construction': 'oklch(0.65 0.14 60)', 'Ready to Move': 'oklch(0.65 0.14 150)', 'New Launch': 'oklch(0.75 0.12 80)' }

// Change it to this:
export function SearchSection({ locs, setLocs, buds, setBuds, bhks, setBhks }: any) {

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  // Custom handler for footer/bottom locality quick-links
  const handleBottomLocalityClick = (localityName: string) => {
    // 1. If the array does not contain it, inject it into the active states matrix
    if (!locs.includes(localityName)) {
      setLocs([...locs, localityName])
    }
    
    // 2. Execute an instant, fluid viewport anchor scroll to the property results grid
    setTimeout(() => {
      document.getElementById('property-grid')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  // This dynamically filters your data whenever a checkbox is ticked
  const filteredProperties = FEATURED.filter((property) => {
    // If no localities are checked, match all. Otherwise, check for intersection.
    const matchesLocality = locs.length === 0 || locs.includes(property.locality)
    
    // Note: For now, this handles exact strings. You can map budgets and BHKs here later as your data scales.
    return matchesLocality
  })

  // Configuration map array to print the 3 filters via a single compressed loop
  const config = [
    { label: 'Select Localities', icon: <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />, options: LOCALITIES, state: locs, setState: setLocs },
    { label: 'Select Budgets', icon: <IndianRupee className="h-4 w-4 shrink-0 text-muted-foreground" />, options: BUDGETS, state: buds, setState: setBuds },
    { label: 'BHK Type', icon: <Home className="h-4 w-4 shrink-0 text-muted-foreground" />, options: BHK_TYPES, state: bhks, setState: setBhks }
  ]

  return (
    <section id="search" className="py-24 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-body)', color: 'oklch(0.75 0.12 80)' }}>Property Search</p>
          <h2 className="text-4xl sm:text-5xl font-light leading-tight text-balance" style={{ fontFamily: 'var(--font-display)' }}>Discover Premium <span style={{ color: 'oklch(0.75 0.12 80)' }}>Bangalore Homes</span></h2>
        </div>

        {/* Compressed Dynamic Filtering Input Grid */}
        <div className="bg-card border border-border p-1 mb-12 flex flex-col sm:flex-row gap-1">
          {config.map((filter, index) => (
            <div key={index} className="flex-1 flex items-center gap-2 px-4 py-2 border-b sm:border-b-0 sm:border-r last:border-r-0 border-border">
              {filter.icon}
              <Popover>
                <PopoverTrigger asChild>
                <div className="w-full flex items-center justify-between py-1 text-sm font-normal bg-transparent text-foreground cursor-pointer select-none">
                  <span className="truncate">
                    {filter.state.length === 0 ? filter.label : `${filter.state.length} Selected`}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50 ml-2 shrink-0" />
                </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 max-h-72 overflow-y-auto bg-card border-border p-2 shadow-lg" align="start">
                  <div className="flex flex-col gap-1">
                    {filter.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm font-light">
                        <Checkbox checked={filter.state.includes(opt)} onCheckedChange={() => toggle(filter.state, filter.setState, opt)} className="border-muted-foreground/40" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ))}
          <Button 
            className="rounded-none px-6 text-xs tracking-widest uppercase font-medium cursor-pointer"
            style={{ backgroundColor: 'oklch(0.75 0.12 80)', color: 'oklch(0.13 0.025 255)' }}
            onClick={() => {
              // Optional: Smoothly scroll down just a tiny bit to the cards grid instead of the absolute bottom
              document.getElementById('property-grid')?.scrollIntoView({ behavior: 'smooth' })
            }}
            ><Search className="h-4 w-4 mr-2" />Search
          </Button>
        </div>

        {/* Active badge metrics */}
        {(locs.length > 0 || buds.length > 0 || bhks.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Active filters:</span>
            {locs.map((l) => <span key={l} className="text-xs px-2 py-1 border border-primary/40 text-primary flex items-center gap-1.5 bg-primary/5">{l}<X className="h-3 w-3 cursor-pointer" onClick={() => toggle(locs, setLocs, l)} /></span>)}
            {buds.map((b) => <span key={b} className="text-xs px-2 py-1 border border-primary/40 text-primary flex items-center gap-1.5 bg-primary/5">{b}<X className="h-3 w-3 cursor-pointer" onClick={() => toggle(buds, setBuds, b)} /></span>)}
            {bhks.map((k) => <span key={k} className="text-xs px-2 py-1 border border-primary/40 text-primary flex items-center gap-1.5 bg-primary/5">{k}<X className="h-3 w-3 cursor-pointer" onClick={() => toggle(bhks, setBhks, k)} /></span>)}
            <Button variant="link" onClick={() => { setLocs([]); setBuds([]); setBhks([]); }} className="text-xs h-auto p-0 text-muted-foreground hover:text-destructive">Clear all</Button>
          </div>
        )}

        {/* Layout Cards */}
        <div id="property-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-mt-24">
          {filteredProperties.map((p) => (
            <article key={p.name} className="bg-card group cursor-pointer overflow-hidden border border-border/40 rounded-sm">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-medium px-2 py-1" style={{ fontFamily: 'var(--font-body)', backgroundColor: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status], border: `1px solid ${STATUS_COLORS[p.status]}30` }}>{p.status}</span>
              </div>
              <div className="p-6 flex flex-col gap-2.5">
                <div>
                  <h3 className="text-lg font-medium leading-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</h3>
                  <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" /><p className="text-xs font-light">{p.locality} &bull; {p.builder}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  <span>{p.bhk}</span><span className="font-medium" style={{ color: 'oklch(0.75 0.12 80)' }}>{p.price}</span>
                </div>
                <div className="text-[10px] opacity-40 font-mono tracking-tight">RERA: {p.rera}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
