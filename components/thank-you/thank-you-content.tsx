import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Check, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NEXT_STEPS = [
  {
    title: 'Your enquiry is reviewed',
    body: 'A dedicated consultant studies your preferences for this residence.',
  },
  {
    title: 'A personal call',
    body: 'We reach out to understand your requirements, budget and timelines.',
  },
  {
    title: 'A private site visit',
    body: 'We arrange an exclusive, guided walkthrough at a time that suits you.',
  },
]

interface ThankYouContentProps {
  propertyName: string
}

export function ThankYouContent({ propertyName }: ThankYouContentProps) {
  return (
    <main className="flex min-h-svh flex-col bg-background lg:flex-row">
      <section className="flex flex-1 flex-col justify-between gap-12 px-6 py-8 sm:px-12 lg:px-16 lg:py-12">
        <Link
          href="/"
          className="font-(family-name:--font-display) text-2xl tracking-wide text-foreground"
        >
          LumenZenith <span className="text-primary">Realty</span>
        </Link>

        <div className="flex max-w-xl flex-col gap-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <div className="flex flex-col gap-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-xs uppercase tracking-widest text-primary">Enquiry received</p>
            <h1 className="font-(family-name:--font-display) text-4xl font-light leading-tight text-balance text-foreground sm:text-5xl">
              Thank you for your interest in{' '}
              <span className="text-primary">{propertyName}</span>.
            </h1>
            <p className="text-lg leading-relaxed text-pretty text-foreground/80">
              Our luxury property consultant will get in touch with you shortly.
            </p>
          </div>

          <div className="flex flex-col gap-5 border-t border-border pt-8">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">What happens next</h2>
            <ol className="flex flex-col gap-5">
              {NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-(family-name:--font-display) text-xl text-primary" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              className="h-12 rounded-none px-8 text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
            <Button
              variant="outline"
              render={<Link href="/#search" />}
              nativeButton={false}
              className="h-12 rounded-none border-foreground/30 bg-transparent px-8 text-xs uppercase tracking-widest text-foreground hover:bg-foreground/10"
            >
              Explore Properties
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-8">
          <a href="tel:+919900891647" className="flex items-center gap-2 transition-colors hover:text-foreground">
            <Phone className="h-4 w-4" aria-hidden="true" />
            +91 99008 91647
          </a>
          <a href="mailto:info@lumenzenith.in" className="flex items-center gap-2 transition-colors hover:text-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            info@lumenzenith.in
          </a>
        </div>
      </section>

      <div className="relative hidden min-h-svh lg:block lg:w-5/12">
        <Image
          src="/images/thank-you-residence.png"
          alt=""
          fill
          priority
          sizes="42vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/20 to-transparent" aria-hidden="true" />
      </div>
    </main>
  )
}
