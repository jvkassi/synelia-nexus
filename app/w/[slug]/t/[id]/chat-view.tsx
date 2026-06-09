"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type WireMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: unknown[];
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
};

type ChatMetadata = {
  authorId?: string | null;
  authorName?: string | null;
  createdAt?: string;
};

export function ChatView(props: {
  workspaceId: string;
  threadId: string;
  workspaceName: string;
  workspaceDir: string;
  initialMessages: WireMessage[];
  currentUserId: string;
  currentUserName: string | null;
}) {
  // We store the "wire" representation (with authorId/authorName) and the AI
  // SDK message list. The AI SDK's useChat handles streaming; we mirror
  // each streamed message back into the wire shape for rendering.
  const [aiMessages, setAiMessages] = useState<UIMessage[]>(() =>
    toAiMessages(props.initialMessages),
  );
  const [pendingAuthor, setPendingAuthor] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          workspaceId: props.workspaceId,
          threadId: props.threadId,
          authorId: props.currentUserId,
          authorName: props.currentUserName,
        },
      }),
    [props.workspaceId, props.threadId, props.currentUserId, props.currentUserName],
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    id: props.threadId,
    transport,
    messages: aiMessages,
    onError: (err) => {
      console.error("chat error", err);
    },
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Track "who triggered the current assistant turn" so we can show
  // "AI is responding to X" in the UI.
  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      // The most recent user message tells us who triggered this.
      const last = [...messages].reverse().find((m) => m.role === "user");
      if (last) {
        const meta = (last.metadata ?? {}) as ChatMetadata;
        setPendingAuthor({
          id: last.id,
          name: meta.authorName ?? "a teammate",
        });
      }
    } else {
      setPendingAuthor(null);
    }
  }, [status, messages]);

  // Mirror streamed messages back to local state so the initial seed list
  // doesn't keep re-overwriting them.
  useEffect(() => {
    setAiMessages(messages);
  }, [messages]);

  const isStreaming = status === "submitted" || status === "streaming";

  // The render source = useChat's live messages (current turn) UNION
  // whatever the poll loop has pulled in (other users' messages, completed
  // assistant replies that finished after our session started). Dedupe by id
  // — the poll filter already excludes known ids, but be defensive.
  const displayedMessages = useMemo(() => {
    if (aiMessages.length === messages.length) {
      return messages;
    }
    const known = new Set(messages.map((m) => m.id));
    const extras = aiMessages.filter((m) => !known.has(m.id));
    return extras.length === 0 ? messages : [...messages, ...extras];
  }, [messages, aiMessages]);

  // ---------------------------------------------------------------------
  // Multi-user presence: poll the server every 4s for messages we don't
  // already have (i.e. ones other workspace members just sent, or the
  // assistant's reply that the AI SDK is no longer streaming to us).
  //
  // Rules:
  //  - Skip when the tab is hidden (Page Visibility API).
  //  - Skip while useChat is mid-stream on OUR side (avoid duplicate
  //    renders of a turn we are driving).
  //  - Dedupe by id against what useChat already has.
  //  - Stop on unmount / when threadId changes.
  //  - Only "complete" assistant messages are appended by polling —
  //    the AI SDK still owns the live-stream of our own assistant turn.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const threadId = props.threadId;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const localIds = () => new Set(messages.map((m) => m.id));

    const tick = async () => {
      if (cancelled) {
        return;
      }
      if (document.visibilityState !== "visible") {
        scheduleNext();
        return;
      }
      // Only poll when no local stream is in flight.
      if (status === "submitted" || status === "streaming") {
        scheduleNext();
        return;
      }
      try {
        const known = localIds();
        const lastId = messages[messages.length - 1]?.id;
        const url = new URL("/api/chat", window.location.origin);
        url.searchParams.set("threadId", threadId);
        if (lastId) {
          url.searchParams.set("since", lastId);
        }
        const res = await fetch(url.toString(), {
          method: "GET",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          scheduleNext();
          return;
        }
        const data = (await res.json()) as { messages?: WireMessage[] };
        const fresh = (data.messages ?? []).filter(
          (m) => !known.has(m.id),
        );
        if (fresh.length > 0 && !cancelled) {
          setAiMessages((prev) => [...prev, ...toAiMessages(fresh)]);
        }
      } catch {
        // Network blip: ignore, just retry next tick.
      }
      scheduleNext();
    };

    const scheduleNext = () => {
      if (cancelled) {
        return;
      }
      timer = setTimeout(tick, 4000);
    };

    // Kick off after a small delay so it doesn't race the initial render.
    timer = setTimeout(tick, 1500);

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
    // We intentionally re-arm the loop when the streaming status flips
    // (so we resume polling right after our own assistant finishes).
  }, [props.threadId, status, messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
          {displayedMessages.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">
                Welcome to {props.workspaceName}.
              </p>
              <p>
                The AI can read and write files in{" "}
                <code>/workspaces/{props.workspaceDir}/</code>, search the web,
                and run tasks on a schedule. Just ask.
              </p>
            </div>
          ) : null}
          {displayedMessages.map((m) => (
            <Bubble
              key={m.id}
              m={m}
              currentUserId={props.currentUserId}
              currentUserName={props.currentUserName}
            />
          ))}
          {isStreaming && pendingAuthor ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current" />
              </span>
              AI is responding to {pendingAuthor.name}…
              <Button
                size="sm"
                variant="ghost"
                onClick={() => stop()}
                className="ml-2 h-6 px-2 text-xs"
              >
                Stop
              </Button>
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
              {error.message}
            </div>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text) {
            return;
          }
          sendMessage({
            text,
            metadata: {
              authorId: props.currentUserId,
              authorName: props.currentUserName,
            },
          });
          setInput("");
        }}
        className="border-t p-4"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const text = input.trim();
                if (!text) {
                  return;
                }
                sendMessage({
                  text,
                  metadata: {
                    authorId: props.currentUserId,
                    authorName: props.currentUserName,
                  },
                });
                setInput("");
              }
            }}
            placeholder="Message the team & the AI…"
            className="min-h-12 flex-1 resize-none"
            rows={2}
          />
          <Button type="submit" disabled={isStreaming}>
            {isStreaming ? "Sending…" : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Bubble({
  m,
  currentUserId,
  currentUserName,
}: {
  m: UIMessage;
  currentUserId: string;
  currentUserName: string | null;
}) {
  const isUser = m.role === "user";
  const isAssistant = m.role === "assistant";
  const meta = m.metadata as ChatMetadata | undefined;
  const authorId = meta?.authorId ?? null;
  const authorName =
    meta?.authorName ??
    (isAssistant ? "AI" : currentUserName ?? "Member");
  const isMine = isUser && authorId === currentUserId;

  // Extract text from parts (text or tool-result text).
  const text = m.parts
    .map((p: any) => {
      if (p?.type === "text" && typeof p.text === "string") {
        return p.text;
      }
      if (p?.type === "reasoning" && typeof p.text === "string") {
        return p.text;
      }
      return "";
    })
    .join("")
    .trim();

  const toolParts = m.parts.filter(
    (p: any) =>
      typeof p?.type === "string" &&
      (p.type.startsWith("tool-") || p.type === "dynamic-tool"),
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isMine ? "items-end" : "items-start",
      )}
    >
      <div className="text-xs text-muted-foreground">
        {authorName}
        {isAssistant ? "" : ""}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
          isAssistant
            ? "bg-muted"
            : isMine
              ? "bg-primary text-primary-foreground"
              : "bg-secondary",
        )}
      >
        {text || (isAssistant ? <em className="opacity-60">…</em> : null)}
        {toolParts.length > 0 ? (
          <div className="mt-2 space-y-1 border-t pt-2 text-xs opacity-80">
            {toolParts.map((p: any, i: number) => (
              <ToolPartView key={i} part={p} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ToolPartView({ part }: { part: any }) {
  const name =
    part.type === "dynamic-tool"
      ? part.toolName ?? "tool"
      : (part.type as string).replace(/^tool-/, "");
  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div>
        <span className="font-mono">→ {name}(</span>
        <code className="ml-1">{summarize(part.input)}</code>
        <span className="font-mono">)</span>
      </div>
    );
  }
  if (part.state === "output-available") {
    return (
      <div>
        <span className="font-mono">↪ {name}: </span>
        <code>{summarize(part.output)}</code>
      </div>
    );
  }
  if (part.state === "output-error") {
    return (
      <div className="text-red-500">
        <span className="font-mono">↪ {name} error: </span>
        {String(part.error ?? "")}
      </div>
    );
  }
  return null;
}

function summarize(v: unknown): string {
  if (v == null) {
    return "…";
  }
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 200 ? `${s.slice(0, 200)}…` : s;
}

function toAiMessages(initial: WireMessage[]): UIMessage[] {
  return initial.map((m) => ({
    id: m.id,
    role: m.role,
    parts: m.parts as UIMessage["parts"],
    metadata: {
      authorId: m.authorId,
      authorName: m.authorName,
      createdAt: m.createdAt,
    },
  }));
}
