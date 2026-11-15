"use client"

import { useEffect, useState } from "react"
import { useAction, useQuery } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons"

import { api } from "@/lib/convex-api"

type CatalogApp = { slug: string; name: string; logo: string | null; description: string | null }
type Connections = { connected: { slug: string }[] }

// Every connect card on screen shares one look at what's connected (it is a Composio round trip).
let lookup: { at: number; slugs: Promise<Set<string>> } | null = null
function connectedSlugs(load: () => Promise<Connections>) {
  if (!lookup || Date.now() - lookup.at > 5000) {
    lookup = { at: Date.now(), slugs: load().then((s) => new Set(s.connected.map((c) => c.slug))) }
  }
  return lookup.slugs
}

/** "googlecalendar" reads badly; the catalog name is used when we have it, this when we don't. */
function fallbackName(slug: string) {
  return slug ? slug[0]!.toUpperCase() + slug.slice(1) : "this app"
}

/**
 * wali offering to connect an app: its logo and name, one line on why, and the button, on the
 * same flat tinted surface as the action rows (no raised white card). Signing in
 * happens in a new tab, so the card checks again when you come back and settles to "Connected".
 */
export function ConnectCard({ toolkit, url }: { toolkit: string; url: string }) {
  const slug = toolkit.toLowerCase()
  const catalog = useQuery(api.appCatalog.list, {}) as CatalogApp[] | null | undefined
  const load = useAction(api.agentNode.connections)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let gone = false
    const check = () =>
      connectedSlugs(() => load({}) as Promise<Connections>)
        .then((slugs) => !gone && setConnected(slugs.has(slug)))
        .catch(() => {})
    void check()
    window.addEventListener("focus", check)
    return () => {
      gone = true
      window.removeEventListener("focus", check)
    }
  }, [load, slug])

  const app = catalog?.find((a) => a.slug === slug)
  return (
    <ConnectCardView
      name={app?.name ?? fallbackName(slug)}
      logo={app?.logo ?? null}
      description={app?.description ?? null}
      url={url}
      connected={connected}
    />
  )
}

export function ConnectCardView({
  name,
  logo,
  description,
  url,
  connected,
}: {
  name: string
  logo: string | null
  description: string | null
  url: string
  connected: boolean
}) {
  return (
    <div className="my-2 flex w-full max-w-[460px] items-center gap-3 rounded-[20px] bg-black/[0.04] p-2.5 pr-3">
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-white/70">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="size-7 object-contain" />
        ) : (
          <span className="text-[15px] font-medium text-ink-2">{name[0]}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-ink">{connected ? name : `Connect ${name}`}</div>
        <p className="line-clamp-2 text-[13px] leading-snug text-ink-3">
          {connected
            ? "Connected. Ask again and wali can use it."
            : (description ?? "Sign in once, in a new tab. wali never sees your password.")}
        </p>
      </div>
      {connected ? (
        <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-ink-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
          Connected
        </span>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-medium text-white transition-transform active:translate-y-px"
        >
          Connect
          <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
        </a>
      )}
    </div>
  )
}
