import Link from "next/link";
import { SearchXIcon } from "lucide-react";

export default function NotFound() {
  return (
    <main style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100dvh", gap: 16, background: "var(--color-bg-alt)", textAlign: "center", padding: 40,
    }}>
      <span style={{ color: "var(--color-primary)", background: "rgba(75,40,130,.08)", borderRadius: 16, padding: 16 }}>
        <SearchXIcon size={36} />
      </span>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>Page introuvable</h1>
      <p style={{ fontSize: 15, color: "var(--color-text-muted)", maxWidth: 400, margin: 0 }}>
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="btn btn-primary"
        style={{ marginTop: 8, textDecoration: "none" }}
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
