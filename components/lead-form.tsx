'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Lock, Phone, Mail, User, MapPin, Home } from 'lucide-react'

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
  'Any / Open to Suggestions',
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

const TRUST_POINTS = [
  'Zero brokerage from buyers',
  'RERA-verified properties only',
  '100% data privacy guaranteed',
  'Expert advisor assigned within 2 hrs',
]

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    locality: '',
    budget: '',
    bhk: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name.'
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit Indian mobile number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    // Simulate async submission
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  const inputClass =
    'rounded-none bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/60 h-11 text-sm'

  if (submitted) {
    return (
      <section id="lead" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <CheckCircle2
              className="h-16 w-16 mx-auto mb-6"
              style={{ color: 'oklch(0.75 0.12 80)' }}
            />
            <h2
              className="text-4xl font-light mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Thank You, {form.name.split(' ')[0]}!
            </h2>
            <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Your request has been received. A dedicated property advisor will call you within{' '}
              <strong className="text-foreground">2 business hours</strong> to understand your requirements.
            </p>
            <p className="mt-4 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              Reference ID:{' '}
              <span className="font-mono text-foreground">
                LZ-{Date.now().toString().slice(-6)}
              </span>
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="lead" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — copy */}
          <div>
            <p
              className="text-xs tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-body)', color: 'oklch(0.75 0.12 80)' }}
            >
              Free Consultation
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light leading-tight text-balance mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Let Us Find Your{' '}
              <span style={{ color: 'oklch(0.75 0.12 80)' }}>Dream Home</span>
            </h2>
            <p
              className="text-muted-foreground leading-relaxed mb-10"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Share your requirements and our expert advisors will curate a personalised shortlist
              of properties matching your budget, lifestyle, and location preferences — completely
              free of charge.
            </p>

            <ul className="flex flex-col gap-4">
              {TRUST_POINTS.map((pt) => (
                <li key={pt} className="flex items-start gap-3">
                  <CheckCircle2
                    className="h-4 w-4 mt-0.5 shrink-0"
                    style={{ color: 'oklch(0.75 0.12 80)' }}
                  />
                  <span
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {pt}
                  </span>
                </li>
              ))}
            </ul>

            {/* Privacy note */}
            <div className="mt-10 flex items-start gap-3 p-4 border border-border/60 bg-card">
              <Lock
                className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground"
              />
              <p
                className="text-xs text-muted-foreground leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Your personal information is encrypted and never shared with third parties.
                LumenZenith Realty is compliant with applicable Indian data protection laws.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-card border border-border p-8">
            <h3
              className="text-2xl font-light mb-8"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Get a Free Callback
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-xs tracking-wide uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value })
                      setErrors({ ...errors, name: '' })
                    }}
                    className={`${inputClass} pl-9`}
                    autoComplete="name"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive" style={{ fontFamily: 'var(--font-body)' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobile" className="text-xs tracking-wide uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    +91
                  </span>
                  <Phone className="absolute left-11 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="99000 00000"
                    value={form.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setForm({ ...form, mobile: val })
                      setErrors({ ...errors, mobile: '' })
                    }}
                    className={`${inputClass} pl-16`}
                    autoComplete="tel"
                    required
                    maxLength={10}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-destructive" style={{ fontFamily: 'var(--font-body)' }}>
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs tracking-wide uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@email.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value })
                      setErrors({ ...errors, email: '' })
                    }}
                    className={`${inputClass} pl-9`}
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive" style={{ fontFamily: 'var(--font-body)' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Locality + Budget row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    Preferred Locality
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
                    <Select onValueChange={(v) => setForm({ ...form, locality: v })}>
                      <SelectTrigger className={`${inputClass} pl-9 w-full`}>
                        <SelectValue placeholder="Locality" />
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
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    Budget Range
                  </Label>
                  <Select onValueChange={(v) => setForm({ ...form, budget: v })}>
                    <SelectTrigger className={`${inputClass} w-full`}>
                      <SelectValue placeholder="Budget" />
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
              </div>

              {/* BHK */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs tracking-wide uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  BHK Requirement
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, bhk: form.bhk === t ? '' : t })}
                      className="text-xs px-4 py-2 border transition-colors tracking-wide"
                      style={{
                        fontFamily: 'var(--font-body)',
                        backgroundColor:
                          form.bhk === t
                            ? 'oklch(0.75 0.12 80 / 0.15)'
                            : 'transparent',
                        borderColor:
                          form.bhk === t
                            ? 'oklch(0.75 0.12 80)'
                            : 'oklch(0.28 0.03 255)',
                        color:
                          form.bhk === t
                            ? 'oklch(0.75 0.12 80)'
                            : 'oklch(0.60 0.015 255)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-none h-12 text-sm tracking-widest uppercase font-medium mt-2 disabled:opacity-70"
                style={{ backgroundColor: 'oklch(0.75 0.12 80)', color: 'oklch(0.13 0.025 255)' }}
              >
                {loading ? 'Submitting...' : 'Request a Free Callback'}
              </Button>

              <p
                className="text-xs text-center text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                By submitting, you agree to be contacted by LumenZenith Realty advisors. 
                No spam, ever.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
