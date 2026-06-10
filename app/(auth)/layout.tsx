export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-dvh w-screen lg:grid-cols-[minmax(420px,44%)_1fr]">
      {/* Panneau de marque — visible à partir de lg */}
      <div className="hidden flex-col justify-between bg-primary-dark p-12 text-white lg:flex">
        <div
          className="flex items-baseline gap-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="font-bold text-lg tracking-[0.18em]">SYNELIA</span>
          <span className="text-white/40">·</span>
          <span className="font-medium text-lg text-white/80">Cowork</span>
        </div>

        <div className="flex flex-col gap-5">
          <span className="text-[11px] text-white/60 uppercase tracking-[0.14em]">
            Direction Data &amp; IA
          </span>
          <h1
            className="max-w-md font-bold text-4xl leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Travaillez avec l&apos;IA, ensemble.
          </h1>
          <div className="synelia-rule" />
          <p className="max-w-sm text-[15px] text-white/70 leading-relaxed">
            Projets partagés, conversations en temps réel et artefacts générés —
            l&apos;espace de travail IA de la Direction Data &amp; IA.
          </p>
        </div>

        <p className="text-white/50 text-xs">
          © Groupe Synelia — Connexion sécurisée
        </p>
      </div>

      {/* Colonne formulaire */}
      <div className="flex items-center justify-center bg-secondary p-6">
        {children}
      </div>
    </div>
  );
}
