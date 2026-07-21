'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, MapPin, IndianRupee, Home, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import Image from 'next/image'
import { Pagination } from '@/components/pagination'

const LOCALITIES = ['Whitefield', 'Sarjapur Road', 'Electronic City', 'Hebbal', 'Kanakapura Road', 'Bannerghatta Road', 'Koramangala', 'Indiranagar', 'Yelahanka', 'Devanahalli', 'North Bangalore']
const BUDGETS = ['Under ₹50 Lakhs', '₹50 L — ₹1 Cr', '₹1 Cr — ₹1.5 Cr', '₹1.5 Cr — ₹2 Cr', '₹2 Cr — ₹3 Cr', '₹3 Cr — ₹5 Cr', 'Above ₹5 Cr']
const BHK_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK / Penthouse']

const FEATURED = [
  { image: '/property-1.png', name: 'The Prestige City', locality: 'Sarjapur Road', builder: 'Prestige Group', price: '₹75 L onwards', bhk: '2, 3, 4 BHK', status: 'Under Construction', rera: 'PRM/KA/RERA/1251' },
  { image: '/property-2.png', name: 'Brigade Orchards', locality: 'Devanahalli', builder: 'Brigade Group', price: '₹60 L onwards', bhk: '1, 2, 3 BHK', status: 'Ready to Move', rera: 'PRM/KA/RERA/1389' },
  { image: '/property-3.png', name: 'Sobha City', locality: 'Whitefield', builder: 'Sobha Limited', price: '₹1.2 Cr onwards', bhk: '2, 3, 4 BHK', status: 'New Launch', rera: 'PRM/KA/RERA/1102' }
]

const STATUS_COLORS: Record<string, string> = { 'Under Construction': 'oklch(0.65 0.14 60)', 'Ready to Move': 'oklch(0.65 0.14 150)', 'New Launch': 'oklch(0.75 0.12 80)' }

const parseBudgetToNumber = (budgetText: string): string => {
  if (!budgetText) return '0'
  
  // Strip out currency symbols, spaces, and commas
  const cleanStr = budgetText.replace(/[₹\s,]/g, '')
  const numericValue = parseFloat(cleanStr) || 0
  
  if (cleanStr.includes('Cr')) {
    return (numericValue * 10000000).toString() // 1 Crore = 10,000,000
  }
  if (cleanStr.includes('L')) {
    return (numericValue * 100000).toString() // 1 Lakh = 100,000
  }
  return numericValue.toString()
}

