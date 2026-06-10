import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { requireWorkspaceMember } from "@/lib/auth/guards";
import { createProject, getProjectsForUser } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

const projectSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  memberIds: z.array(z.string().uuid()).optional(),
  visibility: z.enum(["private", "public_to_workspace"]).default("private"),
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

    const projects = await getProjectsForUser({
      workspaceId: id,
      userId: session.user.id,
    });
    return Response.json(projects);
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

    await requireWorkspaceMember(session.user.id, id);

    const { name, description, memberIds, visibility } = projectSchema.parse(
      await request.json()
    );

    const project = await createProject({
      workspaceId: id,
      name,
      description,
      memberIds,
      visibility,
      userId: session.user.id,
    });

    return Response.json(project, { status: 201 });
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
