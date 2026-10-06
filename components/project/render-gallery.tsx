'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const AUTOPLAY_INTERVAL_MS = 4000

interface Render {
  src: string
  title: string
  caption: string
}

export function RenderGallery({ renders, projectName }: { renders: Render[]; projectName: string }) {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isTabHidden, setIsTabHidden] = useState(false)
  const count = renders.length
  const go = (next: number) => setIndex((next + count) % count)
  const active = renders[index]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setIsPlaying(false)
    const onVisibilityChange = () => setIsTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // Re-arms on every index change so manual navigation restarts the full interval.
  useEffect(() => {
    if (!isPlaying || isTabHidden || count < 2) return
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [index, isPlaying, isTabHidden, count])

  return (
    <section
      id="renders"
      className="scroll-mt-16 bg-background py-20 md:py-28"
      aria-roledescription="carousel"
      aria-label={`${projectName} renders`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-primary">Gallery</p>
            <h2 className="font-(family-name:--font-display) text-4xl font-light text-balance sm:text-5xl">
              A closer look at {projectName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="mr-3 font-mono text-xs text-muted-foreground"
              aria-live={isPlaying ? 'off' : 'polite'}
            >
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label="Previous render"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label="Next render"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className="relative aspect-4/3 overflow-hidden border border-border bg-card sm:aspect-video"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') go(index - 1)
            if (e.key === 'ArrowRight') go(index + 1)
          }}
          aria-label="Use left and right arrow keys to browse renders"
        >
          {renders.map((render, i) => (
            <Image
              key={render.src}
              src={render.src}
              alt={`${render.title} — ${render.caption}`}
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className={cn(
                'object-cover transition-opacity duration-700 ease-out',
                i === index ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden={i !== index}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-background/90 to-transparent px-6 pb-6 pt-16">
            <p className="font-(family-name:--font-display) text-2xl text-foreground">{active.title}</p>
            <p className="text-sm text-foreground/75">{active.caption}</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {renders.map((render, i) => (
            <button
              key={render.src}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'relative aspect-video overflow-hidden border transition-all',
                i === index ? 'border-primary opacity-100' : 'border-border opacity-50 hover:opacity-90',
              )}
              aria-label={`Show ${render.title}`}
              aria-current={i === index}
            >
              <Image src={render.src} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
