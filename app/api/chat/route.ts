import { NextResponse } from "next/server";

/**
 * Synelia Cowork — chat route.
 *
 * The full implementation lives in Phase 3 of the rebuild plan (see
 * .hermes/TODO.md) and depends on the Workspace/Thread schema migration
 * that comes in Phase 1B/2. The old Vercel-fork `/api/chat` route was
 * a multi-user streaming endpoint for the Vercel Chat shape; the new
 * Synelia endpoint will:
 *
 *   - take { workspaceId, threadId, messages } from the client
 *   - gate on NextAuth session + workspace membership
 *   - call streamText() with buildWorkspaceTools() (workspace_read,
 *     workspace_write, workspace_list, workspace_edit,
 *     create_artifact, schedule_task)
 *   - emit AI SDK 6 UIMessage parts to a createUIMessageStreamResponse
 *   - persist the new user message + the assistant message on onFinish
 *
 * Until that ships, this stub returns 501 so the rest of the app can
 * build and the UI surfaces can be developed in isolation. See
 * `.hermes/DISCOVERY-2026-06-09.md` for the full Phase 3 spec.
 */
export async function POST() {
  return NextResponse.json(
    {
      code: "not_implemented",
      message: "Chat endpoint ships in Phase 3 — see .hermes/TODO.md.",
    },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      code: "not_implemented",
      message: "Chat history endpoint ships in Phase 3.",
    },
    { status: 501 }
  );
}
