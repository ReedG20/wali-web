import type { Metadata, Viewport } from "next"

import "./landing.css"
import { fontVariables } from "./fonts"

export const metadata: Metadata = {
  title: "wali: a Fitbit for your mind",
  description:
    "wali is a small pendant that listens through your day and helps you see who lifts you up, what wears you down, and what you said you'd do.",
}

export const viewport: Viewport = {
  themeColor: "#F6F4EF",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
