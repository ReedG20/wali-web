export function timeLabel(ms: number) {
  const d = new Date(ms)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  if (sameDay) return t
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${t}`
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${t}`
}

export function ago(ms: number) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
  if (s < 60) return "just now"
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hr ago`
  return `${Math.round(h / 24)} d ago`
}

export function duration(ms: number) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m} min ${s % 60 ? `${s % 60}s` : ""}`.trim()
}

/** "2:14 PM" */
export function clock(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

/** "Today", "Yesterday", "Monday, Nov 9" (with the year once it differs). */
export function dayLabel(ms: number) {
  const d = new Date(ms)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return "Today"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  })
}
