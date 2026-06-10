/* Synelia Cowork — Console d'administration : racine */

const ADMIN_NAV = [
  { id: "overview",   label: "Vue d'ensemble",        icon: "layout-dashboard" },
  { id: "members",    label: "Membres & rôles",       icon: "users" },
  { id: "projects",   label: "Projets & espaces",     icon: "folder-kanban" },
  { id: "usage",      label: "Usage de l'IA",         icon: "activity" },
  { id: "governance", label: "Gouvernance & sécurité", icon: "shield-check" },
];

function AdminSidebar({ view, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="wm">SYNELIA</span><span className="dot"></span>
        <span className="sb-admin-badge"><Icon name="shield" size={10} color="#fff" /> Admin</span>
      </div>

      <div className="sb-dept">
        <span className="d-ic"><Icon name="brain-circuit" size={17} color="#fff" /></span>
        <div style={{ minWidth: 0 }}>
          <div className="d-name">Direction Data &amp; IA</div>
          <div className="d-meta">Groupe Synelia · 6 membres</div>
        </div>
      </div>

      <div className="sb-scroll">
        <a className="sb-back" href="Synelia Cowork.html">
          <Icon name="arrow-left" size={16} /> Retour à l'espace de travail
        </a>

        <div className="sb-section">Administration</div>
        <nav className="sb-nav">
          {ADMIN_NAV.map(n => (
            <button key={n.id} className={"sb-link" + (view === n.id ? " active" : "")} onClick={() => onNav(n.id)}>
              <Icon name={n.icon} size={17} /> {n.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="sb-me">
        <Avatar user="awa" size={34} />
        <div style={{ minWidth: 0 }}>
          <div className="nm">{SYN.ME.name}</div>
          <div className="rl">Propriétaire de l'espace</div>
        </div>
        <span className="role-chip">Owner</span>
      </div>
    </aside>
  );
}

function AdminTopbar({ view }) {
  const cur = ADMIN_NAV.find(n => n.id === view);
  return (
    <div className="topbar">
      <div className="tb-crumb">
        <Icon name="shield" size={15} color="var(--color-text-muted)" />
        <span>Administration</span>
        <Icon name="chevron-right" size={14} color="var(--color-text-muted)" />
        <span className="cur">{cur ? cur.label : ""}</span>
      </div>
      <div className="tb-search">
        <Icon name="search" size={16} color="currentColor" />
        <input placeholder="Rechercher un membre, un projet, un événement…" />
        <span style={{ fontSize: 11, border: "1px solid var(--color-border-soft)", borderRadius: 4, padding: "1px 6px" }}>⌘K</span>
      </div>
      <div className="tb-right">
        <button className="tb-icon" title="Documentation"><Icon name="life-buoy" size={19} color="currentColor" /></button>
        <button className="tb-icon" title="Notifications"><Icon name="bell" size={19} color="currentColor" /><span className="dotn"></span></button>
      </div>
    </div>
  );
}

function AdminApp() {
  const [view, setView] = aUseState("overview");
  const [toastMsg, setToastMsg] = aUseState(null);
  const toastTimer = aUseRef(null);

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  };

  const goto = (v) => { setView(v); document.querySelector(".content")?.scrollTo({ top: 0 }); };

  return (
    <div className="app" style={{ "--sidebar-w": "264px" }}>
      <AdminSidebar view={view} onNav={goto} />
      <div className="main-wrap">
        <AdminTopbar view={view} />
        <div className="content">
          {view === "overview"   && <AdminOverview onGoto={goto} />}
          {view === "members"    && <AdminMembers toast={toast} />}
          {view === "projects"   && <AdminProjects toast={toast} />}
          {view === "usage"      && <AdminUsage toast={toast} />}
          {view === "governance" && <AdminGovernance toast={toast} />}
        </div>
      </div>

      {toastMsg && <div className="toast"><Icon name="check-circle-2" size={17} color="var(--color-success)" /> {toastMsg}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("admin-root")).render(<AdminApp />);
