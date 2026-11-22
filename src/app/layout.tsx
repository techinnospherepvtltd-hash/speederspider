import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeederSpider | Automotive Repair, Detailing & Customization Dubai',
  description: 'Premier automotive workshop in Dubai specializing in custom upholstery, nanoceramic detailing, window tinting, electrical diagnostics, mechanical repairs, and paintwork.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://speederspider.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'SpeederSpider | Automotive Repair, Detailing & Customization Dubai',
    description: 'Premier automotive workshop in Dubai specializing in custom upholstery, nanoceramic detailing, window tinting, electrical diagnostics, mechanical repairs, and paintwork.',
    siteName: 'SpeederSpider Dubai',
    type: 'website',
    images: [
      {
        url: '/images/speederspider-logo.jpg',
        width: 1024,
        height: 682,
        alt: 'SpeederSpider Dubai - Drive Beyond Ordinary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpeederSpider | Automotive Repair, Detailing & Customization Dubai',
    description: 'Premier automotive workshop in Dubai specializing in custom upholstery, nanoceramic detailing, window tinting, electrical diagnostics, mechanical repairs, and paintwork.',
    images: ['/images/speederspider-logo.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Recursive:wght@400;500;600;700&family=Russo+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-brand-deepNavy text-white antialiased font-sans font-medium">
        {children}
      </body>
    </html>
  );
}
