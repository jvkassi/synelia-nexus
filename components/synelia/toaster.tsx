"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

/** Global toast — 2.6s auto-dismiss, single message at a time, matches the
 *  handoff's `<div className="toast">…</div>` styling. */

interface ToastCtx { show: (msg: string) => void; }
const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);

  const show = useCallback((m: string) => {
    setMsg(m);
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {msg && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={17} color="var(--color-success)" />
          <span>{msg}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/** Drop this into a layout next to other providers. */
export function Toaster() { return null; }
