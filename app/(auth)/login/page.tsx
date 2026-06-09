import { SyneliaRule } from "@/components/synelia-rule";
import { LoginForm } from "./login-form";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";

/**
 * Synelia Cowork — split-screen login.
 * Reference: design image (Synelia violet left panel + white right panel).
 * See /opt/data/synelia-nexus/DESIGN.md.
 */
export default function LoginPage() {
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
        {/* Wordmark — top left */}
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

        {/* Centered hero */}
        <div className="flex max-w-[520px] flex-col gap-6">
          <span
            className="synelia-eyebrow"
            style={{ color: "var(--accent)" }}
          >
            DIRECTION DATA &amp; IA
          </span>

          <h1 className="font-display text-[40px] font-bold leading-[1.1] text-white">
            L&rsquo;espace de travail IA collaboratif du Groupe Synelia.
          </h1>

          <SyneliaRule />

          <p className="font-body text-[15px] leading-relaxed text-white/80">
            Projets partag&eacute;s, conversations en temps r&eacute;el et
            livrables construits &agrave; plusieurs. Reprenez l&agrave; o&ugrave;
            votre &eacute;quipe s&rsquo;est arr&ecirc;t&eacute;e.
          </p>

          {/* Presence card */}
          <div className="mt-2 inline-flex w-fit items-center gap-4 rounded-lg border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
            <div className="synelia-avatar-stack">
              <span
                className="synelia-avatar"
                style={{ background: "var(--primary)" }}
              >
                AK
              </span>
              <span
                className="synelia-avatar"
                style={{ background: "var(--accent)" }}
              >
                KH
              </span>
              <span
                className="synelia-avatar"
                style={{ background: "#E85B9C" }}
              >
                FE
              </span>
              <span
                className="synelia-avatar"
                style={{ background: "var(--info)" }}
              >
                YN
              </span>
              <span
                className="synelia-avatar"
                style={{ background: "var(--success)" }}
              >
                MT
              </span>
              <span
                className="synelia-pulse-dot"
                aria-hidden
                style={{ marginLeft: 12 }}
              />
            </div>
            <p className="font-body text-[13px] leading-snug text-white/85">
              <span className="font-semibold text-white">5 co&eacute;quipiers</span>{" "}
              sont actifs sur l&rsquo;audit Coris Bank en ce moment.
            </p>
          </div>
        </div>

        {/* Footer — bottom left */}
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

      {/* RIGHT PANEL — sign-in form */}
      <section className="flex items-center justify-center bg-white p-8 md:p-12">
        <div className="w-full max-w-[420px]">
          <span className="synelia-eyebrow">CONNEXION</span>
          <h2 className="mt-4 font-display text-[28px] font-bold text-[var(--primary)]">
            Bon retour
          </h2>
          <p className="mt-2 font-body text-[14px] text-[var(--text-muted)]">
            Acc&eacute;dez &agrave; votre espace de travail collaboratif Synelia
            Cowork.
          </p>

          <LoginForm />

          <p className="mt-8 text-center font-body text-[13px] text-[var(--text-muted)]">
            Pas encore de compte ?{" "}
            <a
              className="font-semibold text-[var(--primary)] hover:underline"
              href="/register"
            >
              Demander un acc&egrave;s
            </a>
          </p>
        </div>
      </section>

      {/* Sticky footer — bottom of right panel */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-6 right-8 z-10 hidden items-center gap-2 text-[12px] text-[var(--text-muted)] md:flex"
      >
        <ShieldCheckIcon className="size-4 text-[var(--success)]" />
        Connexion s&eacute;curis&eacute;e &middot; Groupe Synelia
      </div>
    </main>
  );
}
