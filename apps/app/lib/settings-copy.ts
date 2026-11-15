/**
 * Settings copy shared by the web app and the iOS app (app/src/lib/settingsCopy.ts is the
 * same file). Keep them in sync so both apps describe wali the same way.
 */

export type Proactive = {
  enabled: boolean
  quietEnabled: boolean
  quietStartHour: number
  quietEndHour: number
  maxPerHour: number
  maxPerDay: number
}

export type Notify = { nudges: boolean; approvals: boolean; updates: boolean }

/** Same bounds the backend clamps to (backend/convex/lib/auth.ts). */
export const LIMITS = { maxPerHour: 20, maxPerDay: 100 }

export const PROACTIVE_COPY = {
  title: "When wali speaks up",
  intro: "Jev, a decision model, scores every finished conversation. These rules sit around it. Signs of distress always get through.",
  enabled: { title: "Proactive nudges", hint: "Let wali message you first." },
  quiet: {
    title: "Quiet hours",
    on: "wali keeps listening, but its messages wait in your thread without a notification. Urgent things and signs of distress still notify.",
    off: "Off. wali can notify you at any hour.",
  },
  limits: { title: "Limits", footer: "How often wali can message you first. Things you asked for skip the hourly limit." },
  perHour: (n: number) => (n === 1 ? "At most 1 an hour" : `At most ${n} an hour`),
  perDay: (n: number) => (n === 1 ? "At most 1 a day" : `At most ${n} a day`),
}

export const NOTIFY_COPY = {
  title: "Notifications",
  intro: "wali only notifies you when it speaks on its own, never for replies you're watching.",
  section: "Notify me about",
  footer: "Approvals have Approve and Decline right on the notification.",
  rows: [
    { key: "nudges", title: "Nudges", hint: "wali speaking first." },
    { key: "approvals", title: "Waiting for your OK", hint: "Something wali wants to do." },
    { key: "updates", title: "Finished work", hint: "An approved action ran, or the browser reported back." },
  ] as const,
}

export function hourLabel(h: number) {
  const d = new Date()
  d.setHours(h, 0, 0, 0)
  return d.toLocaleTimeString([], { hour: "numeric" })
}
