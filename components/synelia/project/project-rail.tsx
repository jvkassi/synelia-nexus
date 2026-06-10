import { CalendarClock, FileText, Paperclip, Sparkles } from "lucide-react";
import type { ProjectFile, Routine } from "@/lib/db/schema";

/* Rail latéral du détail projet : Instructions / Fichiers / Compétences /
   Tâches planifiées (actions décoratives en v1). */

const STROKE = 1.75;

function formatSize(bytes: number | null): string {
  if (!bytes) {
    return "";
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} Mo`;
  }
  return `${Math.round(bytes / 1000)} Ko`;
}

function RailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <h3
        className="mb-2.5 flex items-center gap-2 font-semibold text-[13px] text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <Icon className="text-primary" size={15} strokeWidth={STROKE} />
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ProjectRail({
  description,
  files,
  routines,
}: {
  description: string | null;
  files: ProjectFile[];
  routines: Routine[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <RailCard icon={FileText} title="Instructions">
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
          {description ??
            "Ajouter des instructions pour orienter l'IA dans ce projet."}
        </p>
      </RailCard>

      <RailCard icon={Paperclip} title="Fichiers">
        {files.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {files.slice(0, 5).map((f) => (
              <li
                className="flex items-baseline justify-between gap-2 text-[12.5px]"
                key={f.id}
              >
                <span className="min-w-0 truncate text-foreground">
                  {f.name}
                </span>
                <span className="flex-none text-muted-foreground">
                  {formatSize(f.size)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">Aucun fichier.</p>
        )}
      </RailCard>

      <RailCard icon={Sparkles} title="Compétences">
        <p className="text-[12.5px] text-muted-foreground">
          Bientôt disponible.
        </p>
      </RailCard>

      <RailCard icon={CalendarClock} title="Tâches planifiées">
        {routines.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {routines.map((r) => (
              <li className="flex items-start gap-2" key={r.id}>
                <span
                  className={
                    r.status === "active"
                      ? "mt-1.5 size-[7px] flex-none rounded-full bg-success"
                      : "mt-1.5 size-[7px] flex-none rounded-full bg-muted-foreground"
                  }
                />
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-foreground">
                    {r.title}
                  </span>
                  <span className="block text-[11.5px] text-muted-foreground">
                    {r.cadenceLabel}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">Aucune routine.</p>
        )}
      </RailCard>
    </div>
  );
}
