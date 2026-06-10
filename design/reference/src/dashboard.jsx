/* Synelia Cowork — Accueil / tableau de bord du département */

function Dashboard({ onOpenProject, onOpenChat, onNewProject, onInvite }) {
  const me = SYN.ME;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  // conversations récentes — agrégées sur l'ensemble des projets du département
  const recentChats = Object.entries(SYN.CHATS)
    .flatMap(([pid, cs]) => (cs || []).map(c => ({ ...c, pid })))
    .slice(0, 7);

  return (
    <div className="dash">
      <div className="dash-hero">
        <div>
          <div className="dash-kicker">Espace de travail collaboratif</div>
          <h1>{greet}, {me.name.split(" ")[0]}.</h1>
          <div className="greet-sub">Votre équipe travaille sur 3 projets en ce moment.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onInvite}><Icon name="user-plus" size={16} /> Inviter</button>
          <button className="btn btn-primary" onClick={onNewProject}><Icon name="plus" size={16} /> Nouveau projet</button>
        </div>
      </div>
      <div className="rule-mag"></div>

      <div className="dash-grid">
        {/* Colonne gauche : projets + routines */}
        <div>
          <div className="col-title">Projets partagés <span className="n">· {SYN.PROJECTS.length}</span>
            <span className="more" onClick={onNewProject}>Tout voir</span>
          </div>
          <div className="proj-cards">
            {SYN.PROJECTS.map(p => {
              const liveChat = SYN.CHATS[p.id]?.find(c => c.live);
              return (
                <div key={p.id} className="pcard" onClick={() => onOpenProject(p.id)}>
                  {liveChat && <span className="live-tag"><LivePill /></span>}
                  <div className="top">
                    <span className="p-ic" style={{ background: p.color }}><Icon name={p.emoji} size={20} color="#fff" /></span>
                  </div>
                  <h3>{p.name}</h3>
                  <p className="desc">{p.desc}</p>
                  <div className="foot">
                    <span className="stat"><Icon name="message-square" size={14} color="var(--color-text-muted)" /> {p.chats}</span>
                    <span className="stat"><Icon name="paperclip" size={14} color="var(--color-text-muted)" /> {p.files}</span>
                    <span className="members"><AvatarStack ids={p.members} size={24} max={4} /></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-title" style={{ marginTop: 30 }}>Routines actives <span className="n">· 2</span></div>
          <div className="activity-card">
            {SYN.ROUTINES.map(r => (
              <div key={r.id} className="routine-row">
                <span className="r-ic"><Icon name={r.icon} size={17} color="currentColor" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="r-name">{r.title}</div>
                  <div className="r-cad">{r.cadence} · piloté par {SYN.TEAM[r.owner].name.split(" ")[0]}</div>
                </div>
                <div className="r-next">
                  <div className="lbl">Prochaine</div>
                  <div className="val">{r.next}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite : conversations récentes */}
        <div>
          <div className="col-title">Conversations récentes <span className="n">· {recentChats.length}</span></div>
          <div className="activity-card">
            {recentChats.map(c => {
              const proj = SYN.PROJECTS.find(p => p.id === c.pid);
              return (
                <div key={c.id} className="act-item" onClick={() => onOpenChat(c.pid, c.id)}>
                  <span className="cr-ic" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(75,40,130,.08)", color: "var(--color-primary)", display: "grid", placeItems: "center", flex: "none" }}>
                    <Icon name={c.live ? "message-square-dot" : "message-square"} size={16} color="currentColor" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="txt"><b>{c.title}</b></div>
                    <div className="when">
                      {c.live
                        ? <span className="act-live">{c.liveState === "ai-typing" ? "L'IA répond" : SYN.TEAM[c.liveUser].name.split(" ")[0] + " écrit…"}</span>
                        : c.updated}
                      {proj && <span style={{ color: "var(--color-text-muted)" }}> · {proj.name}</span>}
                    </div>
                  </div>
                  <AvatarStack ids={c.participants} size={24} max={3} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;

/* ============================================================
   Routines — interface « tâches » maître-détail
   Liste à gauche (routine sélectionnée en vedette), détail +
   historique d'exécutions à droite.
   ============================================================ */

// rendu markdown léger pour la sortie d'une exécution
function rtMd(text) {
  return text.split("\n\n").map((blk, bi) => {
    const lines = blk.split("\n");
    const isOl = lines.every(l => /^\d+\.\s/.test(l.trim())) && lines.length > 1;
    if (isOl) return <ol key={bi}>{lines.map((l, li) => <li key={li}>{rtInline(l.replace(/^\d+\.\s/, ""))}</li>)}</ol>;
    const isUl = lines.every(l => /^-\s/.test(l.trim())) && lines.length > 1;
    if (isUl) return <ul key={bi}>{lines.map((l, li) => <li key={li}>{rtInline(l.replace(/^-\s/, ""))}</li>)}</ul>;
    return <p key={bi}>{rtInline(blk)}</p>;
  });
}
function rtInline(s) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>);
}

function RoutineStatus({ status, large }) {
  const paused = status === "paused";
  return (
    <span className={"rt-status" + (paused ? " paused" : "") + (large ? " lg" : "")}>
      <Icon name={paused ? "pause-circle" : "circle-dot"} size={large ? 15 : 13} color="currentColor" />
      {paused ? "En pause" : "Active"}
    </span>
  );
}

function RoutinesView({ onOpenProject }) {
  const [selId, setSelId] = useState(SYN.ROUTINES[0].id);
  const [runIdx, setRunIdx] = useState(0);
  const [bump, setBump] = useState(0);

  const sel = selId ? SYN.ROUTINES.find(r => r.id === selId) : null;
  const rest = SYN.ROUTINES.filter(r => r.id !== selId);

  const select = (id) => { setSelId(id); setRunIdx(0); };
  const toggleStatus = (r) => { r.status = r.status === "paused" ? "active" : "paused"; setBump(n => n + 1); };

  return (
    <div className={"tasks-view" + (sel ? " has-sel" : "")}>
      {/* LISTE */}
      <div className="tasks-list">
        <div className="tasks-head">
          <h1>Routines</h1>
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={16} /> Créer une routine</button>
        </div>

        {sel && (
          <button className="rt-card vedette sel" onClick={() => select(sel.id)}>
            <div className="rt-card-top">
              <span className="rt-card-title"><Icon name={sel.icon} size={16} color="var(--color-primary)" /> {sel.title}</span>
              <RoutineStatus status={sel.status} />
            </div>
            <div className="rt-card-run">
              <Icon name="message-square" size={14} color="var(--color-text-muted)" />
              <span className="rt-run-title">{sel.runs[0].title}</span>
              <span className="rt-ago">{sel.ago}{sel.status !== "paused" && <span className="rt-dot"></span>}</span>
            </div>
          </button>
        )}

        <div className="rt-grid">
          {rest.map(r => (
            <button key={r.id} className="rt-card mini" onClick={() => select(r.id)}>
              <div className="rt-card-title"><Icon name={r.icon} size={15} color="var(--color-primary)" /> {r.title}</div>
              <div className="rt-mini-cad">{r.cadence}</div>
              <div className="rt-mini-prompt">{r.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* DÉTAIL */}
      <div className="task-detail">
        {!sel ? (
          <div className="td-empty">
            <Icon name="repeat" size={30} color="var(--color-text-muted)" />
            <div>Sélectionnez une routine pour voir son détail et son historique.</div>
          </div>
        ) : (
          <RoutineDetail
            key={sel.id}
            routine={sel}
            runIdx={runIdx}
            setRunIdx={setRunIdx}
            onToggle={() => toggleStatus(sel)}
            onClose={() => setSelId(null)}
            onOpenProject={onOpenProject}
          />
        )}
      </div>
    </div>
  );
}

function RoutineDetail({ routine: r, runIdx, setRunIdx, onToggle, onClose, onOpenProject }) {
  const runs = r.runs;
  const run = runs[Math.min(runIdx, runs.length - 1)];
  const proj = SYN.PROJECTS.find(p => p.id === r.project);
  const paused = r.status === "paused";

  return (
    <>
      <div className="td-head">
        <h2>{r.title}</h2>
        <div className="td-head-actions">
          <button className="icon-btn" title="Archiver"><Icon name="archive" size={18} color="currentColor" /></button>
          <button className="icon-btn" title="Fermer" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
      </div>

      <div className="td-controls">
        <RoutineStatus status={r.status} large />
        <button className="icon-btn" title="Modifier"><Icon name="pencil" size={16} color="currentColor" /></button>
        <button className="icon-btn" title={paused ? "Reprendre" : "Mettre en pause"} onClick={onToggle}>
          <Icon name={paused ? "play" : "pause"} size={16} color="currentColor" />
        </button>
        <button className="btn btn-ghost btn-sm"><Icon name="play-circle" size={15} /> Tester</button>
        <span className="td-cad" onClick={() => onOpenProject(r.project)}>
          <Icon name="calendar-clock" size={14} color="currentColor" /> {r.cadence}
          {proj && <> · {proj.name}</>}
        </span>
      </div>

      <div className="td-prompt">{r.prompt}</div>

      <div className="td-run">
        <div className="td-run-head">
          <div style={{ minWidth: 0 }}>
            <div className="trh-title">{run.title}</div>
            <div className="trh-meta">{run.date} · exécutée en {run.ranFor}</div>
          </div>
          <div className="trh-nav">
            <button className="icon-btn" disabled={runIdx >= runs.length - 1} onClick={() => setRunIdx(i => Math.min(runs.length - 1, i + 1))} title="Exécution précédente"><Icon name="chevron-left" size={16} color="currentColor" /></button>
            <button className="icon-btn" disabled={runIdx <= 0} onClick={() => setRunIdx(i => Math.max(0, i - 1))} title="Exécution suivante"><Icon name="chevron-right" size={16} color="currentColor" /></button>
            <button className="btn btn-ghost btn-sm" disabled={runIdx === 0} onClick={() => setRunIdx(0)}>Dernier</button>
            <button className="btn btn-ghost btn-sm"><Icon name="message-circle" size={14} /> Discuter</button>
          </div>
        </div>

        <div className="td-run-body">
          <div className="trb-thought"><Icon name="lightbulb" size={14} color="currentColor" /> Réflexion · {run.thought} s</div>
          <div className="trb-md">{rtMd(run.output)}</div>
        </div>
      </div>
    </>
  );
}

window.RoutinesView = RoutinesView;
