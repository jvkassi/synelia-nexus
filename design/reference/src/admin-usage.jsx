/* Synelia Cowork — Admin : Usage IA (consommation & quotas) */

function AdminUsage({ toast }) {
  const A = ADMIN;
  const [, bump] = aUseState(0);
  const [quota, setQuota] = aUseState(800); // plafond mensuel par membre (messages)

  // par membre
  const memberRows = [...A.order]
    .map(id => ({ id, usage: A.meta[id].usage, name: SYN.TEAM[id].name, color: SYN.TEAM[id].color }))
    .sort((a, b) => b.usage - a.usage);
  const memberMax = memberRows[0].usage;
  const totalMonth = memberRows.reduce((s, r) => s + r.usage, 0);

  // par projet
  const projRows = SYN.PROJECTS.map(p => ({
    label: p.name, ic: p.emoji, color: p.color, v: A.usageByProject[p.id] || 0,
  })).sort((a, b) => b.v - a.v);
  const projMax = Math.max(...projRows.map(r => r.v));

  const near = memberRows.filter(r => r.usage / quota >= 0.6);

  return (
    <div className="adm-wrap">
      <div className="adm-head">
        <div>
          <div className="adm-kicker">Administration de l'espace</div>
          <h1>Usage de l'IA</h1>
          <div className="sub">Consommation de l'assistant, répartition par membre et par projet, et plafonds mensuels.</div>
        </div>
        <div className="adm-head-actions">
          <button className="btn btn-ghost" onClick={() => toast("Export CSV de la consommation généré")}><Icon name="download" size={16} /> Exporter (CSV)</button>
        </div>
      </div>
      <div className="adm-rule"></div>

      <div className="adm-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard icon="message-square" value={totalMonth.toLocaleString("fr-FR")} label="Messages IA · ce mois" delta="+18% vs mois préc." deltaDir="up" />
        <StatCard icon="layout-grid" value="34" label="Artefacts générés · mois" delta="+9" deltaDir="up" />
        <StatCard icon="repeat" value="11" label="Exécutions de routines" delta="planifiées" deltaDir="flat" />
        <StatCard icon="gauge" value={Math.round((memberMax / quota) * 100) + "%"} label="Membre le plus proche du plafond" />
      </div>

      <div className="adm-cols">
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Conso par membre vs quota */}
          <div className="adm-panel">
            <div className="pn-head">
              <div>
                <h3>Consommation par membre</h3>
                <div className="pn-sub">Plafond mensuel : {quota} messages / membre</div>
              </div>
            </div>
            <div className="pn-body">
              {memberRows.map(r => {
                const pct = Math.min(100, (r.usage / quota) * 100);
                const over = r.usage / quota >= 0.85;
                const warn = r.usage / quota >= 0.6 && !over;
                const col = over ? "var(--color-error)" : warn ? "var(--color-warning)" : "var(--color-primary)";
                return (
                  <div className="hbar-row" key={r.id} style={{ gridTemplateColumns: "170px 1fr 92px" }}>
                    <span className="hb-lbl">
                      <Avatar user={r.id} size={26} />
                      <span className="nm">{r.name}</span>
                    </span>
                    <span className="hbar-track"><i style={{ width: pct + "%", background: col }}></i></span>
                    <span className="hb-val">{r.usage} <span style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>/ {quota}</span></span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="adm-panel">
            <div className="pn-head"><h3>Consommation par projet</h3><div className="pn-right pn-sub">Messages · ce mois</div></div>
            <div className="pn-body">
              <HBars rows={projRows} max={projMax} />
            </div>
          </div>
        </div>

        {/* Colonne droite : quotas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="adm-panel">
            <div className="pn-head"><h3>Plafond mensuel par membre</h3></div>
            <div className="pn-body">
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--color-primary)", lineHeight: 1 }}>
                {quota}<span style={{ fontSize: 14, color: "var(--color-text-muted)", fontWeight: 500 }}> messages</span>
              </div>
              <input
                type="range" min="300" max="1500" step="50" value={quota}
                onChange={e => setQuota(Number(e.target.value))}
                style={{ width: "100%", margin: "18px 0 6px", accentColor: "var(--color-primary)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-muted)" }}>
                <span>300</span><span>1500</span>
              </div>
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary btn-sm" onClick={() => toast("Plafond fixé à " + quota + " messages / membre / mois")}>
                  <Icon name="check" size={15} /> Appliquer le plafond
                </button>
              </div>
            </div>
          </div>

          <div className="adm-panel">
            <div className="pn-head"><h3>Proches du plafond</h3><div className="pn-right pn-sub">{near.length}</div></div>
            <div className="pn-body" style={{ paddingTop: 6, paddingBottom: 8 }}>
              {near.length === 0 && <div className="empty" style={{ padding: "18px 0" }}>Aucun membre proche du plafond.</div>}
              {near.map(r => {
                const pct = Math.round((r.usage / quota) * 100);
                const over = pct >= 85;
                return (
                  <div className="lead-row" key={r.id}>
                    <Avatar user={r.id} size={32} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="lr-name">{SYN.TEAM[r.id].name}</div>
                      <div className="lr-title">{r.usage} / {quota} messages</div>
                    </div>
                    <span className={"st-badge " + (over ? "suspendu" : "attente")}><span className="d"></span>{pct}%</span>
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

window.AdminUsage = AdminUsage;
