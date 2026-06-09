import { NextResponse } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import {
  getMessagesByThread,
  getThread,
  getUserById,
  getWorkspace,
  isMember,
  saveMessage,
  touchThread,
} from "@/lib/db/queries";
import { getLanguageModel } from "@/lib/ai/providers";
import { systemPrompt } from "@/lib/ai/prompts";
import { buildWorkspaceTools } from "@/lib/ai/tools";
import { ensureWorkspaceDir } from "@/lib/ai/workspace-fs";
import { checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    workspaceId?: string;
    threadId?: string;
    messages?: UIMessage[];
  };
  const { workspaceId, threadId, messages } = body;
  if (!workspaceId || !threadId || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ code: "bad_request" }, { status: 400 });
  }

  if (!(await isMember(workspaceId, session.user.id))) {
    return NextResponse.json({ code: "forbidden" }, { status: 403 });
  }
  const t = await getThread(threadId);
  if (!t || t.workspaceId !== workspaceId) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  const w = await getWorkspace(workspaceId);
  if (!w) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  await ensureWorkspaceDir(w.dirName);

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return NextResponse.json({ code: "bad_request:no_user_msg" }, { status: 400 });
  }

  const rl = await checkRateLimit("chat", session.user.id, 200);
  if (!rl.success) {
    return NextResponse.json({ code: "rate_limit" }, { status: 429 });
  }

  // Persist the new user message exactly as the client sent it.
  await saveMessage({
    id: last.id,
    threadId,
    userId: session.user.id,
    role: "user",
    parts: last.parts as unknown[],
  });
  await touchThread(threadId);

  // Author metadata is already on the message (set by the client). Pass
  // through.
  const modelMessages = await convertToModelMessages(messages);

  const tools = buildWorkspaceTools({
    workspaceId,
    threadId,
    createdById: session.user.id,
  });

  const assistantId = generateId();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: getLanguageModel(),
        system: systemPrompt({
          requestHints: { workspaceName: w.name, workspaceDir: w.dirName },
          supportsTools: true,
        }),
        messages: modelMessages,
        stopWhen: stepCountIs(8),
        tools,
        onError: ({ error }) => {
          console.error("[chat] streamText error", error);
        },
        onFinish: async ({ text, finishReason }) => {
          try {
            const parts: unknown[] = text
              ? [{ type: "text", text }]
              : [];
            await saveMessage({
              id: assistantId,
              threadId,
              userId: null,
              role: "assistant",
              parts,
            });
            await touchThread(threadId);
          } catch (e) {
            console.error("[chat] onFinish save error", e, finishReason);
          }
        },
      });

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          onError: (err) => {
            console.error("[chat] UI stream error", err);
            return "Sorry, the AI run failed. Check the OpenCode server logs.";
          },
          messageMetadata: () => ({
            authorId: null,
            authorName: "AI",
            createdAt: new Date().toISOString(),
          }),
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");
  if (!threadId) {
    return NextResponse.json({ code: "bad_request" }, { status: 400 });
  }
  const t = await getThread(threadId);
  if (!t) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!(await isMember(t.workspaceId, session.user.id))) {
    return NextResponse.json({ code: "forbidden" }, { status: 403 });
  }
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;
  const msgs = await getMessagesByThread(threadId);

  // Look up author names once for the whole batch (avoids N+1 user lookups
  // on every poll).
  const userIds = Array.from(
    new Set(msgs.map((m) => m.userId).filter((x): x is string => !!x)),
  );
  const memberMap: Record<string, { name: string | null; email: string }> = {};
  await Promise.all(
    userIds.map(async (uid) => {
      const u = await getUserById(uid);
      if (u) {
        memberMap[u.id] = { name: u.name, email: u.email };
      }
    }),
  );

  const toWire = (
    m: (typeof msgs)[number],
  ): {
    id: string;
    role: "user" | "assistant" | "system";
    parts: unknown[];
    authorId: string | null;
    authorName: string | null;
    createdAt: string;
  } => {
    const meta = m.userId ? memberMap[m.userId] : null;
    const createdAt =
      m.createdAt instanceof Date
        ? m.createdAt
        : new Date(m.createdAt as unknown as number);
    return {
      id: m.id,
      role: m.role as "user" | "assistant" | "system",
      parts: Array.isArray(m.parts) ? m.parts : [],
      authorId: m.userId ?? null,
      authorName: meta?.name ?? meta?.email ?? null,
      createdAt: createdAt.toISOString(),
    };
  };

  const filtered = since
    ? msgs.filter((m) => {
        const d =
          m.createdAt instanceof Date
            ? m.createdAt
            : new Date(m.createdAt as unknown as number);
        return d > since;
      })
    : msgs;
  return NextResponse.json({ messages: filtered.map(toWire) });
}
