import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"

import "./app.css"
import { fontVariables } from "./fonts"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "wali",
  description: "Talk to wali, and see what it noticed in your day.",
  applicationName: "wali",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#161513",
    colorText: "#161513",
    colorTextSecondary: "#5a564e",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    fontFamily: "var(--ff-body), system-ui, sans-serif",
    borderRadius: "14px",
  },
  elements: {
    card: "shadow-none",
    formButtonPrimary: "rounded-full",
    socialButtonsBlockButton: "rounded-full",
  },
}

const clerkLocalization = {
  signIn: { start: { title: "Sign in to wali", subtitle: "Welcome back." } },
  signUp: { start: { title: "Meet wali", subtitle: "Create your account to get started." } },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization} afterSignOutUrl="/sign-in">
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
