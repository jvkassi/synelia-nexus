"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", gap: 16, padding: 40, textAlign: "center",
    }}>
      <span style={{ color: "var(--color-error)", background: "var(--bg-error)", borderRadius: 12, padding: 12 }}>
        <AlertTriangleIcon size={28} />
      </span>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Une erreur est survenue</h2>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", maxWidth: 400, margin: 0 }}>
        {error.message || "Quelque chose s'est mal passé. Réessayez ou contactez le support."}
      </p>
      <button className="btn btn-primary" type="button" onClick={reset} style={{ marginTop: 8 }}>
        <RefreshCwIcon size={14} />
        Réessayer
      </button>
    </div>
  );
}
