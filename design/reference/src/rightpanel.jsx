/* Synelia Cowork — Panneau droit (artefacts / fichiers / participants) + visionneuse d'artefact */

const RISK_ROWS = [
  { c: "Comptes à privilèges non revus", fam: "Gouvernance des accès", cote: "Critique", lvl: "crit", owner: "DSI" },
  { c: "Absence de PRA testé", fam: "Sauvegarde / PRA", cote: "Critique", lvl: "crit", owner: "Production" },
  { c: "Chiffrement des flux PAN incomplet", fam: "Conformité PCI-DSS", cote: "Élevé", lvl: "high", owner: "Sécurité" },
  { c: "Applications hors support (EOL)", fam: "Obsolescence", cote: "Élevé", lvl: "high", owner: "Études" },
  { c: "Cloisonnement réseau partiel", fam: "Gouvernance des accès", cote: "Moyen", lvl: "med", owner: "Réseau" },
  { c: "Journalisation incomplète", fam: "Conformité PCI-DSS", cote: "Moyen", lvl: "med", owner: "SOC" },
  { c: "Politique de mots de passe faible", fam: "Gouvernance des accès", cote: "Faible", lvl: "low", owner: "DSI" },
];

function ArtifactViewer({ artifact, streamRows, onClose, onShare, onMobileClose }) {
  const shown = streamRows != null ? RISK_ROWS.slice(0, streamRows) : RISK_ROWS;
  return (
    <div className="artview" style={{ flex: 1 }}>
      <div className="av-head">
        <button className="rp-mclose" onClick={onMobileClose || onClose} title="Fermer" aria-label="Fermer le panneau"><Icon name="arrow-left" size={18} color="currentColor" /></button>
        <span className="av-ic"><Icon name={artifact.icon} size={18} color="currentColor" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3>{artifact.title}</h3>
          <div className="sub">{artifact.kind} · généré par l'IA {artifact.live ? "· en cours" : ""}</div>
        </div>
        <div className="acts">
          <button className="ab" onClick={onShare} title="Partager"><Icon name="share-2" size={17} color="currentColor" /></button>
          <button className="ab" title="Télécharger"><Icon name="download" size={17} color="currentColor" /></button>
          <button className="ab" onClick={onClose} title="Fermer"><Icon name="panel-right-close" size={17} color="currentColor" /></button>
        </div>
      </div>
      <div className="av-doc">
        <div className="doc-kick">Audit SI — Coris Bank</div>
        <h2 className="doc-t">Matrice de risques consolidée</h2>
        <div className="doc-rule"></div>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          12 constats issus de la phase terrain, cotés sur 4 niveaux avec propriétaire désigné. Tri par criticité décroissante.
        </p>
        <table className="risk-table">
          <thead>
            <tr><th>Constat</th><th>Famille</th><th>Cotation</th><th>Propriétaire</th></tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600, color: "var(--color-text)" }}>{r.c}</td>
                <td>{r.fam}</td>
                <td><span className={"cote " + r.lvl}>{r.cote}</span></td>
                <td>{r.owner}</td>
              </tr>
            ))}
            {streamRows != null && streamRows < RISK_ROWS.length && (
              <tr className="streaming-row"><td colSpan={4} style={{ textAlign: "center", color: "var(--color-accent)", fontSize: 12 }}>
                <Icon name="sparkles" size={13} color="currentColor" style={{ verticalAlign: "-2px", marginRight: 6, display: "inline-flex" }} />
                L'IA rédige la suite…
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RightPanel({ projectId, chatId, liveArtifact, onOpenArtifact, onMobileClose }) {
  const [tab, setTab] = useState("artifacts");
  const p = SYN.PROJECTS.find(x => x.id === projectId);
  const chat = SYN.CHATS[projectId]?.find(c => c.id === chatId);
  const participants = chat?.participants || p?.members || [];
  const artifacts = SYN.ARTIFACTS.filter(a => a.project === projectId);

  return (
    <div className="rpanel">
      <div className="rp-tabs">
        <button className="rp-mclose" onClick={onMobileClose} title="Fermer" aria-label="Fermer le panneau"><Icon name="arrow-left" size={18} color="currentColor" /></button>
        <button className={"rp-tab" + (tab === "artifacts" ? " active" : "")} onClick={() => setTab("artifacts")}>
          <Icon name="layout-grid" size={15} /> Artefacts <span className="n">{artifacts.length}</span>
        </button>
        <button className={"rp-tab" + (tab === "files" ? " active" : "")} onClick={() => setTab("files")}>
          <Icon name="folder" size={15} /> Fichiers
        </button>
        <button className={"rp-tab" + (tab === "people" ? " active" : "")} onClick={() => setTab("people")}>
          <Icon name="users" size={15} /> Présents
        </button>
      </div>

      <div className="rp-scroll">
        {tab === "artifacts" && (
          <>
            {artifacts.map(a => (
              <div key={a.id} className={"art-card" + ((a.live && liveArtifact) ? " live" : "")} onClick={() => onOpenArtifact(a)}>
                <div className="ac-top">
                  <span className="ac-ic"><Icon name={a.icon} size={18} color="currentColor" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ac-name">{a.title}</div>
                    <div className="ac-meta">{a.kind} · {a.when}</div>
                  </div>
                </div>
                <div className="ac-foot">
                  {(a.live && liveArtifact)
                    ? <span className="live-mini"><Icon name="sparkles" size={13} color="currentColor" /> Mise à jour en direct</span>
                    : <><Icon name="sparkles" size={13} color="var(--color-primary-mid)" /> Généré par l'IA</>}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "files" && (
          <>
            <div className="upload-zone" style={{ padding: 14 }}>
              <Icon name="upload-cloud" size={22} color="var(--color-primary-mid)" style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 12 }}>Déposer un fichier</div>
            </div>
            <div className="rp-section-t">Connaissances du projet</div>
            {SYN.FILES.map(f => (
              <div key={f.id} className="file-row">
                <span className={"f-ic " + f.type}><Icon name={f.icon} size={17} color="currentColor" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="f-name">{f.name}</div>
                  <div className="f-meta">{SYN.TEAM[f.by].name.split(" ")[0]} · {f.size}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "people" && (
          <>
            <div className="rp-section-t">Dans cette conversation</div>
            {participants.map(id => {
              const u = SYN.TEAM[id];
              const isLive = chat?.live && chat?.liveUser === id;
              return (
                <div key={id} className="part-row">
                  <Avatar user={u} size={34} showOnline />
                  <div style={{ minWidth: 0 }}>
                    <div className="p-name">{u.name} {u.you && <span style={{ color: "var(--color-text-muted)", fontWeight: 400, fontSize: 11 }}>(vous)</span>}</div>
                    <div className="p-title">{u.title}</div>
                  </div>
                  <span className="p-here">
                    {isLive
                      ? <span className="live-mini">{chat.liveState === "user-typing" ? "écrit…" : "présent"}</span>
                      : null}
                  </span>
                </div>
              );
            })}
            <div className="rp-section-t" style={{ marginTop: 18 }}>Membres du projet</div>
            {p?.members.filter(id => !participants.includes(id)).map(id => {
              const u = SYN.TEAM[id];
              return (
                <div key={id} className="part-row">
                  <Avatar user={u} size={34} showOnline />
                  <div style={{ minWidth: 0 }}>
                    <div className="p-name">{u.name}</div>
                    <div className="p-title">{u.title}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

window.ArtifactViewer = ArtifactViewer;
window.RightPanel = RightPanel;
window.RISK_ROWS = RISK_ROWS;
if (window.SYN) window.SYN.RISK_ROWS = RISK_ROWS;
