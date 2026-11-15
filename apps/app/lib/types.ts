import type { GenericId as Id } from "convex/values"

export type ToolPart = {
  toolCallId: string
  toolName: string
  args?: unknown
  result?: unknown
  state: "running" | "done" | "error"
}

export type Approval = {
  _id: Id<"approvals">
  channel: "composio" | "browser"
  title: string
  summary: string
  toolSlug?: string
  args: unknown
  /** Why it asked. Only "high" gets the full card; reads and small changes are a single row. */
  risk?: "read" | "low" | "high"
  /** What "Always allow" would cover. Absent when this can't be allowed for good. */
  scope?: { kind: "browser" | "app"; key: string; label: string }
  status: "pending" | "approved" | "declined" | "running" | "done" | "failed"
  error?: string
  createdAt: number
  decidedAt?: number
}

export type BrowserTask = {
  _id: Id<"browserTasks">
  task: string
  /** One plain sentence for the user; `task` is the full prompt the browser agent got. */
  summary?: string
  status: "starting" | "running" | "completed" | "failed" | "cancelled"
  result?: string
  error?: string
  /** Live view of the cloud browser; only present while the task is running. */
  liveUrl?: string
}

export type Message = {
  _id: Id<"messages">
  threadId: Id<"threads">
  role: "user" | "assistant"
  kind: "text" | "nudge" | "approval" | "update"
  status: "streaming" | "done" | "error"
  text: string
  tools?: ToolPart[]
  reasoning?: string
  thinkingMs?: number
  trigger?: { kind: string }
  actions?: string[]
  response?: "helpful" | "dismissed"
  chosenAction?: string
  error?: string
  createdAt: number
  approval: Approval | null
  browserTask: BrowserTask | null
}

export type Thread = {
  _id: Id<"threads">
  title: string
  kind: "home" | "chat"
  updatedAt: number
  preview?: string
}

export type GateEvent = {
  _id: Id<"gateEvents">
  trigger: { kind: string }
  excerpt: string
  passed: boolean
  reason: string
  scores?: {
    worthActing: number
    userAsked: number
    canHelp?: number
    distress: number
    badTime: number
    urgency: number
    kind: string
  }
  decision?: string
  costUsd?: number
  createdAt: number
}
