/* ============================================================
   Synelia Cowork — 3 variations du tableau de bord (Accueil)
   Présentées côte à côte sur un canvas comparatif.
   ============================================================ */

/* ---- données dérivées partagées ---- */
const DV = (() => {
  const me = SYN.ME;
  const projects = SYN.PROJECTS;
  const chats = (SYN.CHATS.coris || []).map(c => ({ ...c }));
  const liveChats = chats.filter(c => c.live);
  const recentChats = chats.slice(0, 6);
  const routines = SYN.ROUTINES;
  const activeRoutines = routines.filter(r => r.status !== "paused");
  const activity = SYN.ACTIVITY;
  const progress = { coris: 42, cnps: 60, oneci: 30, academy: 75 };
  return { me, projects, chats, liveChats, recentChats, routines, activeRoutines, activity, progress };
})();

function liveLabel(c) {
  return c.liveState === "ai-typing"
    ? "L'IA répond en direct"
    : SYN.TEAM[c.liveUser].name.split(" ")[0] + " est en train d'écrire";
}
function projOf(id) { return SYN.PROJECTS.find(p => p.id === id); }

/* ---- barre supérieure partagée (réutilise .topbar / .tb-*) ---- */
function DVTopbar({ crumb = "Accueil" }) {
  return (
    <div className="topbar">
      <div className="tb-crumb">
        <Icon name="brain-circuit" size={15} color="var(--color-text-muted)" />
        <span>Data &amp; IA</span>
        <Icon name="chevron-right" size={14} color="var(--color-text-muted)" />
        <span className="cur">{crumb}</span>
      </div>
      <div className="tb-search">
        <Icon name="search" size={16} color="currentColor" />
        <input placeholder="Rechercher un projet, une conversation, un fichier…" readOnly />
        <span style={{ fontSize: 11, border: "1px solid var(--color-border-soft)", borderRadius: 4, padding: "1px 6px" }}>⌘K</span>
      </div>
      <div className="tb-right">
        <button className="tb-icon" title="Inviter"><Icon name="user-plus" size={19} color="currentColor" /></button>
        <button className="tb-icon" title="Notifications"><Icon name="bell" size={19} color="currentColor" /><span className="dotn"></span></button>
      </div>
    </div>
  );
}

/* ============================================================
   VARIANTE A — « En direct »
   Pilotée par le temps réel : ce qui se passe maintenant en tête,
   projets en liste compacte, flux d'activité de l'équipe à droite.
   ============================================================ */