export function SearchSection({ locs, setLocs, buds, setBuds, bhks, setBhks }: any) {
  const [apiProperties, setApiProperties] = useState(FEATURED)
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationData, setPaginationData] = useState({ 
    total: FEATURED.length, 
    totalPages: Math.ceil(FEATURED.length / 10), 
    page: 1, 
    limit: 10 
  })
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  // Auto-fetch when filters change (with 2-second debounce)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      // Call immediately on first mount
      fetchProperties(1)
      return
    }

    // Reset to page 1 when filters change
    setCurrentPage(1)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce subsequent filter changes
    debounceTimerRef.current = setTimeout(() => {
      fetchProperties(1)
    }, 2000)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [locs, buds, bhks])

  const fetchProperties = async (page: number = 1) => {
    try {
      setLoadingProperties(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      // 1. Join all localities with a comma
      if (locs && locs.length > 0) {
        params.append('locality', locs.join(','))
      }

      // 2. Aggregate minimum and maximum ranges across all budget choices
      if (buds && buds.length > 0) {
        let absoluteMin = Infinity
        let absoluteMax = -Infinity

        buds.forEach((budgetString: string) => {
          if (budgetString.includes('—')) {
            const [minStr, maxStr] = budgetString.split('—')
            const minNum = parseFloat(parseBudgetToNumber(minStr))
            const maxNum = parseFloat(parseBudgetToNumber(maxStr))
            
            if (minNum < absoluteMin) absoluteMin = minNum
            if (maxNum > absoluteMax) absoluteMax = maxNum
          } else {
            const singleNum = parseFloat(parseBudgetToNumber(budgetString))
            if (singleNum < absoluteMin) absoluteMin = singleNum
          }
        })

        if (absoluteMin !== Infinity) params.append('minBudget', absoluteMin.toString())
        if (absoluteMax !== -Infinity) params.append('maxBudget', absoluteMax.toString())
      }

      // 3. Map out the raw strings, strip "BHK", and join with commas
      if (bhks && bhks.length > 0) {
        const cleanBhks = bhks.map((bhkItem: string) => 
          bhkItem.replace(/ BHK.*/, '').trim()
        )
        params.append('bhkType', cleanBhks.join(','))
      }
      
      const response = await fetch(`/api/properties?${params}`)
      const data = await response.json()
      if (data.success && data.data) {
        setApiProperties(data.data)
        if (data.pagination) {
          setPaginationData(data.pagination)
          setCurrentPage(page)
        }
      } else {
        setApiProperties(FEATURED)
        setPaginationData({ total: FEATURED.length, totalPages: 1, page: 1, limit: 10 })
      }
    } catch (error) {
      console.error('[Search] API Error:', error)
      setApiProperties(FEATURED)
      setPaginationData({ total: FEATURED.length, totalPages: 1, page: 1, limit: 10 })
    } finally {
      setLoadingProperties(false)
    }
  }

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setLoadingProperties(true)
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

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
              <PopoverTrigger 
                  className="w-full flex items-center justify-between py-1 text-sm font-normal bg-transparent text-foreground cursor-pointer select-none border-none outline-none"
                >
                  <span className="truncate">
                    {filter.state.length === 0 ? filter.label : `${filter.state.length} Selected`}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50 ml-2 shrink-0" />
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
            className="rounded-none px-6 text-xs tracking-widest uppercase font-medium cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: 'oklch(0.75 0.12 80)', color: 'oklch(0.13 0.025 255)' }}
            onClick={async () => {
              await fetchProperties()
              setTimeout(() => {
                document.getElementById('property-grid')?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
            disabled={loadingProperties}
            ><Search className="h-4 w-4 mr-2" />{loadingProperties ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Active badge metrics */}
        {(locs.length > 0 || buds.length > 0 || bhks.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Active filters:</span>
            {locs.map((l) => <span key={l} className="text-xs px-2 py-1 border border-primary/40 text-primary flex items-center gap-1.5 bg-primary/5">{l}<X className="h-3 w-3 cursor-pointer" onClick={() => toggle(locs, setLocs, l)} /></span>)}
            {buds.map((b) => <span key={b} className="text-xs px-2 py-1 border border-primary/40 text-primary flex items-center gap-1.5 bg-primary/5">{b}<X className="h-3 w-3 cursor-pointer" onClick={() => toggle(buds, setBuds, b)} /></span>)}
            {bhks.map((k) => <span key={k} className="text-xs px-2 py-1 border border-primary/40 text-primary flex items-center gap-1.5 bg-primary/5">{k}<X className="h-3 w-3 cursor-pointer" onClick={() => toggle(bhks, setBhks, k)} /></span>)}
            <Button variant="link" onClick={() => { setLoadingProperties(true); setLocs([]); setBuds([]); setBhks([]); }} className="text-xs h-auto p-0 text-muted-foreground hover:text-destructive" disabled={loadingProperties}>Clear all</Button>
          </div>
        )}

        {/* Layout Cards */}
        <div id="property-grid" className={`grid grid-cols-1 md:grid-cols-3 gap-6 scroll-mt-24 ${loadingProperties ? 'opacity-50 pointer-events-none' : ''}`}>
          {loadingProperties ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : (
            apiProperties.map((p, idx) => (
            <article key={p.id || p.name || p.title || `property-${idx}`} className="bg-card group cursor-pointer overflow-hidden border border-border/40 rounded-sm">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority={false} />
                ) : (
                  <div className="text-muted-foreground text-sm">No image available</div>
                )}
                <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-medium px-2 py-1" style={{ fontFamily: 'var(--font-body)', backgroundColor: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status], border: `1px solid ${STATUS_COLORS[p.status]}30` }}>{p.status}</span>
              </div>
              <div className="p-6 flex flex-col gap-2.5">
                <div>
                  <h3 className="text-lg font-medium leading-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                  <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" /><p className="text-xs font-light">{p.locality}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  <span>{p.bhkOptions} BHK</span><span className="font-medium" style={{ color: 'oklch(0.75 0.12 80)' }}>₹{Number((p.minPrice / 10000000).toFixed(5))}Cr-₹{Number((p.maxPrice / 10000000).toFixed(5))}Cr</span>
                </div>
                <div className="text-[10px] opacity-40 font-mono tracking-tight">RERA: {p.reraNumber}</div>
              </div>
            </article>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          totalItems={paginationData.total}
          itemsPerPage={paginationData.limit}
          onPageChange={(page) => fetchProperties(page)}
          isLoading={loadingProperties}
        />
      </div>
    </section>
  )
}
