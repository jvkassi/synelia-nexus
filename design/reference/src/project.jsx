/* Synelia Cowork — Vue projet (composeur + conversations + panneaux latéraux) */

const PROJ_SUGGESTS = [
  { icon: "layout-grid", text: "Consolide les constats en matrice de risques" },
  { icon: "list-checks", text: "Génère un plan de remédiation priorisé" },
  { icon: "file-text", text: "Rédige une note de synthèse pour le COPIL" },
];

function ProjectView({ projectId, onOpenChat, onStartConversation, toast }) {
  const p = SYN.PROJECTS.find(x => x.id === projectId);
  const chats = SYN.CHATS[projectId] || [];
  const routines = SYN.ROUTINES.filter(r => r.project === projectId);
  const owner = SYN.TEAM[p.members.find(id => SYN.TEAM[id]?.role === "Propriétaire") || p.members[0]];
  const [draft, setDraft] = useState("");

  const submit = (text) => {
    const v = (text ?? draft).trim();
    if (!v) return;
    onStartConversation(projectId, v);
  };

  return (
    <div className="content">
      <div className="proj-detail">
        {/* ---------- Colonne principale ---------- */}
        <div className="pd-main">
          <header className="pd-head">
            <span className="pd-ic" style={{ background: p.color }}>
              <Icon name={p.emoji} size={24} color="#fff" />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1>{p.name}</h1>
              <p className="pd-meta">
                Créé par {owner.name} <span className="dot">·</span> Mis à jour {p.updated}
                <span className="dot">·</span>
                <span className="pd-viz">
                  <Icon name={p.public ? "globe" : "lock"} size={12} color="currentColor" />
                  {p.public ? "Espace public" : "Espace privé"}
                </span>
              </p>
            </div>
            <AvatarStack ids={p.members} size={30} max={5} />
          </header>

          {/* Composeur de tâche */}
          <div className="pd-composer">
            <textarea
              rows={1}
              value={draft}
              onChange={e => { setDraft(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(220, e.target.scrollHeight) + "px"; }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder="Démarrer une tâche dans ce projet…"
              autoFocus
            />
            <div className="pd-cbar">
              <button className="c-tool" title="Joindre un fichier" onClick={() => toast("Joindre un fichier à la tâche")}>
                <Icon name="plus" size={18} color="currentColor" />
              </button>
              <button className="c-tool lbl" title="Connaissances du projet" onClick={() => toast("Base de connaissances du projet")}>
                <Icon name="folder" size={15} color="currentColor" /> Connaissances
              </button>
              <button className="c-tool lbl" title="Connecteurs" onClick={() => toast("Connecteurs du projet")}>
                <Icon name="plug" size={15} color="currentColor" /> Connecteurs
              </button>
              <div className="pd-cbar-right">
                <button className="c-tool" title="Dicter" onClick={() => toast("Dictée vocale")}>
                  <Icon name="mic" size={17} color="currentColor" />
                </button>
                <button className="pd-send" disabled={!draft.trim()} onClick={() => submit()} title="Lancer la tâche">
                  <Icon name="arrow-up" size={18} color="#fff" />
                </button>
              </div>
            </div>
          </div>

          <div className="pd-suggests">
            {PROJ_SUGGESTS.map((s, i) => (
              <button key={i} className="suggest-chip" onClick={() => submit(s.text)}>
                <Icon name={s.icon} size={15} color="currentColor" /> {s.text}
              </button>
            ))}
          </div>

          {/* Conversations du projet */}
          <section className="pd-section">
            <div className="pd-section-h">
              <h2>Conversations</h2>
              <span className="n">{chats.length}</span>
            </div>
            <p className="pd-section-sub">Les conversations restent dans ce projet et sont visibles par ses membres.</p>

            <div className="pd-list">
              {chats.map(c => (
                <button key={c.id} className={"task-row" + (c.live ? " live" : "")} onClick={() => onOpenChat(projectId, c.id)}>
                  <span className="tr-ic"><Icon name={c.live ? "message-square-dot" : "message-square"} size={17} color="currentColor" /></span>
                  <span className="tr-title">
                    {c.pinned && <Icon name="pin" size={12} color="var(--color-accent)" />}
                    {c.title}
                  </span>
                  <span className="tr-right">
                    {c.live ? (
                      <span className="live-mini">
                        {c.liveState === "ai-typing"
                          ? <><Icon name="sparkles" size={12} color="currentColor" /> L'IA répond</>
                          : <><span className="dots"><i></i><i></i><i></i></span> {SYN.TEAM[c.liveUser].name.split(" ")[0]} écrit</>}
                      </span>
                    ) : (
                      <span className="tr-when">{c.updated}</span>
                    )}
                    <AvatarStack ids={c.participants} size={22} max={3} />
                  </span>
                </button>
              ))}
              {chats.length === 0 && (
                <div className="pd-empty">Aucune conversation pour l'instant. Démarrez une tâche ci-dessus.</div>
              )}
            </div>
          </section>
        </div>

        {/* ---------- Panneaux latéraux ---------- */}
        <aside className="pd-rail">
          <RailCard
            icon="sliders-horizontal" title="Instructions"
            desc="Guidez la façon dont l'IA répond pour toutes les tâches de ce projet."
          >
            <button className="rail-add" onClick={() => toast("Ajouter des instructions au projet")}>
              <Icon name="plus" size={15} color="currentColor" /> Ajouter des instructions
            </button>
            <div className="rail-inline">
              <span className="ri-left"><Icon name="plug" size={16} color="var(--color-primary)" /> Connecteurs</span>
              <button className="ri-add" onClick={() => toast("Connecter un service")}>
                <Icon name="plus" size={14} color="currentColor" /> Ajouter
              </button>
            </div>
          </RailCard>

          <RailCard
            icon="folder" title="Fichiers"
            desc="Documents de référence partagés par toutes les tâches."
            illus="files"
            count={p.files}
          >
            <button className="rail-add" onClick={() => toast("Téléverser un fichier dans le projet")}>
              <Icon name="upload" size={15} color="currentColor" /> Téléverser
            </button>
          </RailCard>

          <RailCard
            icon="puzzle" title="Compétences"
            desc="Réutilisez des workflows récurrents dans vos tâches."
            illus="skills"
          >
            <button className="rail-add" onClick={() => toast("Ajouter une compétence depuis la bibliothèque")}>
              <Icon name="plus" size={15} color="currentColor" /> Ajouter
            </button>
          </RailCard>

          <RailCard
            icon="calendar-clock" title="Tâches planifiées"
            desc="Exécutez des tâches à heure fixe dans ce projet."
            illus="schedule"
          >
            {routines.map(r => (
              <div key={r.id} className="rail-routine">
                <span className="rr-ic"><Icon name={r.icon} size={15} color="currentColor" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rr-name">{r.title}</div>
                  <div className="rr-cad">{r.cadence}</div>
                </div>
                <span className={"rr-dot " + r.status} title={r.status === "active" ? "Active" : "En pause"}></span>
              </div>
            ))}
            <button className="rail-add" onClick={() => toast("Planifier une nouvelle tâche")}>
              <Icon name="plus" size={15} color="currentColor" /> Planifier une tâche
            </button>
          </RailCard>
        </aside>
      </div>
    </div>
  );
}

function RailCard({ icon, title, desc, children, illus, count }) {
  return (
    <div className="rail-card">
      <div className="rail-h">
        <Icon name={icon} size={17} color="var(--color-primary)" />
        <h3>{title}</h3>
        {count != null && <span className="rail-count">{count}</span>}
        <Icon name="chevron-right" size={16} color="var(--color-text-muted)" />
      </div>
      <p className="rail-desc">{desc}</p>
      {children}
    </div>
  );
}

window.ProjectView = ProjectView;
