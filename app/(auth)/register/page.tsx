import { SyneliaRule } from "@/components/synelia-rule";
import { RegisterForm } from "./register-form";
import { ShieldCheckIcon } from "lucide-react";

/**
 * Synelia Cowork — register screen.
 * Mirrors the login split-screen (Synelia violet left + white right).
 */
export default function RegisterPage() {
  return (
    <main className="grid h-dvh w-screen grid-cols-1 md:grid-cols-[3fr_2fr]">
      {/* LEFT PANEL — Synelia violet brand band */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex"
        style={{
          background:
            "linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 100%)",
        }}
      >
        <header className="flex items-center gap-3 text-white">
          <span className="text-[15px] font-extrabold tracking-[0.25em]">
            SYNELIA
          </span>
          <span
            aria-hidden
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          <span className="text-[11px] font-semibold tracking-[0.3em] text-white/70">
            COWORK
          </span>
        </header>

        <div className="flex max-w-[520px] flex-col gap-6">
          <span
            className="synelia-eyebrow"
            style={{ color: "var(--accent)" }}
          >
            CR&Eacute;ATION DE COMPTE
          </span>

          <h1 className="font-display text-[40px] font-bold leading-[1.1] text-white">
            Rejoignez Synelia Cowork.
          </h1>

          <SyneliaRule />

          <p className="font-body text-[15px] leading-relaxed text-white/80">
            Cr&eacute;ez votre espace et invitez votre &eacute;quipe &agrave;
            travailler sur des projets partag&eacute;s, avec un assistant IA qui
            produit vos livrables en temps r&eacute;el.
          </p>
        </div>

        <footer className="flex items-center gap-3 text-[12px] text-white/50">
          <span>&copy; 2026 Groupe Synelia</span>
          <span aria-hidden>&middot;</span>
          <a className="hover:text-white/80" href="#">
            Confidentialit&eacute;
          </a>
          <span aria-hidden>&middot;</span>
          <a className="hover:text-white/80" href="#">
            Aide
          </a>
        </footer>
      </aside>

      {/* RIGHT PANEL — register form */}
      <section className="flex items-center justify-center bg-white p-8 md:p-12">
        <div className="w-full max-w-[420px]">
          <span className="synelia-eyebrow">CR&Eacute;ATION DE COMPTE</span>
          <h2 className="mt-4 font-display text-[28px] font-bold text-[var(--primary)]">
            Cr&eacute;er mon compte
          </h2>
          <p className="mt-2 font-body text-[14px] text-[var(--text-muted)]">
            Quelques informations et vous &ecirc;tes op&eacute;rationnel.
          </p>

          <RegisterForm />

          <p className="mt-8 text-center font-body text-[13px] text-[var(--text-muted)]">
            D&eacute;j&agrave; un compte ?{" "}
            <a
              className="font-semibold text-[var(--primary)] hover:underline"
              href="/login"
            >
              Se connecter
            </a>
          </p>
        </div>
      </section>

      <div
        aria-hidden
        className="pointer-events-none fixed bottom-6 right-8 z-10 hidden items-center gap-2 text-[12px] text-[var(--text-muted)] md:flex"
      >
        <ShieldCheckIcon className="size-4 text-[var(--success)]" />
        Inscription s&eacute;curis&eacute;e &middot; Groupe Synelia
      </div>
    </main>
  );
}
