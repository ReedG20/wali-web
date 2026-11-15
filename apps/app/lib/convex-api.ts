import { type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
  recordings: {
    generateUploadUrl: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      any
    >;
    create: FunctionReference<
      "mutation",
      "public",
      {
        backfill: boolean;
        boot: number;
        clientId: string;
        durationMs: number;
        levels: ArrayBuffer;
        seqEnd: number;
        seqStart: number;
        startedAt: number;
        storageId: Id<"_storage">;
        timeApprox?: boolean;
      },
      any
    >;
    retry: FunctionReference<
      "mutation",
      "public",
      { id: Id<"recordings"> },
      any
    >;
    list: FunctionReference<"query", "public", { limit?: number }, any>;
    get: FunctionReference<"query", "public", { id: Id<"recordings"> }, any>;
    byClientId: FunctionReference<"query", "public", { clientId: string }, any>;
  };
  utterances: {
    forRecording: FunctionReference<
      "query",
      "public",
      { recordingId: Id<"recordings"> },
      any
    >;
    recent: FunctionReference<"query", "public", { limit?: number }, any>;
  };
  activity: {
    gateEvents: FunctionReference<"query", "public", { limit?: number }, any>;
    notes: FunctionReference<"query", "public", Record<string, never>, any>;
    followups: FunctionReference<"query", "public", Record<string, never>, any>;
    cancelFollowup: FunctionReference<
      "mutation",
      "public",
      { id: Id<"followups"> },
      any
    >;
  };
  agentNode: {
    checkNow: FunctionReference<"action", "public", Record<string, never>, any>;
    connectApp: FunctionReference<
      "action",
      "public",
      { callbackUrl?: string; toolkit: string },
      any
    >;
    connections: FunctionReference<
      "action",
      "public",
      Record<string, never>,
      any
    >;
    disconnectApp: FunctionReference<
      "action",
      "public",
      { toolkit: string },
      any
    >;
    memoryOverview: FunctionReference<
      "action",
      "public",
      Record<string, never>,
      any
    >;
    memorySearch: FunctionReference<"action", "public", { query: string }, any>;
    simulate: FunctionReference<
      "action",
      "public",
      { transcript: string },
      any
    >;
    startBrowserSignIn: FunctionReference<
      "action",
      "public",
      Record<string, never>,
      any
    >;
    stopBrowserSignIn: FunctionReference<
      "action",
      "public",
      { browserId: string },
      any
    >;
    syncMemoryNow: FunctionReference<
      "action",
      "public",
      Record<string, never>,
      any
    >;
    warm: FunctionReference<"action", "public", Record<string, never>, any>;
  };
  approvals: {
    pending: FunctionReference<"query", "public", Record<string, never>, any>;
    decide: FunctionReference<
      "mutation",
      "public",
      {
        decision: "approve" | "decline";
        editedArgs?: any;
        id: Id<"approvals">;
      },
      any
    >;
  };
  devices: {
    mine: FunctionReference<"query", "public", Record<string, never>, any>;
    connect: FunctionReference<"mutation", "public", { name?: string }, any>;
    disconnect: FunctionReference<
      "mutation",
      "public",
      { id: Id<"devices"> },
      any
    >;
    stream: FunctionReference<"query", "public", Record<string, never>, any>;
  };
  messages: {
    act: FunctionReference<
      "mutation",
      "public",
      { action: string; id: Id<"messages"> },
      any
    >;
    list: FunctionReference<
      "query",
      "public",
      { threadId: Id<"threads"> },
      any
    >;
    respond: FunctionReference<
      "mutation",
      "public",
      { id: Id<"messages">; response: "helpful" | "dismissed" },
      any
    >;
    send: FunctionReference<
      "mutation",
      "public",
      { text: string; threadId: Id<"threads"> },
      any
    >;
  };
  threads: {
    list: FunctionReference<"query", "public", Record<string, never>, any>;
    get: FunctionReference<"query", "public", { id: Id<"threads"> }, any>;
    home: FunctionReference<"query", "public", Record<string, never>, any>;
    create: FunctionReference<"mutation", "public", Record<string, never>, any>;
    rename: FunctionReference<
      "mutation",
      "public",
      { id: Id<"threads">; title: string },
      any
    >;
    remove: FunctionReference<"mutation", "public", { id: Id<"threads"> }, any>;
  };
  transcripts: {
    recent: FunctionReference<"query", "public", { limit?: number }, any>;
  };
  users: {
    ensure: FunctionReference<"mutation", "public", { timezone?: string }, any>;
    me: FunctionReference<"query", "public", Record<string, never>, any>;
    updateProactive: FunctionReference<
      "mutation",
      "public",
      {
        enabled: boolean;
        maxPerDay: number;
        maxPerHour: number;
        quietEnabled?: boolean;
        quietEndHour: number;
        quietStartHour: number;
      },
      any
    >;
    updatePermissions: FunctionReference<
      "mutation",
      "public",
      { mode: "ask" | "balanced" | "auto" },
      any
    >;
    updateNotify: FunctionReference<
      "mutation",
      "public",
      { approvals: boolean; nudges: boolean; updates: boolean },
      any
    >;
  };
  appCatalog: {
    list: FunctionReference<"query", "public", Record<string, never>, any>;
  };
  voices: {
    overview: FunctionReference<"query", "public", Record<string, never>, any>;
    people: FunctionReference<"query", "public", Record<string, never>, any>;
    nameVoice: FunctionReference<
      "mutation",
      "public",
      {
        me?: boolean;
        name?: string;
        personId?: Id<"people">;
        voiceId: Id<"voices">;
      },
      any
    >;
    nameSpeaker: FunctionReference<
      "mutation",
      "public",
      {
        me?: boolean;
        name?: string;
        personId?: Id<"people">;
        recordingId: Id<"recordings">;
        speakerRaw: string;
      },
      any
    >;
    unnameVoice: FunctionReference<
      "mutation",
      "public",
      { voiceId: Id<"voices"> },
      any
    >;
    dismissMe: FunctionReference<
      "mutation",
      "public",
      { voiceId: Id<"voices"> },
      any
    >;
    setIgnored: FunctionReference<
      "mutation",
      "public",
      { ignored: boolean; voiceId: Id<"voices"> },
      any
    >;
    dismissNameSuggestion: FunctionReference<
      "mutation",
      "public",
      { voiceId: Id<"voices"> },
      any
    >;
    renamePerson: FunctionReference<
      "mutation",
      "public",
      { name: string; personId: Id<"people"> },
      any
    >;
  };
  push: {
    devices: FunctionReference<"query", "public", Record<string, never>, any>;
    register: FunctionReference<
      "mutation",
      "public",
      { deviceName?: string; platform: "ios" | "android"; token: string },
      any
    >;
    registerWeb: FunctionReference<
      "mutation",
      "public",
      { auth: string; endpoint: string; label?: string; p256dh: string },
      any
    >;
    sendTest: FunctionReference<"action", "public", Record<string, never>, any>;
    unregister: FunctionReference<"mutation", "public", { token: string }, any>;
    unregisterWeb: FunctionReference<
      "mutation",
      "public",
      { endpoint: string },
      any
    >;
    webConfig: FunctionReference<"query", "public", Record<string, never>, any>;
  };
};
export type InternalApiType = {};
