"use client"

import { useEffect, useRef } from "react"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import { Spinner } from "@workspace/ui/components/spinner"
import { api } from "@/lib/convex-api"
import { Wordmark } from "@/components/brand"
import { PushBridge } from "@/components/push-bridge"

/** Creates the Convex user row (and home thread) on first sign-in, then renders the app. */
export function EnsureUser({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip")
  const ensure = useMutation(api.users.ensure)
  const started = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || started.current) return
    started.current = true
    void ensure({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
  }, [isAuthenticated, ensure])

  if (isLoading || !isAuthenticated || !me) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-ink-3">
        <Wordmark width={60} />
        {!isLoading && !isAuthenticated ? (
          <p className="max-w-[44ch] text-center text-[14px]">
            Signed in, but the backend didn&apos;t accept the session yet. Check the Clerk JWT template
            &ldquo;convex&rdquo; and CLERK_JWT_ISSUER_DOMAIN in Convex.
          </p>
        ) : (
          <Spinner />
        )}
      </div>
    )
  }
  return (
    <>
      <PushBridge />
      {children}
    </>
  )
}
