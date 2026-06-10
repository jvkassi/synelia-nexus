/* Synelia Cowork — Admin : Gouvernance & sécurité */

const POLICY_ICON = {
  sso: "key-round", twofa: "shield-check", residency: "map-pin",
  training: "brain-circuit", extShare: "link", dlp: "scan-search",
};

function AdminGovernance({ toast }) {
  const A = ADMIN;
  const [, bump] = aUseState(0);
  const reflow = () => bump(n => n + 1);
  const [retention, setRetention] = aUseState(A.retention);
  const [filter, setFilter] = aUseState("all");

  const togglePolicy = (key, val) => {
    A.policies[key].on = val;
    reflow();
    const p = A.policies[key];
    toast((val ? "Activé : " : "Désactivé : ") + p.label);
  };

  const kinds = [
    { id: "all", label: "Tout" },
    { id: "auth", label: "Connexions" },
    { id: "member", label: "Membres" },
    { id: "governance", label: "Gouvernance" },
    { id: "data", label: "Données" },
  ];
  const log = filter === "all" ? A.audit : A.audit.filter(e => e.kind === filter);

  return (
    <div className="adm-wrap">
      <div className="adm-head">
        <div>
          <div className="adm-kicker">Administration de l'espace</div>
          <h1>Gouvernance &amp; sécurité</h1>
          <div className="sub">Politiques d'accès, résidence et rétention des données, et journal d'audit complet — conformément aux exigences de nos clients bancaires et publics.</div>
        </div>
        <div className="adm-head-actions">
          <button className="btn btn-ghost" onClick={() => toast("Journal d'audit exporté · audit-2026-06.csv")}><Icon name="download" size={16} /> Exporter le journal</button>
        </div>
      </div>
      <div className="adm-rule"></div>

      <div className="adm-cols">
        {/* Colonne gauche : politiques + rétention */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="adm-panel">
            <div className="pn-head"><h3>Politiques d'accès &amp; de sécurité</h3></div>
            <div className="pn-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {Object.entries(A.policies).map(([key, p]) => (
                <div className="policy-row" key={key}>
                  <span className="pl-ic"><Icon name={POLICY_ICON[key] || "shield"} size={18} color="currentColor" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pl-name">
                      {p.label}
                      {p.locked && <span className="lock-chip"><Icon name="lock" size={10} color="currentColor" /> Imposé</span>}
                    </div>
                    <div className="pl-desc">{p.desc}</div>
                  </div>
                  <div className="pl-sw">
                    <Switch on={p.on} accent={key === "twofa" || key === "dlp"} locked={p.locked} onChange={v => togglePolicy(key, v)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-panel">
            <div className="pn-head"><h3>Rétention des données</h3></div>
            <div className="pn-body">
              <div style={{ fontSize: 13, color: "var(--color-text-sub)", lineHeight: 1.6, marginBottom: 14 }}>
                Durée de conservation des conversations et artefacts avant suppression automatique. Les exports clients ne sont pas affectés.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["3 mois", "6 mois", "12 mois", "24 mois", "Illimité"].map(opt => (
                  <button
                    key={opt}
                    className={"lib-cat" + (retention === opt ? " on" : "")}
                    onClick={() => { setRetention(opt); toast("Rétention des données fixée à " + opt); }}
                  >
                    {retention === opt && <Icon name="check" size={13} color="currentColor" />}
                    {opt}
                  </button>
                ))}
              </div>
              <div className="adm-note" style={{ marginTop: 16 }}>
                <Icon name="map-pin" size={16} className="ic" />
                <div>Données hébergées sur le <b>cloud souverain ivoirien</b>. Résidence garantie en Côte d'Ivoire.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite : posture de sécurité */}
        <div className="adm-panel" style={{ alignSelf: "start" }}>
          <div className="pn-head"><h3>Posture de sécurité</h3></div>
          <div className="pn-body">
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
              <div style={{ position: "relative", width: 76, height: 76, flex: "none" }}>
                <svg viewBox="0 0 36 36" width="76" height="76">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-bg-alt)" strokeWidth="3.4" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-success)" strokeWidth="3.4"
                    strokeDasharray={`${0.86 * 2 * Math.PI * 15.5} ${2 * Math.PI * 15.5}`} strokeLinecap="round"
                    transform="rotate(-90 18 18)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-text)" }}>86</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>Bonne posture</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>4 politiques sur 6 actives</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--color-bg-alt)", margin: "16px 0", paddingTop: 4 }}>
              {[
                { ok: A.policies.twofa.on, label: "Double authentification" },
                { ok: A.policies.sso.on, label: "SSO entreprise" },
                { ok: A.policies.residency.on, label: "Résidence des données (CI)" },
                { ok: A.policies.dlp.on, label: "Détection de données sensibles" },
                { ok: !A.policies.extShare.on, label: "Partage externe restreint" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 12.5, color: "var(--color-text-sub)" }}>
                  <Icon name={c.ok ? "check-circle-2" : "alert-circle"} size={16} color={c.ok ? "var(--color-success)" : "var(--color-warning)"} />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Journal d'audit complet */}
      <div className="adm-panel" style={{ marginTop: 22 }}>
        <div className="pn-head">
          <h3>Journal d'audit</h3>
          <div className="pn-right">
            <div className="adm-seg">
              {kinds.map(k => (
                <button key={k.id} className={filter === k.id ? "on" : ""} onClick={() => setFilter(k.id)}>{k.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="pn-body" style={{ paddingTop: 6, paddingBottom: 8 }}>
          {log.length === 0 && <div className="empty">Aucun événement pour ce filtre.</div>}
          {log.map(e => <AuditRow key={e.id} e={e} />)}
        </div>
      </div>
    </div>
  );
}

window.AdminGovernance = AdminGovernance;
