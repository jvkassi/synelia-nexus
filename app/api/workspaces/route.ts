import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createWorkspace, getWorkspacesByUserId } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

const workspaceSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .regex(/^[a-z0-9-]{2,64}$/)
    .optional(),
});

function deriveSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:workspace").toResponse();
  }

  try {
    const workspaces = await getWorkspacesByUserId({ userId: session.user.id });
    return Response.json(workspaces);
  } catch (error) {
    if (error instanceof ChatbotError) {
      return error.toResponse();
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug: providedSlug } = workspaceSchema.parse(
      await request.json()
    );
    const slug = providedSlug ?? deriveSlug(name);

    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:workspace").toResponse();
    }

    const workspace = await createWorkspace({
      name,
      slug,
      userId: session.user.id,
    });

    return Response.json(workspace, { status: 201 });
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
