# wali web app

Chat with wali, see what the pendant heard, and watch the proactive agent decide when to speak.
Next.js 16 + shadcn (base-luma, in `packages/ui`) + Clerk + Convex. Styling follows `web/DESIGN-BRIEF.md`.

```bash
cd web && bun install
cd apps/app && bun run dev        # http://localhost:3001
```

## How it fits together

```
pendant ─BLE─▶ iPhone app ─▶ Convex: recordings ─▶ transcribe.run (Scribe) ─▶ utterances
                                                                     │
                       utterances.saveTranscript schedules ──────────┘
                                   ▼
             agentNode.onRecording  (for every user with a connected pendant)
               rules (quiet hours, caps, cooldown after a dismissal)
               ▶ Jev gate  (Mastra Classifier → OpenRouter Decisions API, ~typesafe/jev-latest)
               ▶ Mastra agent (OpenRouter model, tools) ▶ structured decision
                    nothing | nudge | ask_first | act | follow_up | support
               ▶ nudge card in the user's "Mind" thread · log in gateEvents (Activity page)

web chat ─ messages.send ─▶ agentNode.respond (Mastra agent.stream, deltas written to Convex)
                                     └─ UI updates live through Convex queries
```

- **Everything agentic runs in Convex Node actions** (`backend/convex/agentNode.ts`, `backend/convex/agent/*`).
  No separate server. All model calls go through **one OpenRouter key**.
- **Memory = Supermemory** (`agent/memory.ts`), one namespace per user (`users.opaqueId`). Every finished pendant
  conversation and every note wali saves is added there (never wali's own chat). Chat agents are wrapped with
  `withSupermemory` (`mode: "full"`, `addMemory: "never"`), so each reply starts with the user's profile plus memories
  relevant to the message. The proactive path gives the profile to Jev and the agent, plus a targeted search.
  Connecting a pendant backfills existing history once; the Memory page shows the profile and searches it.
- **Tools** (`agent/tools.ts`): `search_memory` (Supermemory semantic search), `search_transcripts` (exact words), `recent_conversations`,
  `save_note`, `schedule_followup`, Composio Tool Router (`find_app_actions` → `run_app_action`, `connect_app`)
  and Browser Use Cloud v4 (`browser_task`).
- **Permission modes** (`lib/permissions.ts`, set on Connections and in the iOS app): *Ask every time* (every app action
  and browser task, reads included), *Ask for what matters* (default: reads and small private changes run; anything
  that reaches people, spends money, deletes, or touches a team space like Slack/GitHub asks) and *Don't ask*. Risk
  comes from Composio's free tool hints (`readOnlyHint`, `destructiveHint`...) plus the slug and arguments. Gated
  calls become an **approval card**; approving runs exactly the stored call, with no model in between. An approved
  read hands its result back to wali, which picks up the answer.
- **Push** (`push.ts`): nudges, approvals (with Approve / Decline actions) and finished work go to the user's iPhones
  through Expo's push service (needs an APNs key in EAS credentials) and to browsers through Web Push
  (`pushWeb.ts`, `public/sw.js`; needs `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` in Convex). Settings live on the Pendant page.
- **Pendant:** recordings don't carry an owner yet, so "Connect pendant" subscribes an account to the shared stream.
  The Pendant page also lets you paste a conversation and run it through the same pipeline (no hardware needed).

## Environment

`apps/app/.env.local` (written already): `NEXT_PUBLIC_CONVEX_URL`, Clerk dev keys, sign-in URLs.

Convex env (dev deployment `dapper-retriever-913`), set from `backend/`:

| Variable | Needed for |
|---|---|
| `CLERK_JWT_ISSUER_DOMAIN` | Auth (set) |
| `OPENROUTER_API_KEY` | Chat, Jev gate, proactive agent |
| `SUPERMEMORY_API_KEY` | Long-term memory (profile, search, ingestion) |
| `COMPOSIO_API_KEY` | Apps: the full Composio catalog (~1,700), mirrored daily into `appCatalog` for the Connections directory |
| `BROWSER_USE_API_KEY` | Cloud browser tasks and the sign-in browser |
| optional `MIND_AGENT_MODEL` (default `anthropic/claude-sonnet-5.5`), `MIND_GATE_MODEL` (default `~typesafe/jev-latest`), `MIND_GATE_*` thresholds, `COMPOSIO_TOOLKITS` (the featured six), `COMPOSIO_READ_ONLY_TOOLS` (slugs reviewed as reads), `BROWSER_USE_MODEL`, `EXPO_ACCESS_TOKEN` (only if Expo enhanced push security is on) | Tuning |

```bash
cd backend && npx convex env set OPENROUTER_API_KEY sk-or-...
```

## Clerk

The Clerk app is an **accountless dev instance** created with `npx clerk init --accountless` (keys in `.env.local`,
claim token in `.clerk/`, both gitignored). To move it into your Clerk account: `cd web/apps/app && npx clerk auth login`.
A JWT template named `convex` (aud `convex`) already exists on it.

## Regenerating the typed Convex API

`lib/convex-api.ts` is generated from the deployment: `cd backend && npm run api-spec`.