function DashboardA() {
  return (
    <div className="dv-frame">
      <DVTopbar />
      <div className="dv-body va">
        <div className="va-hero">
          <div>
            <div className="dv-eyebrow">Espace de travail collaboratif</div>
            <h1>Bon après-midi, Awa.</h1>
            <div className="greet-sub">2 conversations sont en cours en direct dans votre équipe.</div>
          </div>
          <div className="va-actions">
            <button className="btn btn-ghost"><Icon name="user-plus" size={16} /> Inviter</button>
            <button className="btn btn-primary"><Icon name="plus" size={16} /> Nouveau projet</button>
          </div>
        </div>

        <div className="col-title">En cours <span className="n">· en direct</span><span className="more">Tout l'historique</span></div>
        <div className="va-live-row">
          {DV.liveChats.map(c => {
            const p = projOf(c.project);
            return (
              <div key={c.id} className="va-lcard">
                <div className="va-lcard-top">
                  <span className="va-proj-chip"><span className="dot" style={{ background: p.color }}></span>{p.name}</span>
                  <span style={{ marginLeft: "auto" }}><LivePill /></span>
                </div>
                <h3>{c.title}</h3>
                <div className="va-lstate">
                  <span className="typing"><i></i><i></i><i></i></span>
                  {liveLabel(c)}
                </div>
                <div className="va-lcard-foot">
                  <AvatarStack ids={c.participants} size={26} max={4} />
                  <button className="btn btn-accent btn-sm"><Icon name="arrow-right" size={15} /> Rejoindre</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="va-grid">
          <div>
            <div className="col-title">Projets partagés <span className="n">· {DV.projects.length}</span><span className="more">Tout voir</span></div>
            <div className="va-plist">
              {DV.projects.map(p => {
                const isLive = (SYN.CHATS[p.id] || []).some(c => c.live);
                return (
                  <div key={p.id} className="va-prow">
                    <span className="p-ic" style={{ background: p.color }}><Icon name={p.emoji} size={19} color="#fff" /></span>
                    <div className="p-main">
                      <div className="p-name">{p.name}{isLive && <span className="live-dot" title="Activité en direct"></span>}</div>
                      <div className="p-desc">{p.desc}</div>
                    </div>
                    <div className="p-stats">
                      <span className="p-stat"><Icon name="message-square" size={14} color="var(--color-text-muted)" /> {p.chats}</span>
                      <span className="p-stat"><Icon name="paperclip" size={14} color="var(--color-text-muted)" /> {p.files}</span>
                    </div>
                    <AvatarStack ids={p.members} size={24} max={4} />
                  </div>
                );
              })}
            </div>

            <div className="col-title mt">Routines actives <span className="n">· {DV.activeRoutines.length}</span></div>
            <div className="va-routines">
              {DV.activeRoutines.slice(0, 4).map(r => (
                <div key={r.id} className="va-rt">
                  <span className="r-ic"><Icon name={r.icon} size={16} color="currentColor" /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="r-name">{r.title}</div>
                    <div className="r-cad">{r.cadence} · prochaine {r.next}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="col-title">Activité de l'équipe</div>
            <div className="activity-card">
              {DV.activity.map(a => {
                const u = SYN.TEAM[a.user];
                return (
                  <div key={a.id} className="dv-act">
                    <span className="ai-ic" style={{ background: u.color }}><span style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12 }}>{u.initials}</span></span>
                    <div className="ai-tx">
                      <b>{u.name.split(" ")[0]}</b> {a.verb} <b>{a.target}</b>
                      <div className="ai-when">
                        {a.live ? <span className="act-live">{a.when}</span> : a.when}
                        <span style={{ color: "var(--color-text-muted)" }}> · {a.project}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VARIANTE B — « Briefing du jour »
   Éditoriale et institutionnelle : un digest de ce qui requiert
   l'attention, projets en liste sobre, indicateurs à droite.
   ============================================================ */
const VB_ATTN = [
  { icon: "shield-alert", tag: "Critique", tone: "error",
    txt: "Deux constats critiques restent ouverts à porter au COPIL de vendredi.",
    proj: "Audit SI — Coris Bank", via: "routine Suivi des constats ouverts" },
  { icon: "cloud", tag: "Bloqué", tone: "warning",
    txt: "La bascule du module cotisations est bloquée par la dépendance à l'annuaire legacy.",
    proj: "Migration Cloud — CNPS", via: "synthèse d'avancement S23" },
  { icon: "users", tag: "À planifier", tone: "info",
    txt: "Sept entretiens techniques Data Engineering sont à programmer cette semaine.",
    proj: "Open Digital Academy", via: "revue des candidatures" },
];
const VB_TONE = {
  error:   { bg: "var(--bg-error)",   fg: "var(--color-error)",   border: "var(--color-error)" },
  warning: { bg: "var(--bg-warning)", fg: "#9A6A00",              border: "var(--color-warning)" },
  info:    { bg: "var(--bg-info)",    fg: "var(--color-info)",    border: "var(--color-info)" },
};

function DashboardB() {
  return (
    <div className="dv-frame">
      <DVTopbar />
      <div className="dv-body vb">
        <div className="vb-head">
          <div className="dv-eyebrow">Lundi 9 juin 2026 · Direction Data &amp; IA</div>
          <h1>Bonjour, Awa.</h1>
          <div className="rule-mag"></div>
        </div>

        <div className="vb-grid">
          <div className="vb-main">
            <div className="col-title">Ce qui requiert votre attention</div>
            <div className="vb-attn">
              {VB_ATTN.map((it, i) => {
                const t = VB_TONE[it.tone];
                return (
                  <div key={i} className="vb-item" style={{ borderLeftColor: t.border }}>
                    <span className="vb-ic" style={{ background: t.bg, color: t.fg }}><Icon name={it.icon} size={18} color="currentColor" /></span>
                    <div className="vb-body">
                      <span className="vb-tag" style={{ background: t.bg, color: t.fg }}>{it.tag}</span>
                      <p className="vb-txt">{it.txt}</p>
                      <div className="vb-meta"><b>{it.proj}</b> · {it.via}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ alignSelf: "center", flex: "none" }}>Ouvrir</button>
                  </div>
                );
              })}
            </div>

            <div className="col-title mt">Vos projets <span className="n">· {DV.projects.length}</span><span className="more">Tout voir</span></div>
            <div className="vb-projlist">
              {DV.projects.map(p => (
                <div key={p.id} className="vb-prow">
                  <span className="p-ic" style={{ background: p.color }}><Icon name={p.emoji} size={16} color="#fff" /></span>
                  <span className="p-name">{p.name}</span>
                  <AvatarStack ids={p.members} size={22} max={4} />
                  <span className="p-upd">Maj. {p.updated}</span>
                  <Icon name="chevron-right" size={16} color="var(--color-text-muted)" />
                </div>
              ))}
            </div>
          </div>

          <aside className="vb-side">
            <div className="col-title">Le département en bref</div>
            <div className="vb-stats">
              <div className="vb-stat"><span className="lbl">Projets actifs</span><span className="val">{DV.projects.length}</span></div>
              <div className="vb-stat"><span className="lbl">Conversations en direct</span><span className="val mag">{DV.liveChats.length}</span></div>
              <div className="vb-stat"><span className="lbl">Routines actives</span><span className="val">{DV.activeRoutines.length}</span></div>
              <div className="vb-stat"><span className="lbl">Artefacts produits</span><span className="val">{SYN.ARTIFACTS.length}</span></div>
            </div>

            <div className="col-title mt">Routines à venir</div>
            <div className="vb-mini">
              {DV.activeRoutines.slice(0, 3).map(r => (
                <div key={r.id} className="vb-mrow">
                  <span className="m-ic"><Icon name={r.icon} size={15} color="currentColor" /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="m-name">{r.title}</div>
                    <div className="m-sub">{r.cadence}</div>
                  </div>
                  <span className="m-when">{r.next}</span>
                </div>
              ))}
            </div>

            <div className="col-title mt">Conversations récentes</div>
            <div className="vb-mini">
              {DV.recentChats.slice(0, 3).map(c => (
                <div key={c.id} className="vb-mrow">
                  <span className="m-ic" style={{ background: "rgba(75,40,130,.08)", color: "var(--color-primary)" }}><Icon name={c.live ? "message-square-dot" : "message-square"} size={15} color="currentColor" /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="m-name">{c.title}</div>
                    <div className="m-sub">{c.live ? liveLabel(c) : "Maj. " + c.updated}</div>
                  </div>
                  <AvatarStack ids={c.participants} size={22} max={2} />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VARIANTE C — « Tableau »
   Orientée action : lanceur de conversation en tête, projets en
   grandes tuiles avec avancement, routines + direct en bas.
   ============================================================ */
function DashboardC() {
  return (
    <div className="dv-frame">
      <DVTopbar />
      <div className="dv-body vc">
        <div className="vc-launch">
          <span className="l-spark"><Icon name="sparkles" size={20} color="currentColor" /></span>
          <input placeholder="Démarrer une conversation avec l'IA…" readOnly />
          <span className="vc-chip"><span className="dot" style={{ background: "#4B2882" }}></span>Audit SI — Coris Bank<Icon name="chevron-down" size={14} color="currentColor" /></span>
          <button className="btn btn-primary"><Icon name="arrow-up" size={16} /> Lancer</button>
        </div>

        <div className="col-title">Projets partagés <span className="n">· {DV.projects.length}</span><span className="more">Nouveau projet</span></div>
        <div className="vc-board">
          {DV.projects.map(p => {
            const isLive = (SYN.CHATS[p.id] || []).some(c => c.live);
            const pct = DV.progress[p.id] ?? 0;
            return (
              <div key={p.id} className="vc-tile">
                <div className="t-bar" style={{ background: p.color }}></div>
                <div className="t-body">
                  <div className="t-head">
                    <span className="t-ic" style={{ background: p.color }}><Icon name={p.emoji} size={19} color="#fff" /></span>
                    <span className="t-name">{p.name}</span>
                    {isLive && <LivePill />}
                  </div>
                  <p className="t-desc">{p.desc}</p>
                  <div className="vc-prog">
                    <span className="lbl">Avancement</span>
                    <span className="bar"><span className="fill" style={{ width: pct + "%", background: p.color }}></span></span>
                    <span className="pct">{pct}%</span>
                  </div>
                  <div className="t-foot">
                    <span className="t-stat"><Icon name="message-square" size={14} color="var(--color-text-muted)" /> {p.chats}</span>
                    <span className="t-stat"><Icon name="paperclip" size={14} color="var(--color-text-muted)" /> {p.files}</span>
                    <span className="t-stat"><Icon name="layout-grid" size={14} color="var(--color-text-muted)" /> {p.artifacts}</span>
                    <span className="t-members"><AvatarStack ids={p.members} size={24} max={4} /></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="vc-bottom">
          <div>
            <div className="col-title">Routines actives <span className="n">· {DV.activeRoutines.length}</span></div>
            <div className="vc-mini-card">
              {DV.activeRoutines.slice(0, 3).map(r => (
                <div key={r.id} className="vc-mini-row">
                  <span className="mr-ic" style={{ background: "var(--bg-info)", color: "var(--color-info)" }}><Icon name={r.icon} size={16} color="currentColor" /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="mr-name">{r.title}</div>
                    <div className="mr-sub">{r.cadence}</div>
                  </div>
                  <span className="mr-tail" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--color-primary)" }}>{r.next}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="col-title">En direct <span className="n">· {DV.liveChats.length}</span></div>
            <div className="vc-mini-card">
              {DV.liveChats.map(c => {
                const p = projOf(c.project);
                return (
                  <div key={c.id} className="vc-mini-row">
                    <span className="mr-ic" style={{ background: "rgba(192,41,122,.1)", color: "var(--color-accent)" }}><Icon name="message-square-dot" size={16} color="currentColor" /></span>
                    <div style={{ minWidth: 0 }}>
                      <div className="mr-name">{c.title}</div>
                      <div className="mr-sub">{liveLabel(c)} · {p.name}</div>
                    </div>
                    <span className="mr-tail"><AvatarStack ids={c.participants} size={22} max={3} /></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- montage sur le canvas comparatif ---- */
function DashboardVariations() {
  const W = 1320, H = 940;
  return (
    <DesignCanvas>
      <DCSection id="dash" title="Tableau de bord — Accueil" subtitle="3 directions · Synelia Cowork">
        <DCArtboard id="a" label="A · En direct (temps réel)" width={W} height={H}><DashboardA /></DCArtboard>
        <DCArtboard id="b" label="B · Briefing du jour (éditorial)" width={W} height={H}><DashboardB /></DCArtboard>
        <DCArtboard id="c" label="C · Tableau (board + lanceur)" width={W} height={H}><DashboardC /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DashboardVariations />);
