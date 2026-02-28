import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  title: 'Ledge — See further. Lead smarter. Balance uncertainty.',
  description: 'Sharpens leadership judgement in the age of intelligent technologies. AI-curated news, interactive case studies, and an intelligent coaching engine.',
  keywords: 'leadership, AI, leadership intelligence, leadership chess, executive development, leadership news',
  openGraph: {
    title: 'Ledge — See further. Lead smarter. Balance uncertainty.',
    description: 'Sharpens leadership judgement in the age of intelligent technologies.',
    url: 'https://ledge.news',
    siteName: 'Ledge',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ledge — See further. Lead smarter. Balance uncertainty.',
    description: 'Sharpens leadership judgement in the age of intelligent technologies.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
