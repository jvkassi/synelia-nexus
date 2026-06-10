import { auth } from "@/app/(auth)/auth";
import {
  getChatAccess,
  getChatById,
  getMessagesByChatId,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { convertToUIMessages } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ error: "chatId required" }, { status: 400 });
  }

  const [session, chat, messages] = await Promise.all([
    auth(),
    getChatById({ id: chatId }),
    getMessagesByChatId({ id: chatId }),
  ]);

  if (!chat) {
    return Response.json({
      messages: [],
      visibility: "private",
      userId: null,
      isReadonly: false,
    });
  }

  const access = session?.user?.id
    ? await getChatAccess({ userId: session.user.id, chatId })
    : undefined;

  if (!access && chat.visibility !== "public") {
    return new ChatbotError("forbidden:chat").toResponse();
  }

  const isReadonly = !access;

  return Response.json({
    messages: convertToUIMessages(messages),
    visibility: chat.visibility,
    userId: chat.userId,
    isReadonly,
  });
}
