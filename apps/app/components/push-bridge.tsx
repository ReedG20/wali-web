"use client"

import { useEffect, useRef } from "react"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import type { GenericId as Id } from "convex/values"

import { api } from "@/lib/convex-api"
import { useBrowserPush } from "@/lib/web-push"

/**
 * Mounted once in the signed-in app (like the iPhone app's usePushNotifications): keeps this
 * browser's push subscription on the account, and acts on Approve / Decline from a notification,
 * which arrives as ?approval=<id>&decision=approve|decline.
 */
export function PushBridge() {
  useBrowserPush()
  const decide = useMutation(api.approvals.decide)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    const params = new URLSearchParams(window.location.search)
    const id = params.get("approval")
    const decision = params.get("decision")
    if (!id || (decision !== "approve" && decision !== "decline")) return
    done.current = true
    params.delete("approval")
    params.delete("decision")
    const rest = params.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}`)
    decide({ id: id as Id<"approvals">, decision })
      .then(() => toast.success(decision === "approve" ? "Approved. wali is on it." : "Skipped."))
      .catch((e) => toast.error(e instanceof Error ? e.message.replace(/^.*Error: /, "").split("\n")[0] : "Couldn't do that"))
  }, [decide])

  return null
}
