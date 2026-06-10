/* Synelia Cowork — Artefacts : galerie projet, galerie globale, visionneuse + partage par lien */

function artifactLink(a) {
  return "https://cowork.synelia.tech/a/" + a.id + "-" + (a.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32);
}

const KIND_META = {
  "Document":  { cls: "k-doc",  ic: "file-text" },
  "Tableur":   { cls: "k-sheet", ic: "table-2" },
  "Diagramme": { cls: "k-diag", ic: "git-fork" },
};

function ArtifactCard({ a, onOpen, showProject }) {
  const proj = SYN.PROJECTS.find(p => p.id === a.project);
  const u = SYN.TEAM[a.creator];
  const km = KIND_META[a.kind] || KIND_META["Document"];
  return (
    <div className="artg-card" onClick={() => onOpen(a)}>
      <div className="agc-top">
        <span className={"agc-ic " + km.cls}><Icon name={a.icon} size={20} color="currentColor" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="agc-title">{a.title}</div>
          <div className="agc-kind"><span className={"kind-chip " + km.cls}>{a.kind}</span>{a.live && <LivePill>En cours</LivePill>}</div>
        </div>
      </div>
      {showProject && proj && (
        <div className="agc-proj">
          <span className="ap-ic" style={{ background: proj.color }}><Icon name={proj.emoji} size={12} color="#fff" /></span>
          {proj.name}
        </div>
      )}
      <div className="agc-foot">
        <span className="agc-by"><Avatar user={u} size={20} /> {u.name.split(" ")[0]}<span className="dotsep">·</span>{a.when}</span>
        {a.shared && <span className="agc-shared" title="Partagé par lien"><Icon name="link" size={12} color="currentColor" /> Lien actif</span>}
      </div>
    </div>
  );
}

/* Onglet artefacts d'un projet */
function ProjectArtifacts({ projectId, onOpen }) {
  const list = SYN.ARTIFACTS.filter(a => a.project === projectId);
  return (
    <div className="chat-list">
      {list.length === 0
        ? <div className="empty"><Icon name="layout-grid" size={26} color="var(--color-text-muted)" style={{ display: "inline-flex", marginBottom: 8 }} /><div>Aucun artefact généré dans ce projet pour l'instant.</div></div>
        : <div className="artg-grid">{list.map(a => <ArtifactCard key={a.id} a={a} onOpen={onOpen} />)}</div>}
    </div>
  );
}

