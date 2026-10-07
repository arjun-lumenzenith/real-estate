'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { cn } from '@/lib/utils' 

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

interface LeadFormProps {
  isDialog?: boolean
  heading?: string
  subheading?: string
  submitLabel?: string
  successRedirect?: string
}

export function LeadForm({
  isDialog = false,
  heading = 'Get a Free Callback',
  subheading,
  submitLabel = 'Request a Free Callback',
  successRedirect,
}: LeadFormProps) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [referenceId, setReferenceId] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    locality: [] as string[],
    budget: "",
    bhk: [] as string[],
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name.'
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit Indian mobile number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    return e
  }

  const resetForm = () => {
    setForm({
      name: "",
      mobile: "",
      email: "",
      locality: [],
      budget: "",
      bhk: [],
    })
  
    setErrors({})
    setSubmitted(false)
    setReferenceId("")
    setTurnstileToken(null)

    setTimeout(() => {
      document.getElementById("name")?.focus()
    }, 0)
  }

  const toggleLocality = (item: string) => {
    setForm({
      ...form,
      locality: form.locality.includes(item)
        ? form.locality.filter((i) => i !== item)
        : [...form.locality, item],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    
    if (!turnstileToken) {
      setApiError('Please complete the security verification.')
      return
    }

    setLoading(true)
    setApiError("")
    
    try {
      // Format phone number with +91 prefix if not already there
      let phoneNumber = form.mobile.trim()
      if (!phoneNumber.startsWith('+91')) {
        phoneNumber = '+91' + phoneNumber.replace(/^0+/, '')
      }
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name,
          phoneNumber: phoneNumber,
          email: form.email,
          locality: form.locality.length > 0 ? form.locality : undefined,
          budgetRange: form.budget,
          bhkRequirement: form.bhk.length > 0 ? form.bhk : undefined,
          turnstileToken,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        setApiError(data.error || 'Failed to submit form. Please try again.')
        setLoading(false)
        return
      }
      
      if (successRedirect) {
        router.push(successRedirect)
        return
      }

      setReferenceId(data.data.referenceId)
      setSubmitted(true)
      setLoading(false)
    } catch (error) {
      console.error('[Lead Form] API Error:', error)
      setApiError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
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
                {referenceId}
              </span>
            </p>
            <Button onClick={resetForm} className="mt-8">
              Book Another Visit
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="lead" className={isDialog ? "bg-background p-6 md:p-8" : "py-12 md:py-24 bg-background"}>
      <div className={isDialog ? "" : "mx-auto max-w-7xl px-6 lg:px-8"}>
        <div className={isDialog ? "w-full" : "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"}>
          {/* Left — copy */}
          <div className={isDialog ? "hidden" : "hidden lg:block"}>
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
          <div className={isDialog ? "" : "bg-card border border-border p-6 md:p-8 lg:col-span-1 col-span-1"}>
            <div className="mb-8 flex flex-col gap-2">
              <h3
                className="text-2xl font-light"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {heading}
              </h3>
              {subheading && (
                <p className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  {subheading}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {apiError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
                  {apiError}
                </div>
              )}
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
                    <Popover>
                    <PopoverTrigger
                        className={cn(
                          inputClass,
                          "w-full flex items-center justify-between pl-10 pr-3 text-sm select-none"
                        )}
                        style={{ 
                          height: "38px"
                        }}
                      >
                          <span className="truncate flex-1 text-left pr-2">
                            {form.locality.length === 0
                              ? "Select Preferred Locality"
                              : form.locality.length <= 2
                                ? form.locality.join(", ")
                                : `${form.locality[0]}, ${form.locality[1]} +${form.locality.length - 2}`}
                          </span>

                          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] min-w-[300px] max-h-72 overflow-y-auto p-2 bg-card border-border"
                          align="start"
                      >
                        <div className="flex flex-col gap-1">
                          {LOCALITIES.map((locality) => (
                            <label
                              key={locality}
                              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
                            >
                            <Checkbox
                                checked={form.locality.includes(locality)}
                                onCheckedChange={() => toggleLocality(locality)}
                                className="border border-gray-500 data-[state=checked]:border-primary"
                            />

                              {locality}
                            </label>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs tracking-wide uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    Budget Range
                  </Label>
                  <Select onValueChange={(v) => setForm({ ...form, budget: v })}>
                    <SelectTrigger className={`${inputClass} w-full`} style={{ height: "38px" }}>
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
                      onClick={() => {
                        const exists = form.bhk.includes(t)
                      
                        setForm({
                          ...form,
                          bhk: exists
                            ? form.bhk.filter((b) => b !== t)
                            : [...form.bhk, t],
                        })
                      }}
                      className="text-xs px-4 py-2 border transition-colors tracking-wide"
                      style={{
                        fontFamily: 'var(--font-body)',
                        backgroundColor:
                          form.bhk.includes(t)
                            ? 'oklch(0.75 0.12 80 / 0.15)'
                            : 'transparent',
                        borderColor:
                          form.bhk.includes(t)
                            ? 'oklch(0.75 0.12 80)'
                            : 'oklch(0.28 0.03 255)',
                        color:
                          form.bhk.includes(t)
                            ? 'oklch(0.75 0.12 80)'
                            : 'oklch(0.60 0.015 255)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloudflare Turnstile CAPTCHA */}
              <div className="flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={(token) => {
                    setTurnstileToken(token)
                    setApiError("")
                  }}
                  onError={() => {
                    setTurnstileToken(null)
                    setApiError('Security verification failed. Please try again.')
                  }}
                  onExpire={() => {
                    setTurnstileToken(null)
                    setApiError('Security verification expired. Please verify again.')
                  }}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-none h-12 text-sm tracking-widest uppercase font-medium mt-2 disabled:opacity-70"
                style={{ backgroundColor: 'oklch(0.75 0.12 80)', color: 'oklch(0.13 0.025 255)' }}
              >
                {loading ? 'Submitting...' : submitLabel}
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
