/* Synelia Cowork — Admin : Membres & rôles */

function InviteMemberModal({ onClose, onInvite }) {
  const [email, setEmail] = aUseState("");
  const [role, setRole] = aUseState("Membre");
  const valid = /\S+@\S+\.\S+/.test(email);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="mh-ic"><Icon name="user-plus" size={21} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>Inviter dans l'espace</h2>
            <div className="sub">La personne rejoindra la <b>Direction Data &amp; IA</b> avec le rôle choisi.</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={19} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Adresse e-mail</label>
            <div className="invite-input-row">
              <input type="text" placeholder="prenom.nom@synelia.tech" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              <select className="role-select" value={role} onChange={e => setRole(e.target.value)}>
                {ADMIN.ROLE_LIST.filter(r => r !== "Propriétaire").map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="hint">Les invités externes (clients) n'accèdent qu'aux espaces explicitement partagés.</div>
          </div>
          <div className="adm-note">
            <Icon name="shield-check" size={16} className="ic" />
            <div>La double authentification sera exigée à la première connexion, conformément à la politique de l'espace.</div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onInvite(email.trim(), role)}>
            <Icon name="send" size={15} /> Envoyer l'invitation
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminMembers({ toast }) {
  const A = ADMIN;
  const [, bump] = aUseState(0);
  const reflow = () => bump(n => n + 1);
  const [inviteOpen, setInviteOpen] = aUseState(false);

  const setRole = (id, role) => {
    const u = SYN.TEAM[id];
    A.roles[id] = role;
    reflow();
    toast("« " + u.name + " » est désormais " + role);
  };
  const toggleSuspend = (id) => {
    const m = A.meta[id];
    m.status = m.status === "suspendu" ? "actif" : "suspendu";
    reflow();
    const u = SYN.TEAM[id];
    toast(m.status === "suspendu" ? "Compte de « " + u.name + " » suspendu" : "Compte de « " + u.name + " » réactivé");
  };
  const revokeInvite = (idx) => {
    const inv = A.invites[idx];
    A.invites.splice(idx, 1);
    reflow();
    toast("Invitation à « " + inv.email + " » annulée");
  };
  const addInvite = (email, role) => {
    const initials = email.slice(0, 2).toUpperCase();
    A.invites.unshift({ email, role, by: "awa", when: "à l'instant", initials, color: "#6B3FA0" });
    setInviteOpen(false);
    reflow();
    toast("Invitation envoyée à « " + email + " »");
  };

  return (
    <div className="adm-wrap">
      <div className="adm-head">
        <div>
          <div className="adm-kicker">Administration de l'espace</div>
          <h1>Membres &amp; rôles</h1>
          <div className="sub">Gérez les accès, les rôles et le statut des membres de la Direction Data &amp; IA.</div>
        </div>
        <div className="adm-head-actions">
          <div className="seats">
            <span className="lbl"><b>6</b> / {A.seats.total} sièges</span>
            <span className="meter"><i style={{ width: (6 / A.seats.total) * 100 + "%" }}></i></span>
          </div>
          <button className="btn btn-primary" onClick={() => setInviteOpen(true)}><Icon name="user-plus" size={16} /> Inviter</button>
        </div>
      </div>
      <div className="adm-rule"></div>

      {/* Table des membres */}
      <div className="adm-panel" style={{ marginBottom: 22 }}>
        <div className="pn-head"><h3>Membres</h3><div className="pn-right pn-sub">{A.order.length} personnes</div></div>
        <div style={{ padding: "8px 6px 6px" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Rôle dans l'espace</th>
                <th>Projets</th>
                <th>Conso IA · mois</th>
                <th>Dernière activité</th>
                <th>Statut</th>
                <th className="c-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {A.order.map(id => {
                const u = SYN.TEAM[id];
                const m = A.meta[id];
                const role = A.roles[id];
                const isOwner = role === "Propriétaire";
                return (
                  <tr key={id} className={m.status === "suspendu" ? "suspended-row" : ""}>
                    <td>
                      <div className="c-member">
                        <Avatar user={id} size={36} />
                        <div style={{ minWidth: 0 }}>
                          <div className="nm">{u.name}{u.you && <span style={{ color: "var(--color-text-muted)", fontWeight: 500 }}> · vous</span>}</div>
                          <div className="ti">{u.title}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className={"role-sel" + (isOwner ? " owner" : "")}
                        value={role}
                        disabled={isOwner}
                        onChange={e => setRole(id, e.target.value)}
                      >
                        {A.ROLE_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>{m.projects}</td>
                    <td><b style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{m.usage}</b></td>
                    <td>{m.last}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="c-right">
                      <div className="row-actions">
                        <button className="row-act" title="Voir l'activité"><Icon name="history" size={16} color="currentColor" /></button>
                        {!isOwner && (
                          <button
                            className={"row-act" + (m.status !== "suspendu" ? " danger" : "")}
                            title={m.status === "suspendu" ? "Réactiver" : "Suspendre"}
                            onClick={() => toggleSuspend(id)}
                          >
                            <Icon name={m.status === "suspendu" ? "user-check" : "user-x"} size={16} color="currentColor" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations en attente */}
      <div className="adm-panel">
        <div className="pn-head"><h3>Invitations en attente</h3><div className="pn-right pn-sub">{A.invites.length}</div></div>
        <div className="pn-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
          {A.invites.length === 0 && <div className="empty">Aucune invitation en attente.</div>}
          {A.invites.map((inv, i) => (
            <div className="lead-row" key={inv.email}>
              <span className="av" style={{ width: 34, height: 34, background: inv.color, fontSize: 13 }}>{inv.initials}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="lr-name">{inv.email}</div>
                <div className="lr-title">{inv.role} · invité par {SYN.TEAM[inv.by].name.split(" ")[0]} · {inv.when}</div>
              </div>
              <StatusBadge status="attente" />
              <div className="row-actions" style={{ marginLeft: 10 }}>
                <button className="row-act" title="Renvoyer"><Icon name="send" size={15} color="currentColor" /></button>
                <button className="row-act danger" title="Annuler l'invitation" onClick={() => revokeInvite(i)}><Icon name="x" size={16} color="currentColor" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {inviteOpen && <InviteMemberModal onClose={() => setInviteOpen(false)} onInvite={addInvite} />}
    </div>
  );
}

window.AdminMembers = AdminMembers;