/* Galerie globale — tous les artefacts de tous les projets */
function ArtifactsView({ onOpen, onOpenProject }) {
  const [proj, setProj] = useState("all");
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SYN.ARTIFACTS.filter(a => {
      const okP = proj === "all" || a.project === proj;
      const okK = kind === "all" || a.kind === kind;
      const okQ = !needle || a.title.toLowerCase().includes(needle);
      return okP && okK && okQ;
    });
  }, [proj, kind, q]);

  const kinds = ["all", "Document", "Tableur", "Diagramme"];

  return (
    <div className="lib">
      <div className="dash-hero">
        <div>
          <div className="dash-kicker">Production de l'équipe</div>
          <h1>Artefacts</h1>
          <div className="greet-sub">Tous les livrables générés par l'IA, à travers l'ensemble des projets du département.</div>
        </div>
        <div className="artg-count">{SYN.ARTIFACTS.length} artefacts · {SYN.ARTIFACTS.filter(a => a.shared).length} partagés</div>
      </div>
      <div className="rule-mag"></div>

      <div className="lib-toolbar">
        <div className="lib-search">
          <Icon name="search" size={16} color="currentColor" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un artefact…" />
          {q && <button className="clr" onClick={() => setQ("")}><Icon name="x" size={14} color="currentColor" /></button>}
        </div>
        <div className="lib-cats">
          <button className={"lib-cat" + (proj === "all" ? " on" : "")} onClick={() => setProj("all")}>
            <Icon name="layout-grid" size={14} color="currentColor" /> Tous les projets <span className="n">{SYN.ARTIFACTS.length}</span>
          </button>
          {SYN.PROJECTS.map(p => {
            const n = SYN.ARTIFACTS.filter(a => a.project === p.id).length;
            if (!n) return null;
            return (
              <button key={p.id} className={"lib-cat" + (proj === p.id ? " on" : "")} onClick={() => setProj(p.id)}>
                <Icon name={p.emoji} size={14} color="currentColor" /> {p.name} <span className="n">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="artg-kinds">
          {kinds.map(k => (
            <button key={k} className={"seg-btn" + (kind === k ? " on" : "")} onClick={() => setKind(k)}>
              {k === "all" ? "Tous types" : k}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0
        ? <div className="empty"><Icon name="search-x" size={28} color="var(--color-text-muted)" style={{ display: "inline-flex", marginBottom: 10 }} /><div>Aucun artefact ne correspond à ces critères.</div></div>
        : <div className="artg-grid">{list.map(a => <ArtifactCard key={a.id} a={a} onOpen={onOpen} showProject />)}</div>}
    </div>
  );
}

/* Aperçu représentatif selon l'artefact */
function ArtifactPreview({ a }) {
  if (a.id === "a1") {
    const rows = (window.RISK_ROWS || []);
    return (
      <table className="risk-table">
        <thead><tr><th>Constat</th><th>Famille</th><th>Cotation</th><th>Propriétaire</th></tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}><td style={{ fontWeight: 600, color: "var(--color-text)" }}>{r.c}</td><td>{r.fam}</td><td><span className={"cote " + r.lvl}>{r.cote}</span></td><td>{r.owner}</td></tr>
        ))}</tbody>
      </table>
    );
  }
  if (a.id === "a2") {
    const rows = [
      ["Vague 1 — Quick wins", "Revue des comptes à privilèges", "8 j-h", "DSI"],
      ["Vague 1 — Quick wins", "Renforcement politique MDP", "5 j-h", "DSI"],
      ["Vague 2 — Structurant", "Mise en place PRA testé", "30 j-h", "Production"],
      ["Vague 2 — Structurant", "Cloisonnement réseau", "18 j-h", "Réseau"],
      ["Vague 3 — Fond", "Refonte journalisation / SOC", "45 j-h", "SOC"],
    ];
    return (
      <table className="risk-table">
        <thead><tr><th>Vague</th><th>Action</th><th>Charge</th><th>Propriétaire</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><td style={{ fontWeight: 600, color: "var(--color-text)" }}>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
      </table>
    );
  }
  if (a.id === "a6") {
    const rows = [
      ["Portail assurés", "Replatform", "Vague 1"],
      ["Moteur de paie", "Refactor", "Vague 2"],
      ["GED documentaire", "Repurchase", "Vague 1"],
      ["Référentiel agents", "Rehost", "Vague 1"],
      ["Batch historiques", "Retire", "Vague 3"],
    ];
    return (
      <table className="risk-table">
        <thead><tr><th>Application</th><th>Stratégie 6R</th><th>Vague</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><td style={{ fontWeight: 600, color: "var(--color-text)" }}>{r[0]}</td><td><span className="kind-chip k-diag">{r[1]}</span></td><td>{r[2]}</td></tr>)}</tbody>
      </table>
    );
  }
  if (a.id === "a11") {
    const rows = [
      ["Maîtrise SQL & modélisation", "25 %", "≥ 14/20"],
      ["Pipelines & orchestration", "25 %", "≥ 12/20"],
      ["Qualité & gouvernance data", "20 %", "≥ 12/20"],
      ["Cloud & conteneurs", "20 %", "≥ 10/20"],
      ["Communication / restitution", "10 %", "≥ 12/20"],
    ];
    return (
      <table className="risk-table">
        <thead><tr><th>Critère d'évaluation</th><th>Pondération</th><th>Seuil</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><td style={{ fontWeight: 600, color: "var(--color-text)" }}>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
      </table>
    );
  }
  if (a.kind === "Diagramme") {
    const layers = [
      { t: "Présentation", d: "Portails web · applications mobiles · API publiques" },
      { t: "Services métier", d: "Microservices conteneurisés · orchestration · bus d'événements" },
      { t: "Données", d: "Bases relationnelles · data lake · cache distribué" },
      { t: "Sécurité & supervision", d: "IAM · chiffrement · journalisation centralisée · SOC" },
    ];
    return (
      <div className="diag-stack">
        {layers.map((l, i) => (
          <div key={i} className="diag-layer">
            <div className="dl-title">{l.t}</div>
            <div className="dl-desc">{l.d}</div>
          </div>
        ))}
      </div>
    );
  }
  // Document générique
  const bullets = {
    a4: ["Contexte de la mission et périmètre audité", "Avancement : phase terrain clôturée, 12 constats consolidés", "3 points saillants portés à l'arbitrage du COPIL", "Décisions attendues et prochaines étapes datées"],
    a5: ["Volet 1 — Cartographie applicative et dépendances", "Volet 2 — Interfaces et flux de données critiques", "Volet 3 — Plans de continuité et reprise", "15 questions structurées avec objectif par item"],
    a8: ["Gestion des comptes à privilèges et IAM", "Segmentation réseau et durcissement des accès", "Journalisation centralisée et détection SOC", "Sauvegarde, PRA et tests de restauration"],
    a9: ["Surface d'exposition de l'infrastructure d'identité", "Scénarios de menace et vecteurs d'attaque", "Mesures de réduction du risque priorisées", "Indicateurs de suivi et seuils d'alerte"],
    a10: ["8 modules : du SQL avancé au déploiement cloud", "Objectifs pédagogiques et prérequis par module", "Projet fil rouge sur données réelles", "Grille d'évaluation à l'entrée et en sortie"],
  }[a.id] || ["Synthèse structurée produite à partir des éléments du projet", "Recommandations priorisées et exploitables", "Format institutionnel prêt à présenter"];
  return (
    <ul className="doc-bullets">
      {bullets.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  );
}

