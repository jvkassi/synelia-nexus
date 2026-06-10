/* Synelia Cowork — Admin : composants partagés (chart, switch, audit, helpers) */

const { useState: aUseState, useEffect: aUseEffect, useMemo: aUseMemo, useRef: aUseRef } = React;

// ---- Carte KPI ----
function StatCard({ icon, value, label, delta, deltaDir, meter }) {
  return (
    <div className="stat-card">
      <div className="s-ic"><Icon name={icon} size={19} color="currentColor" /></div>
      <div className="s-val">{value}</div>
      <div className="s-lbl">{label}</div>
      {delta != null && (
        <div className={"s-delta " + (deltaDir || "flat")}>
          {deltaDir === "up" && <Icon name="trending-up" size={13} color="currentColor" />}
          {deltaDir === "down" && <Icon name="trending-down" size={13} color="currentColor" />}
          {delta}
        </div>
      )}
      {meter != null && <div className="s-meter"><i style={{ width: meter + "%" }}></i></div>}
    </div>
  );
}

// ---- Bar chart (séries journalières) ----
function BarChart({ data, max }) {
  const mx = max || Math.max(...data.map(d => d.v));
  return (
    <>
      <div className="chart">
        {data.map((d, i) => (
          <div
            key={i}
            className={"bar" + (d.weekend ? " wk" : "")}
            style={{ height: Math.max(4, (d.v / mx) * 100) + "%" }}
          >
            <span className="tip">{d.v} messages · {d.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-axis">
        <span>{data[0].label}</span>
        <span>{data[Math.floor(data.length / 2)].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
      <div className="chart-legend">
        <span className="lg"><span className="sw" style={{ background: "var(--color-primary)" }}></span> Jours ouvrés</span>
        <span className="lg"><span className="sw" style={{ background: "rgba(75,40,130,.22)" }}></span> Week-end</span>
      </div>
    </>
  );
}

// ---- Barres horizontales ----
function HBars({ rows, max }) {
  const mx = max || Math.max(...rows.map(r => r.v));
  return (
    <div>
      {rows.map((r, i) => (
        <div className="hbar-row" key={i}>
          <span className="hb-lbl">
            {r.ic && <span className="p-ic" style={{ background: r.color }}><Icon name={r.ic} size={13} color="#fff" /></span>}
            {r.avatar && <Avatar user={r.avatar} size={24} />}
            <span className="nm">{r.label}</span>
          </span>
          <span className="hbar-track"><i style={{ width: Math.max(3, (r.v / mx) * 100) + "%", background: r.color || "var(--color-primary)" }}></i></span>
          <span className="hb-val">{r.display || r.v}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Toggle switch ----
function Switch({ on, onChange, accent, locked }) {
  return (
    <button
      className={"switch" + (on ? " on" : "") + (accent ? " accent" : "") + (locked ? " locked" : "")}
      onClick={() => !locked && onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label="Activer/désactiver"
      disabled={locked}
    ></button>
  );
}

// ---- Ligne du journal d'audit ----
const AUDIT_ICON = { auth: "log-in", member: "user-cog", project: "folder-cog", governance: "shield-check", data: "database", routine: "repeat" };
function AuditRow({ e }) {
  const u = SYN.TEAM[e.actor];
  return (
    <div className="audit-row">
      <span className={"au-ic " + e.kind}><Icon name={AUDIT_ICON[e.kind] || "activity"} size={16} color="currentColor" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="au-txt"><b>{u.name}</b> {e.action} <span className="tgt">{e.target}</span></div>
        <div className="au-meta">
          <span>{e.when}</span>
          <span>·</span>
          <span>{e.ip}</span>
          {e.warn && <><span>·</span><span className="warn"><Icon name="alert-triangle" size={11} color="currentColor" /> à surveiller</span></>}
        </div>
      </div>
    </div>
  );
}

// ---- Badge de statut ----
function StatusBadge({ status }) {
  const map = { actif: "Actif", suspendu: "Suspendu", attente: "Invitation envoyée" };
  return <span className={"st-badge " + status}><span className="d"></span>{map[status] || status}</span>;
}

window.StatCard = StatCard;
window.BarChart = BarChart;
window.HBars = HBars;
window.Switch = Switch;
window.AuditRow = AuditRow;
window.StatusBadge = StatusBadge;
