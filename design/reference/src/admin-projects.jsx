/* Synelia Cowork — Admin : Projets & espaces */

function AdminProjects({ toast }) {
  const [, bump] = aUseState(0);
  const reflow = () => bump(n => n + 1);
  // état d'archivage local (les projets de SYN n'ont pas ce champ par défaut)
  const archivedRef = aUseRef({});

  const toggleViz = (p) => {
    p.public = !p.public;
    reflow();
    toast(p.public
      ? "« " + p.name + " » est désormais public dans l'espace"
      : "« " + p.name + " » est repassé en privé");
  };
  const toggleArchive = (p) => {
    archivedRef.current[p.id] = !archivedRef.current[p.id];
    reflow();
    toast(archivedRef.current[p.id]
      ? "« " + p.name + " » archivé"
      : "« " + p.name + " » restauré");
  };

  const publicCount = SYN.PROJECTS.filter(p => p.public).length;

  return (
    <div className="adm-wrap">
      <div className="adm-head">
        <div>
          <div className="adm-kicker">Administration de l'espace</div>
          <h1>Projets &amp; espaces</h1>
          <div className="sub">Supervisez la visibilité, l'appartenance et le cycle de vie des projets partagés.</div>
        </div>
      </div>
      <div className="adm-rule"></div>

      <div className="adm-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard icon="folder-kanban" value={SYN.PROJECTS.length} label="Projets" />
        <StatCard icon="globe" value={publicCount} label="Espaces publics" />
        <StatCard icon="files" value={SYN.PROJECTS.reduce((s, p) => s + p.files, 0)} label="Fichiers indexés" />
        <StatCard icon="layout-grid" value={SYN.PROJECTS.reduce((s, p) => s + p.artifacts, 0)} label="Artefacts" />
      </div>

      <div className="adm-note" style={{ marginBottom: 22 }}>
        <Icon name="info" size={16} className="ic" />
        <div>Un <b>espace public</b> est visible et accessible en lecture par tous les membres de la Direction Data &amp; IA — utile pour l'onboarding. Les espaces clients restent privés par défaut.</div>
      </div>

      <div className="adm-panel">
        <div className="pn-head"><h3>Tous les projets</h3><div className="pn-right pn-sub">{SYN.PROJECTS.length} projets</div></div>
        <div>
          {SYN.PROJECTS.map(p => {
            const owner = SYN.TEAM[p.members[0]];
            const archived = archivedRef.current[p.id];
            return (
              <div className={"adm-proj-row" + (archived ? " archived" : "")} key={p.id}>
                <span className="p-ic" style={{ background: p.color }}><Icon name={p.emoji} size={21} color="#fff" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pr-name">
                    {p.name}
                    {archived && <span className="lock-chip"><Icon name="archive" size={11} color="currentColor" /> Archivé</span>}
                  </div>
                  <div className="pr-desc">{p.desc}</div>
                </div>

                <div className="pr-stat" style={{ width: 70 }}>
                  <div className="v">{p.chats}</div>
                  <div className="k">Convers.</div>
                </div>
                <div className="pr-stat" style={{ width: 70 }}>
                  <div className="v">{p.artifacts}</div>
                  <div className="k">Artefacts</div>
                </div>
                <div style={{ width: 96 }}>
                  <AvatarStack ids={p.members} size={28} max={4} />
                </div>

                <button
                  className={"viz-toggle " + (p.public ? "public" : "private")}
                  onClick={() => toggleViz(p)}
                  title="Basculer la visibilité"
                >
                  <Icon name={p.public ? "globe" : "lock"} size={14} color="currentColor" />
                  {p.public ? "Public" : "Privé"}
                </button>

                <div className="row-actions" style={{ width: 72 }}>
                  <button className="row-act" title="Gérer les membres"><Icon name="users" size={16} color="currentColor" /></button>
                  <button
                    className={"row-act" + (!archived ? " danger" : "")}
                    title={archived ? "Restaurer" : "Archiver"}
                    onClick={() => toggleArchive(p)}
                  >
                    <Icon name={archived ? "archive-restore" : "archive"} size={16} color="currentColor" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.AdminProjects = AdminProjects;
