import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  requireWorkspaceMember,
  requireWorkspaceOwner,
} from "@/lib/auth/guards";
import {
  addWorkspaceMember,
  getUser,
  getWorkspaceMembers,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "member"]).default("member"),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:workspace").toResponse();
    }

    await requireWorkspaceMember(session.user.id, id);

    const members = await getWorkspaceMembers({ workspaceId: id });
    return Response.json(members);
  } catch (error) {
    if (error instanceof ChatbotError) {
      return error.toResponse();
    }
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:workspace").toResponse();
    }

    await requireWorkspaceOwner(session.user.id, id);

    const { email, role } = addMemberSchema.parse(await request.json());

    const users = await getUser(email);

    if (users.length === 0) {
      return new ChatbotError(
        "not_found:workspace",
        "user not found"
      ).toResponse();
    }

    const found = users[0];

    await addWorkspaceMember({
      workspaceId: id,
      userId: found.id,
      role,
    });

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ChatbotError) {
      return error.toResponse();
    }
    if (error instanceof z.ZodError) {
      return new ChatbotError("bad_request:workspace").toResponse();
    }
    throw error;
  }
}
