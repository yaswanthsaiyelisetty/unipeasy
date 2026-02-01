
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL("https://unipeasy.com"),
  title: "UniPeasy — The AI-Powered StudyHub for Engineering Students",
  description: "A centralized platform providing topper-verified notes, AI-driven study plans, and exam strategies to help engineering students bridge the gap to a successful career.",
  keywords: [
    "Study Materials",
    "Engineering Notes",
    "Yaswanth Sai Yelisetty",
    "AI Study Assistant",
    "Exam Strategies",
    "Engineering Success",
    "UniPeasy",
    "unipeasy",
    "Unipeasy",
    "material pdfs",
    "best site for study",
    "btech materials",
    "btech notes",
  ],
  authors: [{ name: "Yelisetty Yaswanth Sai" }],
  openGraph: {
    title: "UniPeasy — Revolutionizing Academic Success",
    description: "Access verified resources and AI tools designed for the modern engineer.",
    url: "https://unipeasy.com",
    siteName: "UniPeasy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UniPeasy Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniPeasy — Study smarter, not harder.",
    description: "The ultimate AI companion for engineering students.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
              {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
