/* Synelia Cowork — Espace de conversation collaboratif (temps réel) */

// rendu texte enrichi : **gras**, listes numérotées, paragraphes
function renderRich(text) {
  const blocks = text.split("\n\n");
  return blocks.map((blk, bi) => {
    const lines = blk.split("\n");
    const isOl = lines.every(l => /^\d+\.\s/.test(l.trim())) && lines.length > 1;
    if (isOl) {
      return <ol key={bi}>{lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}</ol>;
    }
    return <p key={bi}>{inline(blk)}</p>;
  });
}
function inline(s) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => p.startsWith("**") && p.endsWith("**")
    ? <strong key={i}>{p.slice(2, -2)}</strong>
    : <React.Fragment key={i}>{p}</React.Fragment>);
}

function ChatWorkspace({ projectId, chatId, layout, initialPrompt, onBack, toast }) {
  const project = SYN.PROJECTS.find(p => p.id === projectId);
  const chat = SYN.CHATS[projectId]?.find(c => c.id === chatId);
  const isSynthese = chatId === "c-synthese";
  const isEntretiens = chatId === "c-entretiens";

  const [messages, setMessages] = useState(() => isSynthese ? SYN.THREAD_SYNTHESE.map(m => ({ ...m })) : []);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamAuthor, setStreamAuthor] = useState("ai");
  const [riskRows, setRiskRows] = useState(null);     // null = pas d'artefact en cours
  const [ghost, setGhost] = useState(null);           // { user, text } coéquipier en train d'écrire
  const [copresent, setCopresent] = useState(chat?.live ? chat.liveUser : null);
  const [following, setFollowing] = useState(false);
  const [openArt, setOpenArt] = useState(null);       // artefact ouvert dans la visionneuse
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [shareArt, setShareArt] = useState(null);
  const [asideOpen, setAsideOpen] = useState(false);  // panneau latéral en tiroir (mobile)

  const threadRef = useRef(null);
  const timers = useRef([]);
  const cancelStream = useRef(false);

  const liveArtifact = SYN.ARTIFACTS.find(a => a.id === "a1");

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  const scrollDown = useCallback(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // ---- moteur de streaming de l'IA ----
  const streamAssistant = useCallback((fullText, opts = {}) => {
    const { author = "ai", withArtifact = false, onDone } = opts;
    cancelStream.current = false;
    setStreaming(true);
    setThinking(true);
    setStreamAuthor(author);
    setStreamText("");
    if (withArtifact) { setRiskRows(0); setOpenArt(liveArtifact); }

    const words = fullText.split(" ");
    after(650, () => {
      setThinking(false);
      let i = 0;
      const total = words.length;
      const step = () => {
        if (cancelStream.current) return;
        i++;
        setStreamText(words.slice(0, i).join(" "));
        if (withArtifact) {
          const ratio = i / total;
          setRiskRows(Math.min(SYN.RISK_ROWS.length, Math.floor(ratio * (SYN.RISK_ROWS.length + 1))));
        }
        scrollDown();
        if (i < total) {
          after(28 + Math.random() * 45, step);
        } else {
          if (withArtifact) setRiskRows(SYN.RISK_ROWS.length);
          setStreaming(false);
          setMessages(m => [...m, { id: "s" + Date.now(), author, role: author === "ai" ? "assistant" : "user", at: nowTime(), text: fullText, artifact: withArtifact ? liveArtifact : null }]);
          setStreamText("");
          onDone && onDone();
        }
      };
      step();
    });
  }, [liveArtifact, scrollDown]);

  // ---- scénario temps réel à l'ouverture ----
  useEffect(() => {
    clearTimers();
    cancelStream.current = true;
    setStreaming(false); setStreamText(""); setGhost(null); setThinking(false);

    if (isSynthese) {
      // Kofi vient d'envoyer m3 ; l'IA répond EN DIRECT, on arrive pendant la réponse
      setMessages(SYN.THREAD_SYNTHESE.map(m => ({ ...m })));
      setCopresent("kofi");
      after(900, () => streamAssistant(SYN.LIVE_AI_REPLY, { withArtifact: true }));
    } else if (isEntretiens) {
      // Fatou est en train d'écrire en direct
      setMessages([
        { id: "e1", author: "awa", role: "user", at: "09:40", text: "On démarre les entretiens DSI cet après-midi. Il nous faut une trame solide." },
        { id: "e2", author: "ai", role: "assistant", at: "09:41", text: "Bien sûr. Pour cadrer la trame, sur quels périmètres voulez-vous insister : gouvernance, exploitation, sécurité, ou couverture applicative ?" },
      ]);
      setCopresent("fatou");
      // frappe fantôme progressive de Fatou
      const ghostFull = "Concentre-toi sur la couverture applicative et les dépendances critiques. Prépare 15 questions.";
      let gi = 0;
      setGhost({ user: "fatou", text: "" });
      const typeGhost = () => {
        gi += 2;
        setGhost({ user: "fatou", text: ghostFull.slice(0, gi) });
        scrollDown();
        if (gi < ghostFull.length) after(55, typeGhost);
        else after(900, () => {
          setGhost(null);
          setMessages(m => [...m, { id: "e3", author: "fatou", role: "user", at: nowTime(), text: ghostFull }]);
          after(500, () => streamAssistant("Parfait. Voici 15 questions structurées autour de la couverture applicative et des dépendances critiques, regroupées en 3 volets : cartographie des applications, interfaces et flux de données, puis plans de continuité. Je les ai ajoutées dans le panneau Artefacts.", { author: "ai" }));
        });
      };
      after(1200, typeGhost);
    } else {
      setMessages([]);
      setCopresent(null);
      if (initialPrompt) {
        setMessages([{ id: "ip" + Date.now(), author: "awa", role: "user", at: nowTime(), text: initialPrompt }]);
        after(450, () => streamAssistant(genReply(initialPrompt), { author: "ai" }));
      }
    }
    return clearTimers;
    // eslint-disable-next-line
  }, [chatId]);

  // ---- envoi d'un message (avec steering pendant le stream) ----
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");

    if (streaming) {
      // STEERING : on interrompt l'IA en cours
      cancelStream.current = true;
      clearTimers();
      const partial = streamText;
      setStreaming(false);
      setMessages(m => [
        ...m,
        ...(partial ? [{ id: "p" + Date.now(), author: streamAuthor, role: "assistant", at: nowTime(), text: partial, interrupted: true, artifact: riskRows ? liveArtifact : null }] : []),
        { id: "u" + Date.now(), author: "awa", role: "user", at: nowTime(), text, steer: true },
      ]);
      setStreamText("");
      after(400, () => streamAssistant("Bien noté, j'intègre votre orientation. " + steerReply(text), { author: "ai" }));
      toast("Vous avez orienté la réponse de l'IA en direct");
      return;
    }

    setMessages(m => [...m, { id: "u" + Date.now(), author: "awa", role: "user", at: nowTime(), text }]);
    after(400, () => streamAssistant(genReply(text), { author: "ai" }));
  };

  useEffect(() => { scrollDown(); }, [messages.length, ghost, thinking, scrollDown]);

  // disposition : canvas = visionneuse toujours visible ; sinon panneau droit (ou visionneuse si ouverte)
  const showViewer = layout === "canvas" || (!!openArt && layout !== "wide");
  const inlineArtifacts = layout === "wide";

  return (
    <div className="chat-main">
      <div className="chat-col" style={{ "--read-w": layout === "wide" ? "960px" : layout === "canvas" ? "640px" : "760px" }}>
        {/* en-tête */}
        <div className="chat-head">
          <button className="back" onClick={onBack} title="Retour"><Icon name="arrow-left" size={18} color="currentColor" /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ch-title">{chat?.title || "Nouvelle conversation"}</div>
            <div className="ch-sub">
              <Icon name={project.emoji} size={12} color="var(--color-text-muted)" /> {project.name}
              <span>·</span><span>{(chat?.participants || project.members).length} participants</span>
            </div>
          </div>
          <div className="ch-right">
            <AvatarStack ids={chat?.participants || project.members} size={28} max={4} />
            <button className="tb-icon" title="Inviter à la conversation"><Icon name="user-plus" size={17} color="currentColor" /></button>
            <button className="tb-icon" title="Options"><Icon name="more-horizontal" size={17} color="currentColor" /></button>
            {!inlineArtifacts && (
              <button className="tb-icon ch-panel-btn" onClick={() => setAsideOpen(true)} title="Panneau latéral" aria-label="Ouvrir le panneau">
                <Icon name={showViewer ? "panel-right" : "layout-grid"} size={18} color="currentColor" />
              </button>
            )}
          </div>
        </div>

        {/* bandeau co-présence temps réel */}
        {copresent && (
          <div className="copresence">
            <Avatar user={copresent} size={24} showOnline />
            <span>
              <span className="who">{SYN.TEAM[copresent].name}</span>
              {chat?.liveState === "user-typing" || ghost ? " est en train d'écrire dans cette conversation" :
                streaming ? " et vous suivez la réponse de l'IA en direct" : " est dans cette conversation"}
            </span>
            <button className={"follow" + (following ? " on" : "")} onClick={() => { setFollowing(f => !f); }}>
              <Icon name={following ? "eye" : "eye"} size={14} color="currentColor" /> {following ? "Vous suivez" : "Suivre la vue"}
            </button>
          </div>
        )}

        {/* fil de discussion */}
        <div className="thread" ref={threadRef}>
          <div className="thread-inner">
            {messages.length === 0 && !streaming && !thinking && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <span style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-primary)", display: "inline-grid", placeItems: "center", marginBottom: 16, boxShadow: "var(--shadow-md)" }}>
                  <Icon name="sparkles" size={26} color="#fff" />
                </span>
                <h2 style={{ marginBottom: 6 }}>Démarrez la conversation</h2>
                <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, maxWidth: 420, margin: "0 auto" }}>
                  Posez une question à l'IA. Vos coéquipiers verront la réponse se construire en temps réel et pourront l'orienter avec vous.
                </p>
              </div>
            )}

            {messages.map(m => <Message key={m.id} m={m} inlineArtifacts={inlineArtifacts} onOpenArt={setOpenArt} />)}

            {/* message IA en cours de streaming */}
            {(streaming || thinking) && streamAuthor === "ai" && (
              <div className="msg assistant streaming">
                <span className="m-avatar"><Icon name="sparkles" size={18} color="#fff" /></span>
                <div className="m-body">
                  <div className="m-head">
                    <span className="m-name">Assistant Synelia</span>
                    <span className="m-role">IA</span>
                    {copresent && <span className="m-at" style={{ color: "var(--color-accent)" }}>· répond à {SYN.TEAM[copresent].name.split(" ")[0]} et vous</span>}
                  </div>
                  {thinking
                    ? <div className="thinking"><span className="dots"><i></i><i></i><i></i></span> L'IA réfléchit…</div>
                    : <div className="m-text">{renderRich(streamText)}<span className="caret"></span></div>}
                  {streaming && riskRows != null && inlineArtifacts && (
                    <div className="art-inline" onClick={() => setOpenArt(liveArtifact)}>
                      <div className="ai-top"><span className="ai-ic"><Icon name="layout-grid" size={18} color="currentColor" /></span>
                        <div><div className="ai-name">{liveArtifact.title}</div><div className="ai-kind">Document · en cours de rédaction</div></div>
                        <span className="ai-open"><LivePill /></span></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* frappe fantôme d'un coéquipier */}
            {ghost && (
              <div className="ghost-typing">
                <Avatar user={ghost.user} size={34} />
                <div style={{ flex: 1 }}>
                  <div className="m-head"><span className="m-name">{SYN.TEAM[ghost.user].name}</span><span className="m-role">écrit…</span></div>
                  <div className="ghost-bubble">
                    {ghost.text}<span className="caret"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* composer */}
        <div className="composer-wrap">
          <div className="composer-inner">
            {streaming && (
              <div className="steer-hint">
                <Icon name="git-fork" size={14} color="currentColor" />
                L'IA répond en direct — écrivez pour <strong>orienter sa réponse</strong> avec votre équipe.
              </div>
            )}
            <div className="composer">
              <textarea
                rows={1}
                value={draft}
                onChange={e => { setDraft(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(160, e.target.scrollHeight) + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={streaming ? "Orientez la réponse de l'IA…" : "Écrivez à l'IA — votre équipe voit la conversation en direct…"}
              />
              <div className="composer-bar">
                <button className="c-tool" title="Joindre un fichier"><Icon name="paperclip" size={18} color="currentColor" /></button>
                <button className="c-tool" title="Base de connaissances"><Icon name="folder" size={18} color="currentColor" /></button>
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <button className={"c-tool" + (showPicker ? " on" : "")} title="Bibliothèque de prompts" onClick={() => setShowPicker(s => !s)}><Icon name="library" size={18} color="currentColor" /></button>
                  {showPicker && (
                    <PromptPicker
                      onClose={() => setShowPicker(false)}
                      onPick={(p) => { setShowPicker(false); setDraft(d => d ? d + "\n\n" + p.body : p.body); toast("Prompt « " + p.title + " » inséré"); }}
                    />
                  )}
                </span>
                <button className="c-tool" title="Lancer une routine"><Icon name="repeat" size={18} color="currentColor" /></button>
                {copresent && (
                  <span className="c-typers">
                    <Avatar user={copresent} size={20} />
                    {ghost ? `${SYN.TEAM[copresent].name.split(" ")[0]} écrit aussi…` : `${SYN.TEAM[copresent].name.split(" ")[0]} est ici`}
                  </span>
                )}
                <button className={"composer-send" + (streaming ? " stop" : "")} onClick={streaming ? () => { cancelStream.current = true; clearTimers(); setStreaming(false); setMessages(m => [...m, { id: "st" + Date.now(), author: "ai", role: "assistant", at: nowTime(), text: streamText, interrupted: true }]); setStreamText(""); } : send}>
                  <Icon name={streaming ? "square" : "arrow-up"} size={18} color="#fff" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* région droite */}
      {!inlineArtifacts && (
        <>
          <div className={"chat-aside" + (asideOpen ? " open" : "")}>
            {showViewer
              ? <ArtifactViewer artifact={openArt || liveArtifact} streamRows={streaming && riskRows != null ? riskRows : null} onClose={() => { setOpenArt(null); setAsideOpen(false); }} onShare={() => setShareArt(openArt || liveArtifact)} onMobileClose={() => setAsideOpen(false)} />
              : <RightPanel projectId={projectId} chatId={chatId} liveArtifact={streaming && riskRows != null} onOpenArtifact={(a) => { setOpenArt(a); }} onMobileClose={() => setAsideOpen(false)} />
            }
          </div>
          {asideOpen && <div className="chat-aside-scrim" onClick={() => setAsideOpen(false)}></div>}
        </>
      )}

      {shareArt && <ShareArtifactModal key={shareArt.id} artifact={shareArt} onClose={() => setShareArt(null)} toast={toast} />}
    </div>
  );
}

function Message({ m, inlineArtifacts, onOpenArt }) {
  const isAI = m.role === "assistant";
  const u = isAI ? null : SYN.TEAM[m.author];
  return (
    <div className={"msg " + (isAI ? "assistant" : "user")}>
      {isAI
        ? <span className="m-avatar"><Icon name="sparkles" size={18} color="#fff" /></span>
        : <Avatar user={u} size={34} showOnline />}
      <div className="m-body">
        <div className="m-head">
          <span className="m-name">{isAI ? "Assistant Synelia" : u.name}{!isAI && u.you && <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}> (vous)</span>}</span>
          <span className="m-role">{isAI ? "IA" : u.title}</span>
          <span className="m-at">· {m.at}</span>
          {m.steer && <span className="pill pill-live" style={{ marginLeft: 4 }}><Icon name="git-fork" size={11} color="currentColor" /> orientation</span>}
          {m.interrupted && <span className="pill pill-soft" style={{ marginLeft: 4 }}>interrompu</span>}
        </div>
        <div className="m-text">{renderRich(m.text)}</div>
        {m.attachments && (
          <div className="m-atts">
            {m.attachments.map((a, i) => <span key={i} className="m-att"><Icon name={a.icon} size={15} /> {a.name}</span>)}
          </div>
        )}
        {m.artifact && inlineArtifacts && (
          <div className="art-inline" onClick={() => onOpenArt(m.artifact)}>
            <div className="ai-top">
              <span className="ai-ic"><Icon name={m.artifact.icon} size={18} color="currentColor" /></span>
              <div><div className="ai-name">{m.artifact.title}</div><div className="ai-kind">{m.artifact.kind} · généré par l'IA</div></div>
              <span className="ai-open">Ouvrir →</span>
            </div>
            <div className="ai-prev">7 constats cotés · 3 critiques · tri par criticité décroissante</div>
          </div>
        )}
      </div>
    </div>
  );
}

function nowTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
function steerReply(text) {
  return "Je reprends en tenant compte de « " + (text.length > 60 ? text.slice(0, 60) + "…" : text) + " ». Voici la version ajustée, alignée sur votre priorité.";
}
function genReply(text) {
  return "Bonne question. Sur la base des documents du projet, voici une première analyse structurée que vous pouvez affiner avec l'équipe. J'ai pris en compte la cartographie SI et les notes d'entretien pour étayer chaque point.";
}

window.ChatWorkspace = ChatWorkspace;
