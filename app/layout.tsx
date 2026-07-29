import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { SeoSchema } from "@/components/seo-schema";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lumenzenith.com"),

  title: {
    default: "LumenZenith Realty | Premium Properties in Bangalore",
    template: "%s | LumenZenith Realty",
  },

  description:
    "Search verified apartments, villas, and premium residential projects in Bangalore. Compare prices, builders, localities, and connect directly with LumenZenith Realty.",

  keywords: [
    "Bangalore apartments",
    "Luxury apartments Bangalore",
    "Bangalore real estate",
    "2 BHK Bangalore",
    "3 BHK Bangalore",
    "Property search Bangalore",
    "Prestige",
    "Sobha",
    "Godrej",
    "Brigade",
    "LumenZenith Realty"
  ],

  authors: [
    {
      name: "LumenZenith Realty"
    }
  ],

  creator: "LumenZenith Realty",

  publisher: "LumenZenith Realty",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "LumenZenith Realty",
    description:
      "Premium apartments and residential projects in Bangalore.",
    url: "https://www.lumenzenith.com",
    siteName: "LumenZenith Realty",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "LumenZenith Realty",
    description:
      "Premium apartments and residential projects in Bangalore.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0d1525',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} bg-background`}>
      <body className="antialiased font-sans">
		<SeoSchema/>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
