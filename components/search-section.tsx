'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MapPin, IndianRupee, Home, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'

const LOCALITIES = [
  'Whitefield',
  'Sarjapur Road',
  'Electronic City',
  'Hebbal',
  'Kanakapura Road',
  'Bannerghatta Road',
  'Koramangala',
  'Indiranagar',
  'Yelahanka',
  'Devanahalli',
  'North Bangalore',
]

const BUDGETS = [
  'Under ₹50 Lakhs',
  '₹50 L — ₹1 Cr',
  '₹1 Cr — ₹1.5 Cr',
  '₹1.5 Cr — ₹2 Cr',
  '₹2 Cr — ₹3 Cr',
  '₹3 Cr — ₹5 Cr',
  'Above ₹5 Cr',
]

const BHK_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK / Penthouse']

const FEATURED = [
  {
    image: '/property-1.png',
    name: 'The Prestige City',
    locality: 'Sarjapur Road',
    builder: 'Prestige Group',
    price: '₹75 L onwards',
    bhk: '2, 3, 4 BHK',
    status: 'Under Construction',
    rera: 'PRM/KA/RERA/1251',
  },
  {
    image: '/property-2.png',
    name: 'Brigade Orchards',
    locality: 'Devanahalli',
    builder: 'Brigade Group',
    price: '₹60 L onwards',
    bhk: '1, 2, 3 BHK',
    status: 'Ready to Move',
    rera: 'PRM/KA/RERA/1389',
  },
  {
    image: '/property-3.png',
    name: 'Sobha City',
    locality: 'Whitefield',
    builder: 'Sobha Limited',
    price: '₹1.2 Cr onwards',
    bhk: '2, 3, 4 BHK',
    status: 'New Launch',
    rera: 'PRM/KA/RERA/1102',
  },
]

const STATUS_COLORS: Record<string, string> = {
  'Under Construction': 'oklch(0.65 0.14 60)',
  'Ready to Move': 'oklch(0.65 0.14 150)',
  'New Launch': 'oklch(0.75 0.12 80)',
}

export function SearchSection() {
  const [locality, setLocality] = useState('')
  const [budget, setBudget] = useState('')
  const [bhk, setBhk] = useState('')

  return (
    <section id="search" className="py-24 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 max-w-2xl">
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ fontFamily: 'var(--font-body)', color: 'oklch(0.75 0.12 80)' }}
          >
            Property Search
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light leading-tight text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Discover Premium{' '}
            <span style={{ color: 'oklch(0.75 0.12 80)' }}>Bangalore Homes</span>
          </h2>
        </div>

        {/* Filter bar */}
        <div className="bg-card border border-border p-1 mb-12 flex flex-col sm:flex-row gap-1">
          {/* Locality */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 border-b sm:border-b-0 sm:border-r border-border">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Select onValueChange={setLocality} value={locality}>
              <SelectTrigger className="border-0 shadow-none p-0 h-auto text-sm bg-transparent focus:ring-0 text-foreground">
                <SelectValue placeholder="Select Locality" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {LOCALITIES.map((l) => (
                  <SelectItem key={l} value={l} className="text-sm">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 border-b sm:border-b-0 sm:border-r border-border">
            <IndianRupee className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Select onValueChange={setBudget} value={budget}>
              <SelectTrigger className="border-0 shadow-none p-0 h-auto text-sm bg-transparent focus:ring-0 text-foreground">
                <SelectValue placeholder="Select Budget" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {BUDGETS.map((b) => (
                  <SelectItem key={b} value={b} className="text-sm">
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* BHK */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 border-b sm:border-b-0 sm:border-r border-border">
            <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Select onValueChange={setBhk} value={bhk}>
              <SelectTrigger className="border-0 shadow-none p-0 h-auto text-sm bg-transparent focus:ring-0 text-foreground">
                <SelectValue placeholder="BHK Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {BHK_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-sm">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search button */}
          <Button
            className="rounded-none px-6 text-xs tracking-widest uppercase font-medium"
            style={{ backgroundColor: 'oklch(0.75 0.12 80)', color: 'oklch(0.13 0.025 255)' }}
            asChild
          >
            <a href="#lead">
              <Search className="h-4 w-4 mr-2" />
              Search
            </a>
          </Button>
        </div>

        {/* Active filters display */}
        {(locality || budget || bhk) && (
          <div className="flex flex-wrap items-center gap-2 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {locality && (
              <span className="text-xs px-2 py-1 border border-primary/40 text-primary">
                {locality}
              </span>
            )}
            {budget && (
              <span className="text-xs px-2 py-1 border border-primary/40 text-primary">
                {budget}
              </span>
            )}
            {bhk && (
              <span className="text-xs px-2 py-1 border border-primary/40 text-primary">
                {bhk}
              </span>
            )}
          </div>
        )}

        {/* Property cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40">
          {FEATURED.map((p) => (
            <article key={p.name} className="bg-card group cursor-pointer overflow-hidden">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Status badge */}
                <span
                  className="absolute top-3 left-3 text-xs px-2 py-1 tracking-widest uppercase font-medium"
                  style={{
                    fontFamily: 'var(--font-body)',
                    backgroundColor: `${STATUS_COLORS[p.status]}20`,
                    color: STATUS_COLORS[p.status],
                    border: `1px solid ${STATUS_COLORS[p.status]}50`,
                  }}
                >
                  {p.status}
                </span>
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col gap-3">
                <div>
                  <h3
                    className="text-xl font-medium leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground mt-1 flex items-center gap-1"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    {p.locality} &bull; {p.builder}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p
                      className="text-lg font-medium"
                      style={{ fontFamily: 'var(--font-display)', color: 'oklch(0.75 0.12 80)' }}
                    >
                      {p.price}
                    </p>
                    <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                      {p.bhk}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>RERA</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.rera}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full rounded-none text-xs tracking-widest uppercase font-medium mt-1 bg-transparent border"
                  style={{
                    borderColor: 'oklch(0.75 0.12 80 / 0.4)',
                    color: 'oklch(0.75 0.12 80)',
                  }}
                  asChild
                >
                  <a href="#lead">Enquire Now</a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