/* Visionneuse d'artefact (modale) avec partage par lien intégré */
function ArtifactModal({ artifact: a, onClose, toast }) {
  const proj = SYN.PROJECTS.find(p => p.id === a.project);
  const u = SYN.TEAM[a.creator];
  const [shareOpen, setShareOpen] = useState(false);
  const [shared, setShared] = useState(!!a.shared);
  const [scope, setScope] = useState(a.shared ? "link" : "members");
  const link = artifactLink(a);
  const km = KIND_META[a.kind] || KIND_META["Document"];

  const copy = () => { try { navigator.clipboard && navigator.clipboard.writeText(link); } catch (e) {} toast("Lien de l'artefact copié"); };
  const enableLink = () => { setShared(true); setScope("link"); a.shared = true; setShareOpen(true); toast("Lien de partage activé"); };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal art-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className={"mh-ic " + km.cls}><Icon name={a.icon} size={22} color="currentColor" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{a.title}</h2>
            <div className="sub">
              <span className={"kind-chip " + km.cls}>{a.kind}</span> généré par l'IA · {u.name.split(" ")[0]} · {a.when}
            </div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>

        <div className="modal-body art-body">
          {proj && <div className="doc-kick" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span className="ap-ic" style={{ background: proj.color }}><Icon name={proj.emoji} size={11} color="#fff" /></span>{proj.name}
          </div>}
          <h2 className="doc-t" style={{ margin: "8px 0 0" }}>{a.title}</h2>
          <div className="doc-rule"></div>
          <ArtifactPreview a={a} />

          {shareOpen && (
            <div className="share-box">
              <div className="sb-row">
                <Icon name={scope === "link" ? "globe" : "lock"} size={16} color="var(--color-primary)" />
                <div style={{ flex: 1 }}>
                  <div className="sb-t">{scope === "link" ? "Toute personne disposant du lien" : "Membres du projet uniquement"}</div>
                  <div className="sb-d">{scope === "link" ? "Lecture seule, sans authentification — idéal pour partager hors de l'équipe." : "Seuls les membres de « " + (proj?.name || "") + " » peuvent ouvrir cet artefact."}</div>
                </div>
                <select className="role-select" value={scope} onChange={e => { setScope(e.target.value); if (e.target.value === "link") { setShared(true); a.shared = true; } }}>
                  <option value="members">Membres</option>
                  <option value="link">Public (lien)</option>
                </select>
              </div>
              {scope === "link" && (
                <div className="sb-linkrow">
                  <span className="sb-link"><Icon name="link" size={14} color="var(--color-text-muted)" />{link}</span>
                  <button className="btn btn-primary btn-sm" onClick={copy}><Icon name="copy" size={14} /> Copier</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-text-muted)" }}>
            {shared
              ? <><Icon name="globe" size={15} color="var(--color-success)" /> Lien de partage actif</>
              : <><Icon name="lock" size={15} /> Visible par les membres du projet</>}
          </div>
          <button className="btn btn-ghost" onClick={() => toast("Artefact téléchargé")}><Icon name="download" size={15} /> Télécharger</button>
          {shared
            ? <button className="btn btn-ghost" onClick={() => setShareOpen(o => !o)}><Icon name="link" size={15} /> {shareOpen ? "Masquer le lien" : "Gérer le lien"}</button>
            : <button className="btn btn-primary" onClick={enableLink}><Icon name="share-2" size={15} /> Partager par lien</button>}
        </div>
      </div>
    </div>
  );
}

/* Modale de partage seule (déclenchée depuis la visionneuse canvas) */
function ShareArtifactModal({ artifact: a, onClose, toast }) {
  const proj = SYN.PROJECTS.find(p => p.id === a.project) || SYN.PROJECTS[0];
  const [scope, setScope] = useState(a.shared ? "link" : "members");
  const link = artifactLink(a);
  const copy = () => { try { navigator.clipboard && navigator.clipboard.writeText(link); } catch (e) {} toast("Lien de l'artefact copié"); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="mh-ic"><Icon name="share-2" size={22} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>Partager l'artefact</h2>
            <div className="sub">« {a.title} » — choisissez qui peut y accéder.</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div className="share-scope">
            <button className={"scope-opt" + (scope === "members" ? " sel" : "")} onClick={() => setScope("members")}>
              <Icon name="lock" size={18} color="currentColor" />
              <div><div className="so-t">Membres du projet</div><div className="so-d">Réservé à l'équipe de « {proj.name} ».</div></div>
              {scope === "members" && <Icon name="check" size={16} color="var(--color-primary)" />}
            </button>
            <button className={"scope-opt" + (scope === "link" ? " sel" : "")} onClick={() => { setScope("link"); a.shared = true; }}>
              <Icon name="globe" size={18} color="currentColor" />
              <div><div className="so-t">Toute personne avec le lien</div><div className="so-d">Lecture seule, sans authentification.</div></div>
              {scope === "link" && <Icon name="check" size={16} color="var(--color-primary)" />}
            </button>
          </div>
          {scope === "link" && (
            <div className="sb-linkrow" style={{ marginTop: 16 }}>
              <span className="sb-link"><Icon name="link" size={14} color="var(--color-text-muted)" />{link}</span>
              <button className="btn btn-primary btn-sm" onClick={copy}><Icon name="copy" size={14} /> Copier</button>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

/* Modale de visibilité du projet (privé / public workspace) */
function VisibilityModal({ project, onClose, onSet, toast }) {
  const [vis, setVis] = useState(project.public ? "public" : "private");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="mh-ic"><Icon name={project.public ? "globe" : "lock"} size={22} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>Visibilité du projet</h2>
            <div className="sub">« {project.name} » — qui peut accéder à cet espace ?</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div className="share-scope">
            <button className={"scope-opt" + (vis === "private" ? " sel" : "")} onClick={() => setVis("private")}>
              <Icon name="lock" size={18} color="currentColor" />
              <div><div className="so-t">Privé</div><div className="so-d">Accessible uniquement aux membres invités du projet.</div></div>
              {vis === "private" && <Icon name="check" size={16} color="var(--color-primary)" />}
            </button>
            <button className={"scope-opt" + (vis === "public" ? " sel" : "")} onClick={() => setVis("public")}>
              <Icon name="globe" size={18} color="currentColor" />
              <div><div className="so-t">Public dans le workspace</div><div className="so-d">Visible par tous les membres du Groupe Synelia, en lecture. Idéal pour la prise en main et le partage de bonnes pratiques.</div></div>
              {vis === "public" && <Icon name="check" size={16} color="var(--color-primary)" />}
            </button>
          </div>
          {vis === "public" && (
            <div className="viz-note">
              <Icon name="info" size={15} color="var(--color-info)" />
              <span>Les conversations, artefacts et fichiers de ce projet deviendront consultables par l'ensemble du workspace. Les membres invités gardent seuls le droit de contribuer.</span>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={() => { onSet(vis === "public"); }}>
            <Icon name="check" size={16} /> Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

window.ArtifactCard = ArtifactCard;
window.ProjectArtifacts = ProjectArtifacts;
window.ArtifactsView = ArtifactsView;
window.ArtifactModal = ArtifactModal;
window.ShareArtifactModal = ShareArtifactModal;
window.VisibilityModal = VisibilityModal;
