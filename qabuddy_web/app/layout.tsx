'use client'

import type { ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>QA Buddy — QA Knowledge System</title>
        <meta name="description" content="One question, one cited answer, grounded in your team's real QA knowledge: frameworks, ~5,000 test cases, JIRA, PRDs, meeting notes, and Jenkins logs." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%239C7C3C'>✦</text></svg>" />
      </head>
      <body style={{ background: '#FDFBF5', margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
