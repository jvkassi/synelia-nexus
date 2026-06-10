/* Synelia Cowork — Sidebar (3 variantes : Projets · Récents · Clair) */

// Regroupe une conversation par ancienneté à partir de son libellé relatif.
function recentBucket(u) {
  if (/maintenant|min|^il y a \d+\s*h|^il y a 1\s*h/.test(u)) return "Aujourd'hui";
  if (/hier|il y a 1\s*j|il y a 2\s*j/.test(u)) return "Cette semaine";
  return "Plus tôt";
}

function SbBrand() {
  return (
    <div className="sb-brand">
      <span className="wm">SYNELIA</span><span className="dot"></span>
      <span className="sub">Cowork</span>
    </div>
  );
}

function SbDept({ onNav }) {
  return (
    <div className="sb-dept" onClick={() => onNav("home")}>
      <span className="d-ic"><Icon name="brain-circuit" size={17} color="#fff" /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="d-name">Direction Data &amp; IA</div>
        <div className="d-meta">Groupe Synelia · 6 membres</div>
      </div>
      <Icon name="chevrons-up-down" size={15} color="currentColor" className="d-chev" />
    </div>
  );
}

function SbSearch({ q, setQ }) {
  return (
    <div className="sb-search">
      <Icon name="search" size={15} color="currentColor" />
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…" />
      {q && <button className="sb-search-x" onClick={() => setQ("")}><Icon name="x" size={14} color="currentColor" /></button>}
    </div>
  );
}

function SbNav({ view, onNav, onOpenLibrary, onOpenArtifacts, onOpenRoutines }) {
  return (
    <nav className="sb-nav">
      <button className={"sb-link" + (view === "home" ? " active" : "")} onClick={() => onNav("home")}>
        <Icon name="layout-dashboard" size={17} color="currentColor" /> Accueil
      </button>
      <button className={"sb-link" + (view === "library" ? " active" : "")} onClick={onOpenLibrary}>
        <Icon name="library" size={17} color="currentColor" /> Bibliothèque de prompts
      </button>
      <button className={"sb-link" + (view === "artifacts" ? " active" : "")} onClick={onOpenArtifacts}>
        <Icon name="layout-grid" size={17} color="currentColor" /> Artefacts
      </button>
      <button className={"sb-link" + (view === "routines" ? " active" : "")} onClick={onOpenRoutines}>
        <Icon name="repeat" size={17} color="currentColor" /> Routines
        <span className="badge-n">{SYN.ROUTINES.length}</span>
      </button>
    </nav>
  );
}

function SbProjectItem({ p, active, onOpen }) {
  const hasLive = SYN.CHATS[p.id]?.some(c => c.live);
  return (
    <button className={"sb-proj" + (active ? " active" : "")} onClick={() => onOpen(p.id)}>
      <span className="p-ic" style={{ background: p.color }}><Icon name={p.emoji} size={15} color="#fff" /></span>
      <span className="p-name">{p.name}</span>
      {p.public && <Icon name="globe" size={13} color="currentColor" className="p-pub" />}
      {hasLive && <span className="p-live" title="Activité en direct"></span>}
    </button>
  );
}

function SbRecentItem({ c, active, onOpen }) {
  return (
    <button className={"sb-recent" + (active ? " active" : "") + (c.live ? " live" : "")} onClick={() => onOpen(c.pid, c.id)} title={c.title}>
      <span className="rc-dot" style={{ background: c.pcolor }}></span>
      <span className="rc-title">{c.title}</span>
      {c.live
        ? <span className="rc-live" title="En direct"></span>
        : c.pinned && <Icon name="pin" size={12} color="currentColor" className="rc-pin" />}
    </button>
  );
}

function SbMe({ onSettings }) {
  return (
    <div className="sb-me">
      <Avatar user="awa" size={34} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="nm">{SYN.ME.name}</div>
        <div className="rl">{SYN.ME.role}</div>
      </div>
      <button className="gear" onClick={onSettings} title="Paramètres"><Icon name="settings" size={17} color="currentColor" /></button>
      <button className="gear logout" onClick={() => { window.location.href = "Synelia Cowork - Connexion.html"; }} title="Se déconnecter"><Icon name="log-out" size={17} color="currentColor" /></button>
    </div>
  );
}

