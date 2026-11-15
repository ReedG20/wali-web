"use client"

import { useCallback, useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex-api"

/**
 * Browser notifications through Web Push (public/sw.js). The web twin of the iPhone app's
 * src/lib/notifications.ts: same notifications, same Approve / Decline.
 */

export type BrowserPush = "unsupported" | "off" | "on" | "blocked" | "loading"

function supported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}

function keyBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

function browserLabel() {
  const ua = navigator.userAgent
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser"
  const os = /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : ""
  return os ? `${browser} on ${os}` : browser
}

function subKeys(sub: PushSubscription) {
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  return { endpoint: sub.endpoint, p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" }
}

/**
 * Registers the service worker and keeps this browser's subscription attached to the signed-in
 * account (it moves to whoever signed in last). `enable` must run from a click.
 */
export function useBrowserPush() {
  const config = useQuery(api.push.webConfig) as { publicKey: string | null } | undefined
  const registerWeb = useMutation(api.push.registerWeb)
  const unregisterWeb = useMutation(api.push.unregisterWeb)
  const [state, setState] = useState<BrowserPush>("loading")

  const sync = useCallback(async () => {
    if (!supported()) return setState("unsupported")
    if (Notification.permission === "denied") return setState("blocked")
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
    const sub = await reg.pushManager.getSubscription()
    if (sub && Notification.permission === "granted") {
      await registerWeb({ ...subKeys(sub), label: browserLabel() })
      setState("on")
    } else setState("off")
  }, [registerWeb])

  useEffect(() => {
    sync().catch(() => setState(supported() ? "off" : "unsupported"))
  }, [sync])

  const enable = useCallback(async () => {
    if (!supported() || !config?.publicKey) return false
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      setState(permission === "denied" ? "blocked" : "off")
      return false
    }
    const reg = await navigator.serviceWorker.ready
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(config.publicKey) }))
    await registerWeb({ ...subKeys(sub), label: browserLabel() })
    setState("on")
    return true
  }, [config, registerWeb])

  const disable = useCallback(async () => {
    if (!supported()) return
    const reg = await navigator.serviceWorker.getRegistration("/")
    const sub = await reg?.pushManager.getSubscription()
    if (sub) {
      await unregisterWeb({ endpoint: sub.endpoint })
      await sub.unsubscribe()
    }
    setState("off")
  }, [unregisterWeb])

  return { state, ready: !!config?.publicKey, enable, disable }
}
