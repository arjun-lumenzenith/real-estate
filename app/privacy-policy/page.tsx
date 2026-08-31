import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — LumenZenith Realty',
  description:
    'Learn how LumenZenith Realty collects, uses, and protects your personal information.',
}

const SECTIONS = [
  {
    title: 'Introduction',
    body: [
      'LumenZenith Realty Pvt. Ltd. ("LumenZenith", "we", "us", or "our") is a RERA-registered real estate channel partner based in Bangalore. This Privacy Policy explains how we collect, use, store, and protect your personal information when you visit our website, submit an enquiry, or interact with our advisors.',
      'By using our website or submitting your details through our forms, you agree to the practices described in this policy.',
    ],
  },
  {
    title: 'Information We Collect',
    body: [
      'We may collect the following information when you request a callback, book a site visit, or contact us:',
    ],
    list: [
      'Full name',
      'Mobile phone number',
      'Email address',
      'Preferred locality, budget range, and BHK requirements',
      'Any additional details you choose to share with our advisors',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      'We use the information you provide solely to deliver our services as a property advisory and channel partner:',
    ],
    list: [
      'To contact you regarding property enquiries, site visits, and consultations',
      'To recommend projects that match your stated preferences',
      'To coordinate introductions with builder sales teams where applicable',
      'To respond to your requests and improve our advisory service',
      'To comply with applicable legal, regulatory, and RERA-related obligations',
    ],
  },
  {
    title: 'Data Sharing',
    body: [
      'We do not sell your personal information. We may share your details only when necessary to fulfil your request, such as with authorised builder representatives for the projects you have expressed interest in, or with service providers who help us operate our business under confidentiality obligations.',
      'We may also disclose information if required by law, court order, or government authority.',
    ],
  },
  {
    title: 'Data Security',
    body: [
      'We take reasonable administrative and technical measures to protect your information against unauthorised access, misuse, or disclosure. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    title: 'Data Retention',
    body: [
      'We retain your information only for as long as needed to respond to your enquiry, provide advisory services, maintain business records, and meet legal requirements. If you no longer wish us to retain your data, you may contact us using the details below.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'Subject to applicable Indian data protection laws, you may request access to, correction of, or deletion of your personal information, or withdraw consent for further contact. To make a request, email us at info@lumenzenith.com or call +91 99008 91647.',
    ],
  },
  {
    title: 'Cookies & Website Usage',
    body: [
      'Our website may use basic analytics or performance tools to understand how visitors use the site. These tools do not collect information that directly identifies you unless you voluntarily submit it through our forms.',
    ],
  },
  {
    title: 'Updates to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised effective date. Continued use of our website after updates constitutes acceptance of the revised policy.',
    ],
  },
  {
    title: 'Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how your data is handled, contact:',
      'LumenZenith Realty (OPC) Pvt. Ltd.',
      '235, 2nd Floor, 13th Cross Road, Indiranagar 2nd Stage, Hoysala Nagar, Bangalore — 560038',
      'Email: info@lumenzenith.com',
      'Phone: +919900891647',
      'KRERA Agent Registration Status: Under Process (Application Number: ACK/KA/RERA/1251/309/AG/260825/008302)',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <p
          className="text-xs tracking-widest uppercase mb-4"
          style={{ fontFamily: 'var(--font-body)', color: 'oklch(0.75 0.12 80)' }}
        >
          Legal
        </p>
        <h1
          className="text-4xl sm:text-5xl font-light leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Privacy Policy
        </h1>
        <p
          className="text-sm text-muted-foreground mb-12"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Effective date: 1 January 2026
        </p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2
                className="text-xl font-medium mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {section.title}
              </h2>
              <div
                className="flex flex-col gap-3 text-sm text-muted-foreground leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul className="list-disc pl-5 flex flex-col gap-2">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
