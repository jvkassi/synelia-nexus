/* Synelia Cowork — Admin : Vue d'ensemble */

function AdminOverview({ onGoto }) {
  const [period, setPeriod] = aUseState(30); // 7 | 30 | 60
  const A = ADMIN;

  const series = period === 7 ? A.daily.slice(-7) : period === 60 ? A.daily : A.last30;
  const periodTotal = A.sum(series);

  // membres les plus actifs (par conso IA du mois)
  const topMembers = [...A.order]
    .map(id => ({ id, usage: A.meta[id].usage }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 5);
  const topMax = topMembers[0].usage;

  // répartition par projet
  const projRows = SYN.PROJECTS.map(p => ({
    label: p.name, ic: p.emoji, color: p.color, v: A.usageByProject[p.id] || 0,
  })).sort((a, b) => b.v - a.v);

  const activeRoutines = SYN.ROUTINES.filter(r => r.status !== "paused").length;

  return (
    <div className="adm-wrap">
      <div className="adm-head">
        <div>
          <div className="adm-kicker">Administration de l'espace</div>
          <h1>Vue d'ensemble</h1>
          <div className="sub">État de l'espace <b>Direction Data &amp; IA</b> — activité, membres et consommation de l'assistant IA.</div>
        </div>
        <div className="adm-head-actions">
          <button className="btn btn-ghost" onClick={() => onGoto("governance")}><Icon name="download" size={16} /> Exporter le rapport</button>
          <button className="btn btn-primary" onClick={() => onGoto("members")}><Icon name="user-plus" size={16} /> Inviter</button>
        </div>
      </div>
      <div className="adm-rule"></div>

      {/* KPIs */}
      <div className="adm-stats">
        <StatCard icon="users" value="6" label="Membres actifs" delta="+1 ce mois" deltaDir="up" />
        <StatCard icon="armchair" value={"6 / " + A.seats.total} label="Sièges occupés" meter={Math.round((6 / A.seats.total) * 100)} />
        <StatCard icon="message-square" value={A.total30.toLocaleString("fr-FR")} label="Messages IA · 30 j" delta={(A.delta30 >= 0 ? "+" : "") + A.delta30 + "%"} deltaDir={A.delta30 >= 0 ? "up" : "down"} />
        <StatCard icon="layout-grid" value="11" label="Artefacts produits" delta="+4 cette semaine" deltaDir="up" />
        <StatCard icon="repeat" value={activeRoutines + " / " + SYN.ROUTINES.length} label="Routines actives" delta="1 en pause" deltaDir="flat" />
      </div>

      {/* Chart + colonne latérale */}
      <div className="adm-cols">
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="adm-panel">
            <div className="pn-head">
              <div>
                <h3>Consommation de l'assistant IA</h3>
                <div className="pn-sub">{periodTotal.toLocaleString("fr-FR")} messages sur la période</div>
              </div>
              <div className="pn-right">
                <div className="adm-seg">
                  {[[7, "7 j"], [30, "30 j"], [60, "60 j"]].map(([v, l]) => (
                    <button key={v} className={period === v ? "on" : ""} onClick={() => setPeriod(v)}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pn-body">
              <BarChart data={series} />
            </div>
          </div>

          <div className="adm-panel">
            <div className="pn-head"><h3>Répartition par projet</h3><div className="pn-right pn-sub">Messages · 30 jours</div></div>
            <div className="pn-body">
              <HBars rows={projRows} />
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="adm-panel">
            <div className="pn-head"><h3>Membres les plus actifs</h3></div>
            <div className="pn-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
              {topMembers.map((m, i) => {
                const u = SYN.TEAM[m.id];
                return (
                  <div className="lead-row" key={m.id}>
                    <span className="lr-rank">{i + 1}</span>
                    <Avatar user={m.id} size={34} />
                    <div style={{ minWidth: 0 }}>
                      <div className="lr-name">{u.name}</div>
                      <div className="lr-title">{u.title}</div>
                    </div>
                    <div className="lr-val">{m.usage} <span>msg</span></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="adm-panel">
            <div className="pn-head">
              <h3>Activité récente</h3>
              <div className="pn-right"><button className="row-act" onClick={() => onGoto("governance")} title="Voir le journal complet"><Icon name="arrow-right" size={16} color="currentColor" /></button></div>
            </div>
            <div className="pn-body audit-feed-compact" style={{ paddingTop: 4, paddingBottom: 8 }}>
              {ADMIN.audit.slice(0, 5).map(e => <AuditRow key={e.id} e={e} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.AdminOverview = AdminOverview;
