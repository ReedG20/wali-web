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
  status: "pending" | "approved" | "declined" | "running" | "done" | "failed"
  error?: string
  createdAt: number
}

export type BrowserTask = {
  _id: Id<"browserTasks">
  task: string
  status: "starting" | "running" | "completed" | "failed" | "cancelled"
  result?: string
  error?: string
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
