"use client"

import { useEffect, useState } from "react"
import { useAction, useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Switch } from "@workspace/ui/components/switch"
import { Spinner } from "@workspace/ui/components/spinner"
import type { GenericId as Id } from "convex/values"

import { api } from "@/lib/convex-api"
import { ago } from "@/lib/time"
import { TopBar, PageTitle } from "@/components/page-header"
import { PageBody, Panel, Section } from "@/components/section"
import { EmberDot } from "@/components/brand"
import { useBrowserPush, type BrowserPush } from "@/lib/web-push"
import { hourLabel, LIMITS, NOTIFY_COPY, PROACTIVE_COPY, type Notify, type Proactive } from "@/lib/settings-copy"

const BROWSER_HINT: Record<BrowserPush, string> = {
  loading: "Checking…",
  on: "Notifications are on here.",
  off: "Off. Turn it on to get wali's notifications on this computer.",
  blocked: "Blocked. Allow notifications for this site in your browser's settings.",
  unsupported: "This browser can't show notifications.",
}

type Device = { _id: Id<"devices">; name: string; status: "connected" | "disconnected"; connectedAt: number }
type Phone = { _id: string; platform: string; deviceName: string | null; updatedAt: number }

const SAMPLE = `Speaker 1: I keep saying I'll call my mom back and then it's Friday again.
Speaker 2: You should just do it tonight after dinner.
Speaker 1: Yeah. Remind me, honestly. Also I told Sam I'd send him the deck by tomorrow morning and I haven't touched it.
Speaker 2: That's a lot for one night.
Speaker 1: I'm kind of wiped. I've been on my phone since like four.`


