
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { GoogleOneTap } from '@/components/google-one-tap';

export const metadata: Metadata = {
  metadataBase: new URL("https://unipeasy.com"),
  title: {
    default: "UniPeasy — The AI-Powered StudyHub for Engineering Students",
    template: "%s | UniPeasy",
  },
  description: "A centralized platform providing topper-verified notes, AI-driven study plans, and exam strategies to help engineering students bridge the gap to a successful career. Access verified resources and AI tools designed for the modern engineer.",
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
    "B.Tech study materials",
    "engineering exam preparation",
    "AI learning platform",
    "topper verified notes",
    "JNTU materials",
    "CSE notes",
    "ECE notes",
  ],
  authors: [{ name: "Yelisetty Yaswanth Sai" }],
  creator: "Yelisetty Yaswanth Sai",
  publisher: "UniPeasy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "UniPeasy — Revolutionizing Academic Success",
    description: "Access verified resources and AI tools designed for the modern engineer. Topper-verified notes, AI-driven study plans, and exam strategies.",
    url: "https://unipeasy.com",
    siteName: "UniPeasy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UniPeasy — AI-Powered Study Platform for Engineering Students",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniPeasy — Study smarter, not harder.",
    description: "The ultimate AI companion for engineering students. Topper-verified notes & AI-powered study tools.",
    images: ["/og-image.png"],
    creator: "@theunipeasy",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://unipeasy.com",
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
              {/* Google One Tap - Uncomment after configuring OAuth origins in Google Cloud Console */}
              {/* <GoogleOneTap /> */}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
