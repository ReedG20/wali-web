/* wali's service worker: shows Web Push notifications (backend/convex/pushWeb.ts) and opens the
 * right thread when one is clicked. Approve / Decline open the app, which makes the call with the
 * signed-in session (same as the iPhone app). */

const threadPath = (data) => (!data || !data.threadId ? "/chat" : data.home === "1" ? "/chat" : `/chat/${data.threadId}`)

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

self.addEventListener("push", (event) => {
  if (!event.data) return
  let msg
  try {
    msg = event.data.json()
  } catch {
    msg = { title: "wali", body: event.data.text(), data: {} }
  }
  const data = msg.data || {}
  event.waitUntil(
    (async () => {
      // Someone already looking at this thread sees it arrive; don't pile a notification on top.
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      const path = threadPath(data)
      if (data.kind !== "test" && wins.some((c) => c.focused && new URL(c.url).pathname === path)) return
      await self.registration.showNotification(msg.title || "wali", {
        body: msg.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: data.approvalId || data.messageId || undefined,
        data,
        requireInteraction: data.kind === "approval",
        actions:
          data.kind === "approval"
            ? [
                { action: "approve", title: "Approve" },
                { action: "decline", title: "Decline" },
              ]
            : [],
      })
    })()
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const data = event.notification.data || {}
  let url = threadPath(data)
  if ((event.action === "approve" || event.action === "decline") && data.approvalId) {
    url += `?approval=${encodeURIComponent(data.approvalId)}&decision=${event.action}`
  }
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      const win = wins.find((c) => new URL(c.url).origin === self.location.origin)
      if (win) {
        await win.focus()
        return win.navigate(url)
      }
      return self.clients.openWindow(url)
    })()
  )
})
