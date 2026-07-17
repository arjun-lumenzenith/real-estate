'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/pagination'

interface Builder {
  id: string
  name: string
  description?: string
  totalProjects: number
  phoneNumber?: string
  email?: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([])
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const isInitialMount = useRef(true)

  const fetchBuilders = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/builders?page=${page}&limit=10`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setBuilders(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
          setCurrentPage(page)
        }
      }
    } catch (error) {
      console.error('Error fetching builders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      fetchBuilders(1)
    }
  }, [])

  const handlePageChange = (page: number) => {
    fetchBuilders(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">All Builders</h1>
          <p className="text-muted-foreground">Discover all premium real estate developers</p>
        </div>
      </section>

      {/* Builders Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : builders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No builders found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {builders.map((builder) => (
                  <div
                    key={builder.id}
                    className="bg-card border border-border/40 rounded-lg p-6 hover:border-primary/50 transition-colors"
                  >
                    <h3 className="text-xl font-semibold text-foreground mb-2">{builder.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{builder.description}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Projects Delivered</span>
                        <span className="font-semibold text-primary">{builder.totalProjects}+</span>
                      </div>
                      
                      {builder.phoneNumber && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Phone: </span>
                          <a href={`tel:${builder.phoneNumber}`} className="text-primary hover:underline">
                            {builder.phoneNumber}
                          </a>
                        </div>
                      )}
                      
                      {builder.email && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Email: </span>
                          <a href={`mailto:${builder.email}`} className="text-primary hover:underline truncate">
                            {builder.email}
                          </a>
                        </div>
                      )}
                      
                      {builder.website && (
                        <a 
                          href={builder.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block text-xs text-primary hover:underline mt-2"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                  isLoading={loading}
                />
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
