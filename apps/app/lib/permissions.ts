/**
 * The three permission modes. Same copy as the iOS app (app/src/lib/permissions.ts); the
 * rules themselves live in backend/convex/lib/permissions.ts.
 */
export type PermissionMode = "ask" | "balanced" | "auto"

export const PERMISSION_MODES: { id: PermissionMode; title: string; summary: string; examples: string }[] = [
  {
    id: "ask",
    title: "Ask every time",
    summary: "wali asks before it does anything in your apps or on the web, even reading.",
    examples: "Checking your calendar, reading an email, sending one: each waits for your OK.",
  },
  {
    id: "balanced",
    title: "Ask for what matters",
    summary: "Reading and small private changes happen on their own. Anything that reaches other people, spends money or deletes waits for you.",
    examples: "On its own: reading email, looking something up on a site, a draft, a label, an event with no guests. Waits: sending, inviting, deleting, paying, anything in Slack or GitHub.",
  },
  {
    id: "auto",
    title: "Don't ask",
    summary: "wali acts on its own and tells you what it did.",
    examples: "Emails go out, invites are sent and things are deleted without a check.",
  },
]

export const PERMISSION_LABEL: Record<PermissionMode, string> = {
  ask: "Ask every time",
  balanced: "Ask for what matters",
  auto: "Don't ask",
}

/** Footer under the three choices, in both apps. */
export const PERMISSIONS_NOTE =
  "This covers your connected apps and the browser. wali's own memory, notes and reminders never need an OK. Anything waiting shows up in your thread and as a notification."