export default function PendantPage() {
  const router = useRouter()
  const devices = (useQuery(api.devices.mine) ?? []) as Device[]
  const stream = useQuery(api.devices.stream) as
    | { lastStartedAt: number; lastEndedAt: number; lastStatus: string; lastPreview: string | null }
    | null
    | undefined
  const me = useQuery(api.users.me) as { proactive: Proactive; notify: Notify } | null | undefined
  const pushPlaces = (useQuery(api.push.devices) ?? []) as Phone[]
  const browser = useBrowserPush()
  const updateNotify = useMutation(api.users.updateNotify).withOptimisticUpdate((store, next) => {
    const cur = store.getQuery(api.users.me, {})
    if (cur) store.setQuery(api.users.me, {}, { ...cur, notify: next })
  })
  const sendTest = useAction(api.push.sendTest)
  const notify: Notify = me?.notify ?? { nudges: true, approvals: true, updates: true }
  const C = PROACTIVE_COPY
  const [testing, setTesting] = useState(false)
  const connect = useMutation(api.devices.connect)
  const disconnect = useMutation(api.devices.disconnect)
  const updateProactive = useMutation(api.users.updateProactive)
  const simulate = useAction(api.agentNode.simulate)
  const checkNow = useAction(api.agentNode.checkNow)

  const device = devices[0]
  const connected = device?.status === "connected"
  const [sample, setSample] = useState(SAMPLE)
  const [running, setRunning] = useState<"sim" | "check" | null>(null)
  const [settings, setSettings] = useState<Proactive | null>(null)
  useEffect(() => {
    if (me && !settings) setSettings(me.proactive)
  }, [me, settings])

  const recent = stream && Date.now() - stream.lastEndedAt < 10 * 60_000

  async function save(next: Proactive) {
    setSettings(next)
    try {
      await updateProactive(next)
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't save")
    }
  }

  async function saveNotify(next: Notify) {
    try {
      await updateNotify(next)
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't save")
    }
  }

  async function enableBrowser() {
    try {
      if (await browser.enable()) toast.success("Notifications are on in this browser.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't turn on notifications")
    }
  }

  async function test() {
    setTesting(true)
    try {
      const { sent } = await sendTest({})
      if (sent) toast.success("Sent. Check your phone.")
      else toast.error("Nothing was sent. Turn on this browser, or check the push keys.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't send")
    } finally {
      setTesting(false)
    }
  }

  async function run(kind: "sim" | "check") {
    setRunning(kind)
    try {
      if (kind === "sim") await simulate({ transcript: sample })
      else await checkNow({})
      toast.success("wali looked it over. See Activity for the gate scores.")
      router.push("/activity")
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Failed")
    } finally {
      setRunning(null)
    }
  }

  return (
    <>
      <TopBar />
      <PageBody>
        <PageTitle
          title="Your pendant."
          em="You just wear it."
          lede="The pendant sends audio through your phone to wali's backend. Each finished conversation is transcribed, then wali decides whether it's worth a word."
        />

        <Section title="Connection">
          <Panel className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-[18px] bg-night">
                <div className="relative h-8 w-[18px] rounded-full bg-[#2a2826] ring-1 ring-white/15">
                  <span className="absolute top-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-white/40" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[16px] text-ink">
                  {device?.name ?? "wali pendant"}
                  <EmberDot live={connected} />
                </div>
                <p className="text-[13.5px] text-ink-2">
                  {connected
                    ? stream
                      ? `Last conversation ${ago(stream.lastEndedAt)}${recent ? " · active" : ""}`
                      : "Connected. Waiting for the first conversation."
                    : "Not connected. Any pendant on the shared stream works for now."}
                </p>
              </div>
            </div>
            {connected ? (
              <button
                onClick={() => device && disconnect({ id: device._id })}
                className="h-10 rounded-full bg-black/[0.06] px-5 text-[13.5px] font-medium text-ink"
              >
                Disconnect
              </button>
            ) : (
              <button onClick={() => connect({})} className="h-10 rounded-full bg-ink px-5 text-[13.5px] font-medium text-white">
                Connect pendant
              </button>
            )}
          </Panel>
          {stream?.lastPreview && connected && (
            <p className="mt-3 px-1 text-[13.5px] text-ink-3">&ldquo;{stream.lastPreview}&rdquo;</p>
          )}
        </Section>

        <Section title={C.title} description={C.intro}>
          {settings ? (
            <Panel className="divide-y divide-black/5 p-0">
              <Row label={C.enabled.title} hint={C.enabled.hint}>
                <Switch checked={settings.enabled} onCheckedChange={(v) => save({ ...settings, enabled: v })} />
              </Row>
              <Row label={C.quiet.title} hint={settings.quietEnabled ? C.quiet.on : C.quiet.off}>
                <Switch checked={settings.quietEnabled} onCheckedChange={(v) => save({ ...settings, quietEnabled: v })} />
              </Row>
              {settings.quietEnabled && (
                <Row label="From and until" hint={`${hourLabel(settings.quietStartHour)} to ${hourLabel(settings.quietEndHour)}`}>
                  <div className="flex items-center gap-1.5">
                    <Stepper value={settings.quietStartHour} min={0} max={23} onChange={(v) => save({ ...settings, quietStartHour: v })} format={hourLabel} wrap />
                    <span className="text-ink-3">to</span>
                    <Stepper value={settings.quietEndHour} min={0} max={23} onChange={(v) => save({ ...settings, quietEndHour: v })} format={hourLabel} wrap />
                  </div>
                </Row>
              )}
              <Row label={C.perHour(settings.maxPerHour)} hint={C.limits.footer}>
                <Stepper value={settings.maxPerHour} min={0} max={LIMITS.maxPerHour} onChange={(v) => save({ ...settings, maxPerHour: v })} />
              </Row>
              <Row label={C.perDay(settings.maxPerDay)}>
                <Stepper value={settings.maxPerDay} min={0} max={LIMITS.maxPerDay} onChange={(v) => save({ ...settings, maxPerDay: v })} />
              </Row>
            </Panel>
          ) : (
            <Panel className="flex justify-center py-10 text-ink-3">
              <Spinner />
            </Panel>
          )}
        </Section>

        <Section title={NOTIFY_COPY.title} description={`${NOTIFY_COPY.intro} ${NOTIFY_COPY.footer}`}>
          {settings ? (
            <Panel className="divide-y divide-black/5 p-0">
              {NOTIFY_COPY.rows.map((r) => (
                <Row key={r.key} label={r.title} hint={r.hint}>
                  <Switch checked={notify[r.key]} onCheckedChange={(v) => saveNotify({ ...notify, [r.key]: v })} />
                </Row>
              ))}
              <Row label="This browser" hint={BROWSER_HINT[browser.state]}>
                {browser.state === "on" ? (
                  <Switch checked onCheckedChange={() => void browser.disable()} />
                ) : browser.state === "off" ? (
                  <Switch checked={false} disabled={!browser.ready} onCheckedChange={() => void enableBrowser()} />
                ) : null}
              </Row>
              <Row
                label={pushPlaces.length ? pushPlaces.map((p) => p.deviceName ?? "iPhone").join(", ") : "Nowhere yet"}
                hint={
                  pushPlaces.length
                    ? `Last registered ${ago(Math.max(...pushPlaces.map((p) => p.updatedAt)))}`
                    : "Turn on this browser above, or allow notifications in the wali iPhone app."
                }
              >
                <button
                  disabled={!pushPlaces.length || testing}
                  onClick={() => void test()}
                  className="flex h-9 items-center gap-2 rounded-full bg-black/[0.06] px-4 text-[13px] font-medium text-ink disabled:opacity-40"
                >
                  {testing && <Spinner className="size-3.5" />}
                  Send a test
                </button>
              </Row>
            </Panel>
          ) : (
            <Panel className="flex justify-center py-10 text-ink-3">
              <Spinner />
            </Panel>
          )}
        </Section>

        <Section
          title="Try it without the pendant"
          description="Paste a conversation and run it through the same pipeline: rules, the Jev gate, then the agent. Anything wali decides to say lands in your wali thread."
        >
          <Panel>
            <textarea
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              rows={7}
              className="w-full resize-y rounded-2xl bg-paper p-4 text-[14px] leading-relaxed text-ink outline-none ring-1 ring-black/5 focus:ring-black/15"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={!!running}
                onClick={() => run("sim")}
                className="flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-white disabled:opacity-60"
              >
                {running === "sim" && <Spinner className="size-4" />}
                Run through wali
              </button>
              <button
                disabled={!!running}
                onClick={() => run("check")}
                className="flex h-10 items-center gap-2 rounded-full bg-black/[0.06] px-5 text-[13.5px] font-medium text-ink disabled:opacity-60"
              >
                {running === "check" && <Spinner className="size-4" />}
                Check the last two hours
              </button>
            </div>
          </Panel>
        </Section>
      </PageBody>
    </>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <div className="text-[14.5px] text-ink">{label}</div>
        {hint && <div className="text-[13px] text-ink-3">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

function Stepper({
  value,
  min,
  max,
  onChange,
  format = String,
  wrap = false,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  format?: (v: number) => string
  wrap?: boolean
}) {
  return (
    <div className="flex h-9 items-center rounded-full bg-black/[0.05] text-[13px]">
      <button aria-label="Less" className="h-9 w-8 rounded-full text-ink-2 hover:text-ink" onClick={() => onChange(value <= min ? (wrap ? max : min) : value - 1)}>
        −
      </button>
      <span className="min-w-12 text-center tabular-nums text-ink">{format(value)}</span>
      <button aria-label="More" className="h-9 w-8 rounded-full text-ink-2 hover:text-ink" onClick={() => onChange(value >= max ? (wrap ? min : max) : value + 1)}>
        +
      </button>
    </div>
  )
}
