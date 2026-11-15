"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react"
import { useAction, useQuery } from "convex/react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Globe02Icon,
  LinkSquare02Icon,
  Refresh01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@workspace/ui/components/spinner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import { TopBar, PageTitle } from "@/components/page-header"
import { PageBody, Panel, Section } from "@/components/section"
import { PermissionsPicker } from "@/components/permissions-picker"

type Auth = "oauth" | "key" | "none" | "unavailable"
type App = { slug: string; name: string; logo: string | null; description: string | null; categories: string[]; auth: Auth }
type Connected = { slug: string; name: string; logo: string | null; status: string | null }
type State = {
  status: { model: boolean; composio: boolean; browserUse: boolean }
  featured: string[]
  connected: Connected[]
  error: string | null
  browserProfile: boolean
}

const BLURB: Record<string, string> = {
  gmail: "Read, draft and send email.",
  googlecalendar: "See your day, find free time, hold time for you.",
  slack: "Catch up on threads and draft replies.",
  notion: "Find and add to your notes and docs.",
  todoist: "Turn promises into tasks.",
  github: "Issues and pull requests.",
}

const PAGE = 48
const CATEGORY_CHIPS = 14

export default function ConnectionsPage() {
  const load = useAction(api.agentNode.connections)
  const connectApp = useAction(api.agentNode.connectApp)
  const disconnectApp = useAction(api.agentNode.disconnectApp)
  const startSignIn = useAction(api.agentNode.startBrowserSignIn)
  const stopSignIn = useAction(api.agentNode.stopBrowserSignIn)
  const catalog = useQuery(api.appCatalog.list, {}) as App[] | null | undefined

  const [state, setState] = useState<State | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [browser, setBrowser] = useState<{ browserId: string; liveUrl: string | null } | null>(null)

  const refresh = useCallback(async () => {
    try {
      setState((await load({})) as State)
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't load connections")
    }
  }, [load])

  useEffect(() => {
    void refresh()
    const onFocus = () => void refresh()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refresh])

  const bySlug = useMemo(() => new Map((catalog ?? []).map((a) => [a.slug, a])), [catalog])
  const connectedSlugs = useMemo(() => new Set(state?.connected.map((c) => c.slug)), [state])

  async function connect(slug: string) {
    setBusy(slug)
    try {
      const res = (await connectApp({ toolkit: slug, callbackUrl: `${window.location.origin}/connections` })) as {
        redirectUrl: string | null
      }
      if (res.redirectUrl) window.open(res.redirectUrl, "_blank", "noopener")
      else toast.message("Connected")
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't start the connection")
    } finally {
      setBusy(null)
    }
  }

  async function disconnect(slug: string) {
    setBusy(slug)
    try {
      await disconnectApp({ toolkit: slug })
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't disconnect")
    } finally {
      setBusy(null)
    }
  }

  async function openBrowser() {
    setBusy("browser")
    try {
      setBrowser((await startSignIn({})) as { browserId: string; liveUrl: string | null })
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't start a browser")
    } finally {
      setBusy(null)
    }
  }

  async function closeBrowser() {
    if (browser) await stopSignIn({ browserId: browser.browserId }).catch(() => {})
    setBrowser(null)
    toast.success("Saved. wali's browser stays signed in.")
  }

  const s = state?.status
  const card = (app: App, opts?: { blurb?: string }) => (
    <AppCard
      key={app.slug}
      app={app}
      blurb={opts?.blurb}
      connected={connectedSlugs.has(app.slug)}
      busy={busy === app.slug}
      onConnect={() => connect(app.slug)}
      onDisconnect={() => disconnect(app.slug)}
    />
  )

  // Connected apps, falling back to Composio's own name/logo if the catalog hasn't synced them.
  const connectedApps: App[] = (state?.connected ?? []).map(
    (c) => bySlug.get(c.slug) ?? { slug: c.slug, name: c.name, logo: c.logo, description: null, categories: [], auth: "oauth" }
  )
  const suggested = (state?.featured ?? [])
    .filter((slug) => !connectedSlugs.has(slug))
    .map((slug) => bySlug.get(slug))
    .filter((a): a is App => !!a)

  return (
    <>
      <TopBar />
      <PageBody>
        <PageTitle
          title="Connections."
          em="What wali can reach."
          lede="wali works in the apps you connect. You choose how often it checks with you first."
        />

        <PermissionsPicker />

        <Section title="Services" description="Server-side keys live in Convex environment variables. Nothing secret reaches this page.">
          <Panel className="grid gap-3 sm:grid-cols-3">
            <ServiceStatus label="Model (OpenRouter)" ok={s?.model} hint="OPENROUTER_API_KEY" />
            <ServiceStatus label="Apps (Composio)" ok={s?.composio} hint="COMPOSIO_API_KEY" />
            <ServiceStatus label="Browser (Browser Use)" ok={s?.browserUse} hint="BROWSER_USE_API_KEY" />
          </Panel>
        </Section>

        <Section
          title="Your apps"
          aside={
            <button
              onClick={() => void refresh()}
              className="flex size-9 items-center justify-center rounded-full bg-black/[0.05] text-ink-2 hover:text-ink"
              aria-label="Refresh"
            >
              <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
            </button>
          }
        >
          {!state || catalog === undefined ? (
            <Panel className="flex justify-center py-10 text-ink-3">
              <Spinner />
            </Panel>
          ) : !s?.composio ? (
            <Panel className="text-[14.5px] text-ink-2">Add a Composio key to connect Gmail, Calendar, Slack and more.</Panel>
          ) : state.error ? (
            <Panel className="text-[14px] text-ink-2">Composio returned an error: {state.error}</Panel>
          ) : (
            <div className="flex flex-col gap-8">
              {connectedApps.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">{connectedApps.map((a) => card(a, { blurb: BLURB[a.slug] }))}</div>
              ) : (
                <p className="text-[14.5px] text-ink-2">Nothing connected yet. These are the ones wali uses most.</p>
              )}
              {suggested.length > 0 && (
                <div>
                  {connectedApps.length > 0 && <h3 className="mb-3 text-[14.5px] text-ink-2">Good places to start</h3>}
                  <div className="grid gap-3 sm:grid-cols-2">{suggested.map((a) => card(a, { blurb: BLURB[a.slug] }))}</div>
                </div>
              )}
            </div>
          )}
        </Section>

        {s?.composio && !state?.error && (
          <Directory catalog={catalog} hide={connectedSlugs} featured={state?.featured ?? []} renderCard={card} />
        )}

        <Section
          title="wali's browser"
          description="For sites without an API, wali uses a cloud browser that keeps your sign-ins. Sign in to the sites you want it to use, once."
        >
          <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-[14px] bg-paper">
                <HugeiconsIcon icon={Globe02Icon} className="size-5 text-ink-2" />
              </span>
              <div>
                <div className="text-[15px] text-ink">Signed-in browser profile</div>
                <p className="text-[13px] text-ink-3">{state?.browserProfile ? "Profile created" : "Created the first time you use it"}</p>
              </div>
            </div>
            <button
              disabled={!s?.browserUse || busy === "browser"}
              onClick={openBrowser}
              className="flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-white disabled:opacity-40"
            >
              {busy === "browser" && <Spinner className="size-4" />}
              Sign in to a site
            </button>
          </Panel>
        </Section>
      </PageBody>

      <Dialog open={!!browser} onOpenChange={(o) => !o && void closeBrowser()}>
        <DialogContent className="max-w-[min(1100px,calc(100vw-2rem))] rounded-[28px] p-4 sm:max-w-[min(1100px,calc(100vw-2rem))]">
          <DialogHeader className="px-2 pt-1">
            <DialogTitle className="display text-[24px]">Sign in, then close this.</DialogTitle>
            <DialogDescription>wali never sees your password. Closing saves the browser profile.</DialogDescription>
          </DialogHeader>
          {browser?.liveUrl ? (
            <div className="overflow-hidden rounded-[20px] ring-1 ring-black/10">
              <iframe src={browser.liveUrl} className="aspect-[16/10] w-full" allow="autoplay; clipboard-read; clipboard-write" />
            </div>
          ) : (
            <p className="p-6 text-ink-3">Starting the browser…</p>
          )}
          {browser?.liveUrl && (
            <a href={browser.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2 text-[13px] text-ink-2 hover:text-ink">
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" /> Open in a new tab
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

/** Every app in the Composio catalog: search, category chips, paged grid. */
function Directory({
  catalog,
  hide,
  featured,
  renderCard,
}: {
  catalog: App[] | null | undefined
  hide: Set<string>
  featured: string[]
  renderCard: (app: App) => React.ReactNode
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)
  const q = useDeferredValue(query.trim().toLowerCase())

  useEffect(() => setShown(PAGE), [q, category])

  const apps = catalog ?? []
  const available = useMemo(() => apps.filter((a) => a.auth !== "unavailable"), [apps])

  const chips = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of available) for (const c of a.categories) counts.set(c, (counts.get(c) ?? 0) + 1)
    return [...counts.entries()]
      .filter(([c]) => c !== "model context protocol")
      .sort((a, b) => b[1] - a[1])
      .slice(0, CATEGORY_CHIPS)
      .map(([c]) => c)
  }, [available])

  const results = useMemo(() => {
    const skip = (a: App) => hide.has(a.slug) || (!q && !category && featured.includes(a.slug))
    let list = apps.filter((a) => !skip(a) && (!category || a.categories.includes(category)))
    if (!q) return list.filter((a) => a.auth !== "unavailable")
    // Searching: name matches first (prefix before substring), then description/category; unavailable last.
    const score = (a: App) => {
      const name = a.name.toLowerCase()
      let s =
        name.startsWith(q) || a.slug.startsWith(q.replace(/\s+/g, ""))
          ? 0
          : name.includes(q)
            ? 1
            : a.categories.some((c) => c.includes(q))
              ? 2
              : a.description?.toLowerCase().includes(q)
                ? 3
                : -1
      if (s >= 0 && a.auth === "unavailable") s += 10
      return s
    }
    list = list.filter((a) => score(a) >= 0)
    return list.map((a, i) => ({ a, s: score(a), i })).sort((x, y) => x.s - y.s || x.i - y.i).map((x) => x.a)
  }, [apps, hide, featured, q, category])

  return (
    <Section
      title="Every app"
      description={
        catalog?.length
          ? `${available.length.toLocaleString()} apps through Composio. Some sign in with your account, others ask for an API key.`
          : undefined
      }
    >
      {catalog === undefined ? (
        <Panel className="flex justify-center py-10 text-ink-3">
          <Spinner />
        </Panel>
      ) : !catalog?.length ? (
        <Panel className="text-[14.5px] text-ink-2">The app directory is still syncing. Check back in a minute.</Panel>
      ) : (
        <>
          <label className="soft-card flex items-center gap-2 rounded-full p-1.5 pl-5">
            <HugeiconsIcon icon={Search01Icon} className="size-4 shrink-0 text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Linear, HubSpot, Spotify, accounting…"
              className="h-9 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
              aria-label="Search apps"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-3 hover:text-ink"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </button>
            )}
          </label>

          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            <Chip active={!category} onClick={() => setCategory(null)}>
              All
            </Chip>
            {chips.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
                {categoryLabel(c)}
              </Chip>
            ))}
          </div>

          <div className="mt-5">
            {results.length === 0 ? (
              <p className="px-1 text-[14.5px] text-ink-2">
                No app matches that. If it&apos;s a website, wali&apos;s browser below can still use it.
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">{results.slice(0, shown).map((a) => renderCard(a))}</div>
                {results.length > shown && (
                  <div className="mt-5 flex justify-center">
                    <button
                      onClick={() => setShown((n) => n + PAGE * 2)}
                      className="h-10 rounded-full bg-black/[0.06] px-5 text-[13.5px] font-medium text-ink hover:bg-black/[0.09]"
                    >
                      Show more · {(results.length - shown).toLocaleString()} left
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </Section>
  )
}

function AppCard({
  app,
  blurb,
  connected,
  busy,
  onConnect,
  onDisconnect,
}: {
  app: App
  blurb?: string
  connected: boolean
  busy: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  const note =
    app.auth === "unavailable"
      ? "Not connectable yet"
      : app.auth === "none"
        ? "No sign-in needed"
        : app.auth === "key" && !connected
          ? "Uses your API key"
          : null
  return (
    <div className={cn("soft-card flex items-center gap-4 rounded-[22px] p-4", app.auth === "unavailable" && "opacity-60")}>
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-paper">
        {app.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.logo} alt="" loading="lazy" className="size-6 object-contain" />
        ) : (
          <span className="text-[13px] text-ink-2">{app.name[0]}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[15px] text-ink">
          <span className="truncate">{app.name}</span>
          {connected && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0 text-ink-2" />}
        </div>
        <p className="line-clamp-2 text-[13px] leading-snug text-ink-3">{blurb ?? app.description ?? categoryLabel(app.categories[0] ?? app.slug)}</p>
        {note && <p className="mt-1 text-[12px] text-ink-2">{note}</p>}
      </div>
      {app.auth === "unavailable" ? null : app.auth === "none" ? (
        <span className="shrink-0 rounded-full bg-black/[0.04] px-3 py-1.5 text-[12.5px] text-ink-2">Always on</span>
      ) : (
        <button
          disabled={busy}
          onClick={connected ? onDisconnect : onConnect}
          className={cn(
            "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium disabled:opacity-60",
            connected ? "bg-black/[0.06] text-ink" : "bg-ink text-white"
          )}
        >
          {busy && <Spinner className="size-3.5" />}
          {connected ? "Disconnect" : "Connect"}
        </button>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-full px-3.5 text-[13px] whitespace-nowrap transition-colors",
        active ? "bg-ink text-white" : "bg-black/[0.05] text-ink-2 hover:text-ink"
      )}
    >
      {children}
    </button>
  )
}

const UPPER = new Set(["crm", "ai", "hr", "seo", "it", "api", "sms"])
function categoryLabel(c: string) {
  return c
    .split(" ")
    .map((w, i) => (UPPER.has(w) ? w.toUpperCase() : i === 0 ? w[0]?.toUpperCase() + w.slice(1) : w))
    .join(" ")
}

function ServiceStatus({ label, ok, hint }: { label: string; ok?: boolean; hint: string }) {
  return (
    <div className="rounded-[16px] bg-paper px-4 py-3">
      <div className="flex items-center gap-2 text-[14px] text-ink">
        <span className={cn("size-2 rounded-full", ok === undefined ? "bg-ink-3/40" : ok ? "bg-ink" : "bg-ink-3/40")} />
        {label}
      </div>
      <p className="mt-0.5 text-[12.5px] text-ink-3">{ok === undefined ? "Checking…" : ok ? "Ready" : `Add ${hint}`}</p>
    </div>
  )
}
