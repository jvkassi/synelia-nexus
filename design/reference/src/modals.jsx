/* Synelia Cowork — Modales (nouveau projet, inviter l'équipe, nouvelle conversation) */

function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [invitees, setInvitees] = useState(["kofi", "fatou"]);

  const toggle = id => setInvitees(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="mh-ic"><Icon name="folder-plus" size={22} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>Nouveau projet partagé</h2>
            <div className="sub">Un espace pour vos conversations, fichiers et routines — visible par les membres invités.</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Nom du projet</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ex. Audit SI — Banque Atlantique" autoFocus />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Objet de la mission, périmètre, livrables attendus…" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Inviter des membres du département</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {Object.values(SYN.TEAM).filter(u => !u.you).map(u => (
                <button key={u.id} onClick={() => toggle(u.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", borderRadius: 999, border: "1px solid " + (invitees.includes(u.id) ? "var(--color-primary-mid)" : "var(--color-border-soft)"), background: invitees.includes(u.id) ? "rgba(75,40,130,.06)" : "var(--color-bg)", transition: "all .12s" }}>
                  <Avatar user={u} size={24} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-sub)" }}>{u.name}</span>
                  {invitees.includes(u.id) && <Icon name="check" size={14} color="var(--color-primary)" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" disabled={!name.trim()} style={!name.trim() ? { opacity: .5 } : {}} onClick={() => onCreate({ name, desc, invitees })}>
            <Icon name="check" size={16} /> Créer le projet
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ projectId, onClose, toast }) {
  const p = projectId ? SYN.PROJECTS.find(x => x.id === projectId) : null;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Membre");
  const [pending, setPending] = useState([]);

  const members = p ? p.members : Object.values(SYN.TEAM).map(u => u.id);

  const invite = () => {
    if (!email.includes("@")) return;
    setPending(pl => [...pl, { email, role }]);
    setEmail("");
    toast("Invitation envoyée à " + email);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="mh-ic"><Icon name="user-plus" size={22} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>{p ? "Inviter sur « " + p.name + " »" : "Inviter dans le département"}</h2>
            <div className="sub">Les membres accèdent aux conversations, fichiers et routines, et collaborent en temps réel.</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Inviter par e-mail</label>
            <div className="invite-input-row">
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="prenom.nom@synelia.tech"
                onKeyDown={e => e.key === "Enter" && invite()} />
              <select className="role-select" value={role} onChange={e => setRole(e.target.value)}>
                <option>Membre</option>
                <option>Propriétaire</option>
              </select>
              <button className="btn btn-primary" onClick={invite}>Inviter</button>
            </div>
            <div className="hint">Le rôle <b>Propriétaire</b> peut gérer les membres et supprimer le projet. Les <b>Membres</b> participent à tout le reste.</div>
          </div>

          {pending.length > 0 && (
            <>
              <div className="rp-section-t">Invitations en attente</div>
              {pending.map((pi, i) => (
                <div key={i} className="member-row">
                  <span className="av" style={{ width: 38, height: 38, background: "var(--color-bg-alt)", color: "var(--color-text-muted)" }}><Icon name="mail" size={17} color="currentColor" /></span>
                  <div>
                    <div className="m-name">{pi.email}</div>
                    <div className="m-mail pending">En attente d'acceptation</div>
                  </div>
                  <span className="role-badge member m-role">{pi.role}</span>
                </div>
              ))}
            </>
          )}

          <div className="rp-section-t" style={{ marginTop: 18 }}>{p ? "Membres du projet" : "Membres du département"} · {members.length}</div>
          {members.map(id => {
            const u = SYN.TEAM[id];
            return (
              <div key={id} className="member-row">
                <Avatar user={u} size={38} showOnline />
                <div>
                  <div className="m-name">{u.name} {u.you && <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(vous)</span>}</div>
                  <div className="m-mail">{u.title}</div>
                </div>
                <span className={"role-badge m-role " + (u.role === "Propriétaire" ? "owner" : "member")}>{u.role}</span>
              </div>
            );
          })}
        </div>
        <div className="modal-foot">
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--color-text-muted)" }}>
            <Icon name="link" size={15} /> Lien d'invitation du département
          </div>
          <button className="btn btn-ghost" onClick={() => toast("Lien d'invitation copié")}> <Icon name="copy" size={15} /> Copier le lien</button>
          <button className="btn btn-primary" onClick={onClose}>Terminé</button>
        </div>
      </div>
    </div>
  );
}

function NewChatModal({ projectId, onClose, onCreate }) {
  const p = SYN.PROJECTS.find(x => x.id === projectId);
  const [title, setTitle] = useState("");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="mh-ic"><Icon name="square-pen" size={22} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>Nouvelle conversation</h2>
            <div className="sub">Dans « {p?.name} » · visible et modifiable par les membres du projet.</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Titre de la conversation</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ex. Analyse des écarts PCI-DSS" autoFocus
              onKeyDown={e => e.key === "Enter" && title.trim() && onCreate(title)} />
            <div className="hint">Vous pourrez aussi la renommer plus tard. L'IA aura accès aux fichiers du projet.</div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" disabled={!title.trim()} style={!title.trim() ? { opacity: .5 } : {}} onClick={() => onCreate(title)}><Icon name="arrow-right" size={16} /> Démarrer</button>
        </div>
      </div>
    </div>
  );
}

window.NewProjectModal = NewProjectModal;
window.InviteModal = InviteModal;
window.NewChatModal = NewChatModal;
