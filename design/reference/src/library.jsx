/* Synelia Cowork — Bibliothèque de prompts partagée du département */

function LibraryView({ onUsePrompt, onNewPrompt, toast }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const prompts = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SYN.PROMPTS.filter(p => {
      const okCat = cat === "all" || p.cat === cat;
      const okQ = !needle || (p.title + " " + p.desc + " " + p.body).toLowerCase().includes(needle);
      return okCat && okQ;
    });
  }, [cat, q]);

  const pinned = prompts.filter(p => p.pinned);
  const rest = prompts.filter(p => !p.pinned);
  const catLabel = id => SYN.PROMPT_CATS.find(c => c.id === id)?.label || id;

  const copy = (p) => {
    try { navigator.clipboard && navigator.clipboard.writeText(p.body); } catch (e) {}
    toast("Prompt « " + p.title + " » copié");
  };

  const card = (p) => {
    const u = SYN.TEAM[p.author];
    const c = SYN.PROMPT_CATS.find(x => x.id === p.cat);
    return (
      <div key={p.id} className="prompt-card">
        <div className="pc-top">
          <span className="pc-ic"><Icon name={p.icon} size={19} color="currentColor" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pc-title">{p.title}</div>
            <div className="pc-cat"><Icon name={c?.icon || "tag"} size={12} color="currentColor" /> {c?.label}</div>
          </div>
          {p.official && <span className="pc-badge" title="Validé par le département"><Icon name="badge-check" size={13} color="currentColor" /> Officiel</span>}
        </div>
        <p className="pc-desc">{p.desc}</p>
        <div className="pc-body">{p.body}</div>
        <div className="pc-foot">
          <span className="pc-author" title={u.name}>
            <Avatar user={u} size={22} /> {u.name.split(" ")[0]}
          </span>
          <span className="pc-uses"><Icon name="corner-down-right" size={13} color="currentColor" /> {p.uses} utilisations</span>
          <span style={{ flex: 1 }}></span>
          <button className="pc-act ghost" title="Copier le prompt" onClick={() => copy(p)}><Icon name="copy" size={15} color="currentColor" /></button>
          <button className="pc-act use" onClick={() => onUsePrompt(p)}><Icon name="arrow-up-right" size={15} color="currentColor" /> Utiliser</button>
        </div>
      </div>
    );
  };

  return (
    <div className="lib">
      <div className="dash-hero">
        <div>
          <div className="dash-kicker">Bibliothèque de l'équipe</div>
          <h1>Bibliothèque de prompts</h1>
          <div className="greet-sub">Des prompts éprouvés, partagés par la Direction Data &amp; IA — lancez une conversation en un clic.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={onNewPrompt}><Icon name="plus" size={16} /> Nouveau prompt</button>
        </div>
      </div>
      <div className="rule-mag"></div>

      <div className="lib-toolbar">
        <div className="lib-search">
          <Icon name="search" size={16} color="currentColor" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un prompt par titre, mot-clé, intention…" />
          {q && <button className="clr" onClick={() => setQ("")}><Icon name="x" size={14} color="currentColor" /></button>}
        </div>
        <div className="lib-cats">
          {SYN.PROMPT_CATS.map(c => {
            const n = c.id === "all" ? SYN.PROMPTS.length : SYN.PROMPTS.filter(p => p.cat === c.id).length;
            return (
              <button key={c.id} className={"lib-cat" + (cat === c.id ? " on" : "")} onClick={() => setCat(c.id)}>
                <Icon name={c.icon} size={14} color="currentColor" /> {c.label}
                <span className="n">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {prompts.length === 0 && (
        <div className="empty">
          <Icon name="search-x" size={28} color="var(--color-text-muted)" style={{ display: "inline-flex", marginBottom: 10 }} />
          <div>Aucun prompt ne correspond à « {q} »{cat !== "all" && " dans " + catLabel(cat)}.</div>
        </div>
      )}

      {pinned.length > 0 && (
        <>
          <div className="lib-secthead"><Icon name="pin" size={14} color="var(--color-accent)" /> Épinglés par l'équipe</div>
          <div className="prompt-grid">{pinned.map(card)}</div>
        </>
      )}

      {rest.length > 0 && (
        <>
          {pinned.length > 0 && <div className="lib-secthead" style={{ marginTop: 26 }}><Icon name="library" size={14} color="var(--color-primary-mid)" /> {cat === "all" ? "Tous les prompts" : catLabel(cat)}</div>}
          <div className="prompt-grid">{rest.map(card)}</div>
        </>
      )}
    </div>
  );
}

/* Choisir un projet où lancer le prompt */
function UsePromptModal({ prompt, onClose, onLaunch }) {
  const [pid, setPid] = useState(SYN.PROJECTS[0].id);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="mh-ic"><Icon name={prompt.icon} size={22} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>Utiliser ce prompt</h2>
            <div className="sub">« {prompt.title} » — choisissez le projet où démarrer la conversation.</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div className="prompt-preview">{prompt.body}</div>
          <div className="field" style={{ marginBottom: 0, marginTop: 18 }}>
            <label>Lancer dans le projet</label>
            <div className="proj-choose">
              {SYN.PROJECTS.map(p => (
                <button key={p.id} className={"proj-opt" + (pid === p.id ? " sel" : "")} onClick={() => setPid(p.id)}>
                  <span className="p-ic" style={{ background: p.color }}><Icon name={p.emoji} size={16} color="#fff" /></span>
                  <span className="po-name">{p.name}</span>
                  {pid === p.id && <Icon name="check" size={16} color="var(--color-primary)" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={() => onLaunch(pid, prompt.body)}><Icon name="arrow-up-right" size={16} /> Démarrer la conversation</button>
        </div>
      </div>
    </div>
  );
}

/* Contribuer un prompt à la bibliothèque */
const NEW_PROMPT_CATS = () => SYN.PROMPT_CATS.filter(c => c.id !== "all");
function NewPromptModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("audit");
  const [desc, setDesc] = useState("");
  const [body, setBody] = useState("");
  const valid = title.trim() && body.trim();
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="mh-ic"><Icon name="pen-line" size={22} color="currentColor" /></span>
          <div style={{ flex: 1 }}>
            <h2>Nouveau prompt</h2>
            <div className="sub">Partagez un prompt avec la Direction Data &amp; IA. Il sera réutilisable par tous les membres.</div>
          </div>
          <button className="x" onClick={onClose}><Icon name="x" size={18} color="currentColor" /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "flex", gap: 20 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Titre</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ex. Analyse d'écarts ISO 27001" autoFocus />
            </div>
            <div className="field" style={{ width: 200 }}>
              <label>Catégorie</label>
              <select value={cat} onChange={e => setCat(e.target.value)}>
                {NEW_PROMPT_CATS().map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Description courte</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="À quoi sert ce prompt, en une phrase." />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Prompt</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} style={{ minHeight: 120 }} placeholder="Rédigez l'instruction adressée à l'IA. Soyez précis sur le format de sortie attendu." />
            <div className="hint">Astuce : décrivez le livrable attendu (tableau, note, liste priorisée) pour des réponses plus exploitables.</div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" disabled={!valid} style={!valid ? { opacity: .5 } : {}} onClick={() => onCreate({ title, cat, desc, body })}>
            <Icon name="check" size={16} /> Publier dans la bibliothèque
          </button>
        </div>
      </div>
    </div>
  );
}

/* Sélecteur compact de prompts dans le composer (popover) */
function PromptPicker({ onPick, onClose }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [onClose]);

  const needle = q.trim().toLowerCase();
  const list = SYN.PROMPTS.filter(p => !needle || (p.title + " " + p.desc).toLowerCase().includes(needle)).slice(0, 8);

  return (
    <div className="prompt-pop" ref={ref}>
      <div className="pp-head">
        <Icon name="library" size={14} color="var(--color-primary-mid)" />
        <span>Bibliothèque de prompts</span>
      </div>
      <div className="pp-search">
        <Icon name="search" size={14} color="currentColor" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrer…" autoFocus />
      </div>
      <div className="pp-list">
        {list.length === 0 && <div className="pp-empty">Aucun prompt</div>}
        {list.map(p => {
          const c = SYN.PROMPT_CATS.find(x => x.id === p.cat);
          return (
            <button key={p.id} className="pp-item" onClick={() => onPick(p)}>
              <span className="pp-ic"><Icon name={p.icon} size={15} color="currentColor" /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="pp-title">{p.title}</span>
                <span className="pp-cat">{c?.label}</span>
              </span>
              <Icon name="corner-down-left" size={13} color="var(--color-text-muted)" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.LibraryView = LibraryView;
window.UsePromptModal = UsePromptModal;
window.NewPromptModal = NewPromptModal;
window.PromptPicker = PromptPicker;
