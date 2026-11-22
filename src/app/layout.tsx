import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeederSpider | Automotive Repair, Detailing & Customization Dubai',
  description: 'Premier automotive workshop in Dubai specializing in custom upholstery, nanoceramic detailing, window tinting, electrical diagnostics, mechanical repairs, and paintwork.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://speederspider.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-brand-deepNavy text-white antialiased">
        {children}
      </body>
    </html>
  );
}