function Sidebar({
  open, view, variant = "projects", activeProject, activeChat,
  onNav, onOpenLibrary, onOpenArtifacts, onOpenRoutines,
  onOpenProject, onOpenChat, onNewProject, onSettings,
}) {
  const projects = SYN.PROJECTS;
  const [q, setQ] = useState("");
  const [projOpen, setProjOpen] = useState(true);

  // Conversations récentes, tous projets confondus.
  const recents = useMemo(() => {
    const arr = [];
    projects.forEach(p => (SYN.CHATS[p.id] || []).forEach(c =>
      arr.push({ ...c, pid: p.id, pname: p.name, pcolor: p.color, pemoji: p.emoji })));
    return arr;
  }, []);

  const ql = q.trim().toLowerCase();
  const fProjects = ql ? projects.filter(p => p.name.toLowerCase().includes(ql)) : projects;
  const fRecents = ql ? recents.filter(c => c.title.toLowerCase().includes(ql)) : recents;

  const conversationFirst = variant === "recents" || variant === "light";
  const theme = variant === "light" ? " theme-light" : "";

  // Récents groupés par ancienneté (variantes conversation-first).
  const grouped = useMemo(() => {
    const order = ["Aujourd'hui", "Cette semaine", "Plus tôt"];
    const m = {};
    fRecents.forEach(c => { const b = recentBucket(c.updated); (m[b] = m[b] || []).push(c); });
    return order.filter(k => m[k]).map(k => [k, m[k]]);
  }, [ql]);

  return (
    <aside className={"sidebar sb-v-" + variant + theme + (open ? " open" : "")}>
      <SbBrand />
      <SbDept onNav={onNav} />

      <div className="sb-scroll">
        <button className={"sb-newbtn" + (conversationFirst ? " accent" : "")} onClick={onNewProject}>
          <Icon name="plus" size={17} color="currentColor" /> Nouveau projet
        </button>

        <SbSearch q={q} setQ={setQ} />

        {/* ===================== VARIANTE PROJETS (project-first) ===================== */}
        {variant === "projects" && (
          <>
            <SbNav view={view} onNav={onNav} onOpenLibrary={onOpenLibrary} onOpenArtifacts={onOpenArtifacts} onOpenRoutines={onOpenRoutines} />

            <div className="sb-section">
              Projets partagés
              <button className="add" onClick={onNewProject} title="Nouveau projet"><Icon name="plus" size={14} color="currentColor" /></button>
            </div>
            <div className="sb-group">
              {fProjects.map(p => <SbProjectItem key={p.id} p={p} active={activeProject === p.id && view === "project"} onOpen={onOpenProject} />)}
              {fProjects.length === 0 && <div className="sb-empty">Aucun projet.</div>}
            </div>

            {fRecents.length > 0 && (
              <>
                <div className="sb-section">Conversations récentes</div>
                <div className="sb-group">
                  {fRecents.slice(0, 5).map(c => <SbRecentItem key={c.id} c={c} active={activeChat === c.id} onOpen={onOpenChat} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* ============ VARIANTES RÉCENTS & CLAIR (conversation-first) ============ */}
        {conversationFirst && (
          <>
            <SbNav view={view} onNav={onNav} onOpenLibrary={onOpenLibrary} onOpenArtifacts={onOpenArtifacts} onOpenRoutines={onOpenRoutines} />

            {grouped.map(([label, list]) => (
              <div key={label}>
                <div className="sb-section">{label}</div>
                <div className="sb-group">
                  {list.map(c => <SbRecentItem key={c.id} c={c} active={activeChat === c.id} onOpen={onOpenChat} />)}
                </div>
              </div>
            ))}
            {fRecents.length === 0 && <div className="sb-empty">Aucune conversation.</div>}

            {/* Projets repliables, en retrait */}
            <button className="sb-collap" onClick={() => setProjOpen(o => !o)}>
              <Icon name={projOpen ? "chevron-down" : "chevron-right"} size={15} color="currentColor" />
              Projets partagés
              <span className="sb-collap-n">{fProjects.length}</span>
            </button>
            {projOpen && (
              <div className="sb-group">
                {fProjects.map(p => <SbProjectItem key={p.id} p={p} active={activeProject === p.id && view === "project"} onOpen={onOpenProject} />)}
              </div>
            )}
          </>
        )}
      </div>

      <SbMe onSettings={onSettings} />
    </aside>
  );
}

window.Sidebar = Sidebar;
