import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ThankYouContent } from '@/components/thank-you/thank-you-content'
import { ConversionEvent } from '@/components/thank-you/conversion-event'
import { slugToTitle } from '@/lib/format-slug'

const BASE_URL = 'https://www.lumenzenith.com'
const SOBHA_ONEWORLD_CONVERSION = 'AW-7824191474/2WMYCPLf7pIdEMGEhPRE'
const SOBHA_ONEWORLD_SLUGS = new Set(['sobha-one-world', 'sobha-oneworld'])

interface ThankYouPageProps {
  params: Promise<{ property: string }>
}

export async function generateMetadata({ params }: ThankYouPageProps): Promise<Metadata> {
  const { property } = await params
  const propertyName = slugToTitle(property)
  const title = `Thank You for Your Interest in ${propertyName} — LumenZenith Realty`
  const description = `Thank you for your interest in ${propertyName}. A LumenZenith Realty luxury property consultant will contact you shortly to arrange a private site visit.`
  const url = `${BASE_URL}/thank-you/${encodeURIComponent(property.toLowerCase())}`

  return {
    title,
    description,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'LumenZenith Realty',
      type: 'website',
      images: [{ url: '/images/thank-you-residence.png' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ThankYouPage({ params }: ThankYouPageProps) {
  const { property } = await params
  const propertyName = slugToTitle(property)

  if (!propertyName) notFound()

  const isSobhaOneWorld = SOBHA_ONEWORLD_SLUGS.has(property.toLowerCase())

  return (
    <>
      {isSobhaOneWorld && <ConversionEvent sendTo={SOBHA_ONEWORLD_CONVERSION} />}
      <ThankYouContent propertyName={propertyName} />
    </>
  )
}
