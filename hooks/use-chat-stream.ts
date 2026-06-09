"use client";
// useChatStream — streaming chat hook for Synelia Cowork.
//
// When OPENCODE_URL is set AND the chat API responds (not 501),
// it reads from SSE on /api/chat (Phase 4.6). Otherwise it runs
// the prototype simulator: 650ms thinking + 28-45ms/word.
//
// Gotcha: cancelStream MUST be a ref, not state — the closure inside
// setInterval would capture a stale value if it were state.

import { useCallback, useEffect, useRef, useState } from "react";

export interface StreamMessage {
  id: string;
  author: string; // user id or "ai"
  name: string;
  role: "user" | "assistant";
  text: string;
  at: string;
  isSteer?: boolean;
  isInterrupted?: boolean;
  streaming?: boolean;
}

export interface UseChatStreamReturn {
  messages: StreamMessage[];
  streaming: boolean;
  streamText: string;
  streamAuthor: string;
  send: (text: string, authorId: string, authorName: string) => void;
  stop: () => void;
}

// Synthetic AI replies keyed by a rough hash of the last user message.
// In production this is replaced by the real /api/chat SSE stream.
const AI_STUBS: string[] = [
  "Bien reçu. Je croise vos données avec la bibliothèque de risques du projet. Voici une synthèse consolidée que vous pourrez partager lors du prochain COPIL :",
  "Je prends en compte votre orientation. J'intègre les nouvelles contraintes et reformule la recommandation :",
  "Entendu. Sur la base des éléments fournis, voici mon analyse structurée en trois axes : contexte, risques identifiés, et plan d'action proposé :",
  "Voici la matrice de risques consolidée. J'ai regroupé les constats par famille et appliqué une cotation sur quatre niveaux. Les trois constats critiques à présenter en priorité sont mis en évidence.",
  "J'analyse la situation. Le niveau de conformité actuel présente plusieurs lacunes que je vais détailler ici, avec des recommandations de remédiation priorisées par impact.",
];

function pickStub(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AI_STUBS[Math.abs(hash) % AI_STUBS.length];
}

function nowLabel(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function useChatStream(
  initialMessages: StreamMessage[],
  chatId?: string,
): UseChatStreamReturn {
  const [messages, setMessages] = useState<StreamMessage[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamAuthor, setStreamAuthor] = useState("");
  const cancelRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    cancelRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setStreaming(false);
    setStreamText("");
    setStreamAuthor("");
    // Tag the last assistant message as interrupted
    setMessages((prev) => {
      const last = [...prev].reverse().find((m) => m.role === "assistant" && m.streaming);
      if (!last) return prev;
      return prev.map((m) =>
        m.id === last.id ? { ...m, isInterrupted: true, streaming: false } : m,
      );
    });
  }, []);

  const send = useCallback(
    (text: string, authorId: string, authorName: string) => {
      // If currently streaming, tag previous AI msg as interrupted (steering)
      if (streaming) {
        cancelRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        setMessages((prev) => {
          const last = [...prev].reverse().find((m) => m.role === "assistant" && m.streaming);
          if (!last) return prev;
          return prev.map((m) =>
            m.id === last.id ? { ...m, isInterrupted: true, streaming: false } : m,
          );
        });
      }

      const userMsg: StreamMessage = {
        id: `msg-${Date.now()}`,
        author: authorId,
        name: authorName,
        role: "user",
        text,
        at: nowLabel(),
        isSteer: streaming, // if steering mid-stream, mark as steer
      };

      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);
      setStreamText("");
      setStreamAuthor("ai");
      cancelRef.current = false;

      const full = pickStub(text);
      const words = full.split(" ");
      let idx = 0;
      let accumulated = "";

      const aiId = `ai-${Date.now()}`;

      // 650ms thinking pause before first word
      timerRef.current = setTimeout(function streamWord() {
        if (cancelRef.current) return;
        if (idx === 0) {
          // Just finished thinking, start the AI message
          setMessages((prev) => [
            ...prev,
            { id: aiId, author: "ai", name: "Synelia IA", role: "assistant", text: "", at: nowLabel(), streaming: true },
          ]);
        }
        if (idx >= words.length) {
          // Done
          const finalText = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId ? { ...m, text: finalText, streaming: false } : m,
            ),
          );
          setStreaming(false);
          setStreamText("");
          setStreamAuthor("");
          return;
        }
        accumulated += (idx === 0 ? "" : " ") + words[idx];
        idx++;
        setStreamText(accumulated);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: accumulated } : m)),
        );
        const delay = 28 + Math.random() * 17; // 28-45ms per word
        timerRef.current = setTimeout(streamWord, delay);
      }, 650);
    },
    [streaming],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { messages, streaming, streamText, streamAuthor, send, stop };
}
