/* Synelia Cowork — racine de l'application */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "centered",
  "accent": "#C0297A",
  "nav": "projects",
  "density": "regular",
  "showPresence": true
}/*EDITMODE-END*/;

function Topbar({ view, project, chat, onSearch, onInvite, onMenu }) {
  return (
    <div className="topbar">
      <button className="tb-burger tb-icon" onClick={onMenu} title="Menu" aria-label="Ouvrir le menu"><Icon name="menu" size={21} color="currentColor" /></button>
      <div className="tb-crumb">
        <Icon name="brain-circuit" size={15} color="var(--color-text-muted)" />
        <span>Data &amp; IA</span>
        {project && <><Icon name="chevron-right" size={14} color="var(--color-text-muted)" /><span className="cur">{project.name}</span></>}
        {!project && view === "library" && <><Icon name="chevron-right" size={14} color="var(--color-text-muted)" /><span className="cur">Bibliothèque de prompts</span></>}
        {!project && view === "artifacts" && <><Icon name="chevron-right" size={14} color="var(--color-text-muted)" /><span className="cur">Artefacts</span></>}
        {!project && view === "routines" && <><Icon name="chevron-right" size={14} color="var(--color-text-muted)" /><span className="cur">Routines</span></>}
        {!project && view !== "library" && view !== "artifacts" && view !== "routines" && <><Icon name="chevron-right" size={14} color="var(--color-text-muted)" /><span className="cur">Accueil</span></>}
      </div>
      <div className="tb-search">
        <Icon name="search" size={16} color="currentColor" />
        <input placeholder="Rechercher un projet, une conversation, un fichier…" />
        <span style={{ fontSize: 11, border: "1px solid var(--color-border-soft)", borderRadius: 4, padding: "1px 6px" }}>⌘K</span>
      </div>
      <div className="tb-right">
        <button className="tb-icon" onClick={onInvite} title="Inviter"><Icon name="user-plus" size={19} color="currentColor" /></button>
        <button className="tb-icon" title="Notifications"><Icon name="bell" size={19} color="currentColor" /><span className="dotn"></span></button>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState("home");          // home | library | artifacts | project | chat
  const [navOpen, setNavOpen] = useState(false);     // tiroir de navigation (mobile)
  const [usePrompt, setUsePrompt] = useState(null);  // prompt en attente de lancement
  const [openArtifact, setOpenArtifact] = useState(null); // artefact ouvert (galerie globale)
  const [vizBump, setVizBump] = useState(0);          // re-render après changement de visibilité
  const [activeProject, setActiveProject] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [modal, setModal] = useState(null);          // newProject | invite | newChat
  const [inviteProject, setInviteProject] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [convoSeq, setConvoSeq] = useState(0);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  }, []);

  // appliquer l'accent choisi
  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", t.accent);
  }, [t.accent]);

  const project = activeProject ? SYN.PROJECTS.find(p => p.id === activeProject) : null;
  const chat = (activeProject && activeChat) ? SYN.CHATS[activeProject]?.find(c => c.id === activeChat) : null;

  const closeNav = () => setNavOpen(false);
  const openProject = (id) => { setActiveProject(id); setActiveChat(null); setView("project"); closeNav(); };
  const openChat = (pid, cid) => { setActiveProject(pid); setActiveChat(cid); setPendingPrompt(null); setView("chat"); closeNav(); };
  const startConversation = (pid, text) => { setActiveProject(pid); setActiveChat(null); setPendingPrompt(text); setConvoSeq(s => s + 1); setView("chat"); closeNav(); };
  const goHome = () => { setView("home"); setActiveProject(null); setActiveChat(null); closeNav(); };
  const goLibrary = () => { setView("library"); setActiveProject(null); setActiveChat(null); closeNav(); };
  const goArtifacts = () => { setView("artifacts"); setActiveProject(null); setActiveChat(null); closeNav(); };
  const goRoutines = () => { setView("routines"); setActiveProject(null); setActiveChat(null); closeNav(); };
  const toggleVisibility = (pid, isPublic) => {
    const proj = SYN.PROJECTS.find(p => p.id === pid);
    if (proj) proj.public = isPublic;
    setVizBump(n => n + 1);
    toast(isPublic ? "« " + proj.name + " » est désormais public dans le workspace" : "« " + proj.name + " » est repassé en privé");
  };

  return (
    <div className="app" style={{ "--sidebar-w": "264px" }}>
      <Sidebar
        open={navOpen}
        view={view}
        variant={t.nav}
        activeProject={activeProject}
        activeChat={activeChat}
        onNav={(v) => v === "home" ? goHome() : null}
        onOpenProject={openProject}
        onOpenChat={openChat}
        onNewProject={() => setModal("newProject")}
        onOpenLibrary={goLibrary}
        onOpenArtifacts={goArtifacts}
        onOpenRoutines={goRoutines}
        onSettings={() => setModal("invite")}
      />
      {navOpen && <div className="sb-scrim" onClick={closeNav}></div>}

      <div className="main-wrap">
        <Topbar view={view} project={project} chat={chat} onMenu={() => setNavOpen(true)} onInvite={() => { setInviteProject(activeProject); setModal("invite"); }} />

        {view === "home" && (
          <div className="content">
            <Dashboard
              onOpenProject={openProject}
              onOpenChat={openChat}
              onNewProject={() => setModal("newProject")}
              onInvite={() => { setInviteProject(null); setModal("invite"); }}
            />
          </div>
        )}

        {view === "library" && (
          <div className="content">
            <LibraryView
              onUsePrompt={(p) => setUsePrompt(p)}
              onNewPrompt={() => setModal("newPrompt")}
              toast={toast}
            />
          </div>
        )}

        {view === "artifacts" && (
          <div className="content">
            <ArtifactsView onOpen={(a) => setOpenArtifact(a)} onOpenProject={openProject} />
          </div>
        )}

        {view === "routines" && (
          <div className="content">
            <RoutinesView onOpenProject={openProject} />
          </div>
        )}

        {view === "project" && project && (
          <ProjectView
            projectId={activeProject}
            onOpenChat={openChat}
            onStartConversation={startConversation}
            toast={toast}
          />
        )}

        {view === "chat" && project && (
          <ChatWorkspace
            key={activeChat || ("new-" + convoSeq)}
            projectId={activeProject}
            chatId={activeChat}
            initialPrompt={pendingPrompt}
            layout={t.layout}
            onBack={() => setView("project")}
            toast={toast}
          />
        )}
      </div>

      {/* MODALES */}
      {modal === "newProject" && (
        <NewProjectModal
          onClose={() => setModal(null)}
          onCreate={({ name, desc, invitees }) => {
            const palette = ["#4B2882", "#6B3FA0", "#C0297A", "#00C48C", "#00AEEF", "#FF6B35"];
            const id = "proj-" + Date.now();
            SYN.PROJECTS.unshift({
              id,
              name: name.trim(),
              emoji: "folder-kanban",
              color: palette[SYN.PROJECTS.length % palette.length],
              desc: desc.trim() || "Nouveau projet partagé de la Direction Data & IA.",
              members: ["awa", ...invitees],
              updated: "maintenant",
              chats: 0, files: 0, routines: 0, artifacts: 0,
              public: false,
            });
            SYN.CHATS[id] = [];
            setModal(null);
            toast("Projet « " + name.trim() + " » créé · " + (invitees.length + 1) + " membres");
            openProject(id);
          }}
        />
      )}
      {modal === "invite" && (
        <InviteModal projectId={inviteProject} onClose={() => setModal(null)} toast={toast} />
      )}
      {openArtifact && (
        <ArtifactModal key={openArtifact.id} artifact={openArtifact} onClose={() => setOpenArtifact(null)} toast={toast} />
      )}
      {usePrompt && (
        <UsePromptModal
          prompt={usePrompt}
          onClose={() => setUsePrompt(null)}
          onLaunch={(pid, text) => { setUsePrompt(null); startConversation(pid, text); toast("Conversation lancée depuis la bibliothèque"); }}
        />
      )}
      {modal === "newPrompt" && (
        <NewPromptModal
          onClose={() => setModal(null)}
          onCreate={({ title }) => { setModal(null); toast("Prompt « " + title + " » publié dans la bibliothèque"); }}
        />
      )}
      {modal === "newChat" && (
        <NewChatModal
          projectId={activeProject}
          onClose={() => setModal(null)}
          onCreate={(title) => { setModal(null); openChat(activeProject, null); toast("Conversation « " + title + " » créée"); }}
        />
      )}

      {toastMsg && <div className="toast"><Icon name="check-circle-2" size={17} color="var(--color-success)" /> {toastMsg}</div>}

      {/* TWEAKS */}
      <TweaksPanel>
        <TweakSection label="Espace de travail" />
        <TweakRadio label="Disposition de la conversation" value={t.layout}
          options={[{ value: "centered", label: "Centrée" }, { value: "canvas", label: "Canvas" }, { value: "wide", label: "Large" }]}
          onChange={v => setTweak("layout", v)} />
        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", lineHeight: 1.5, margin: "2px 2px 6px", padding: "0 2px" }}>
          {t.layout === "centered" && "Conversation centrée + panneau latéral (artefacts, fichiers, présents)."}
          {t.layout === "canvas" && "Conversation à gauche, artefact épinglé à droite — idéal pour suivre un livrable qui se construit."}
          {t.layout === "wide" && "Conversation pleine largeur, artefacts insérés en ligne dans le fil."}
        </div>
        <TweakSection label="Navigation" />
        <TweakRadio label="Style de la barre latérale" value={t.nav}
          options={[{ value: "projects", label: "Projets" }, { value: "recents", label: "Récents" }, { value: "light", label: "Clair" }]}
          onChange={v => setTweak("nav", v)} />
        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", lineHeight: 1.5, margin: "2px 2px 6px", padding: "0 2px" }}>
          {t.nav === "projects" && "Sombre, centrée sur les projets partagés — la navigation d'équipe par défaut."}
          {t.nav === "recents" && "Sombre, centrée sur les conversations récentes groupées par date, projets repliés."}
          {t.nav === "light" && "Thème clair, conversations récentes en avant — plus aéré et minimal."}
        </div>
        <TweakSection label="Marque" />
        <TweakColor label="Accent" value={t.accent}
          options={["#C0297A", "#4B2882", "#00AEEF", "#FF6B35"]}
          onChange={v => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
