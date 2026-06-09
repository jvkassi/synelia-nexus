"use client";

import { useEffect, useRef, useState } from "react";
import {
  FolderPlusIcon,
  GlobeIcon,
  LockIcon,
  MessageSquareIcon,
  PlusCircleIcon,
  SendIcon,
  SparklesIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { useModal } from "@/components/synelia/modal-context";
import { useToast } from "@/components/synelia/toaster";

/** Reusable close button for the modal header. */
function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button className="x" type="button" aria-label="Fermer" onClick={onClose}>
      <XIcon size={18} />
    </button>
  );
}

/** Dark overlay backdrop. Clicking it closes the modal. */
function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NewProjectModal                                                     */
/* ------------------------------------------------------------------ */
function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [email, setEmail] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  function addMember(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && email.trim()) {
      setChips((c) => [...c, email.trim()]);
      setEmail("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    show("Projet créé avec succès.");
    onClose();
  }

  return (
    <div className="modal">
      <div className="modal-head">
        <div>
          <h2>Nouveau projet</h2>
          <p className="sub">Créez un espace de travail collaboratif pour votre équipe.</p>
        </div>
        <CloseBtn onClose={onClose} />
      </div>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="field">
            <label>Nom du projet</label>
            <input
              type="text"
              placeholder="Ex : Audit SI — Banque XYZ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Décrivez l'objectif du projet…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Inviter des membres</label>
            <input
              type="text"
              placeholder="Adresse e-mail — Entrée pour ajouter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={addMember}
            />
            {chips.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                {chips.map((c) => (
                  <span
                    key={c}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(75,40,130,.1)", color: "var(--color-primary)",
                      borderRadius: 999, padding: "4px 11px", fontSize: 12, fontWeight: 600,
                    }}
                  >
                    {c}
                    <button
                      type="button"
                      aria-label={`Retirer ${c}`}
                      onClick={() => setChips((prev) => prev.filter((x) => x !== c))}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", color: "var(--color-primary)" }}
                    >
                      <XIcon size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            <FolderPlusIcon size={15} />
            Créer le projet
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  InviteModal                                                         */
/* ------------------------------------------------------------------ */
const PENDING_MEMBERS = [
  { id: "p1", name: "Awa Koné", email: "awa.kone@synelia.tech", role: "Propriétaire", pending: false },
  { id: "p2", name: "Kofi Mensah", email: "kofi.mensah@synelia.tech", role: "Membre", pending: false },
  { id: "p3", name: "Fatou Diabaté", email: "fatou.diabate@synelia.tech", role: "Membre", pending: true },
];

function InviteModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Membre");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    show(`Invitation envoyée à ${email}.`);
    setEmail("");
  }

  return (
    <div className="modal">
      <div className="modal-head">
        <div className="mh-ic">
          <UserPlusIcon size={20} />
        </div>
        <div>
          <h2>Inviter des membres</h2>
          <p className="sub">Envoyez une invitation par e-mail à votre collaborateur.</p>
        </div>
        <CloseBtn onClose={onClose} />
      </div>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="field">
            <label>Adresse e-mail</label>
            <div className="invite-input-row">
              <input
                type="email"
                placeholder="collaborateur@organisation.ci"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <select
                className="role-select field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ marginBottom: 0 }}
              >
                <option>Membre</option>
                <option>Propriétaire</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-sub)", marginBottom: 8, fontFamily: "var(--font-display)" }}>
              Membres actuels
            </p>
            {PENDING_MEMBERS.map((m) => (
              <div key={m.id} className="member-row">
                <span
                  className="av"
                  style={{ width: 34, height: 34, background: "var(--color-primary)", fontSize: 13 }}
                >
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="m-name">{m.name}</div>
                  <div className={`m-mail${m.pending ? " pending" : ""}`}>
                    {m.pending ? "Invitation en attente" : m.email}
                  </div>
                </div>
                <span className={`role-badge ${m.role === "Propriétaire" ? "owner" : "member"}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Fermer</button>
          <button type="submit" className="btn btn-primary" disabled={!email.trim()}>
            <SendIcon size={14} />
            Envoyer l&apos;invitation
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NewChatModal                                                        */
/* ------------------------------------------------------------------ */
function NewChatModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast();
  const [title, setTitle] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    show("Conversation créée.");
    onClose();
  }

  return (
    <div className="modal">
      <div className="modal-head">
        <div className="mh-ic">
          <MessageSquareIcon size={20} />
        </div>
        <div>
          <h2>Nouvelle conversation</h2>
          <p className="sub">Démarrez une nouvelle conversation IA dans ce projet.</p>
        </div>
        <CloseBtn onClose={onClose} />
      </div>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="field">
            <label>Titre de la conversation</label>
            <input
              type="text"
              placeholder="Ex : Analyse des risques PCI-DSS"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
            <PlusCircleIcon size={15} />
            Créer
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NewPromptModal                                                      */
/* ------------------------------------------------------------------ */
function NewPromptModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    show("Prompt enregistré dans la bibliothèque.");
    onClose();
  }

  return (
    <div className="modal">
      <div className="modal-head">
        <div>
          <h2>Nouveau prompt</h2>
          <p className="sub">Ajoutez un prompt à la bibliothèque de votre équipe.</p>
        </div>
        <CloseBtn onClose={onClose} />
      </div>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="field">
            <label>Titre</label>
            <input
              type="text"
              placeholder="Ex : Analyse d'écarts PCI-DSS v4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label>Contenu du prompt</label>
            <textarea
              placeholder="Rédigez votre prompt ici…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: 120 }}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  UsePromptModal                                                      */
/* ------------------------------------------------------------------ */
const MOCK_PROJECTS = [
  { id: "coris", name: "Audit SI — Coris Bank", color: "#4B2882" },
  { id: "cnps", name: "Migration Cloud — CNPS", color: "#6B3FA0" },
  { id: "oneci", name: "Cybersécurité — ONECI", color: "#C0297A" },
  { id: "academy", name: "Open Digital Academy", color: "#00C48C" },
];

function UsePromptModal({ onClose, props }: { onClose: () => void; props?: Record<string, unknown> }) {
  const { show } = useToast();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const promptTitle = (props?.title as string) ?? "Matrice de risques d'audit";
  const promptBody = (props?.body as string) ??
    "Tu es consultant senior en audit SI. Produis une matrice de risques à partir des constats d'audit…";

  function submit() {
    if (!selectedProject) return;
    show("Conversation créée avec ce prompt.");
    onClose();
  }

  return (
    <div className="modal" key={String(props?.id ?? "use-prompt")}>
      <div className="modal-head">
        <div className="mh-ic">
          <SparklesIcon size={20} />
        </div>
        <div>
          <h2>Utiliser ce prompt</h2>
          <p className="sub">{promptTitle}</p>
        </div>
        <CloseBtn onClose={onClose} />
      </div>
      <div className="modal-body">
        <div className="field">
          <label>Aperçu du prompt</label>
          <div className="prompt-preview">{promptBody}</div>
        </div>
        <div className="field">
          <label>Choisir un projet</label>
          <div className="proj-choose">
            {MOCK_PROJECTS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`proj-opt${selectedProject === p.id ? " sel" : ""}`}
                onClick={() => setSelectedProject(p.id)}
              >
                <span
                  className="p-ic"
                  style={{ background: p.color, width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center" }}
                />
                <span className="po-name">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selectedProject}
          onClick={submit}
        >
          Démarrer la conversation
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VisibilityModal                                                     */
/* ------------------------------------------------------------------ */
function VisibilityModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast();
  const [scope, setScope] = useState<"public" | "private">("private");

  function submit() {
    show(scope === "public" ? "Projet rendu public au workspace." : "Projet rendu privé.");
    onClose();
  }

  return (
    <div className="modal">
      <div className="modal-head">
        <div>
          <h2>Visibilité du projet</h2>
          <p className="sub">Contrôlez qui peut voir ce projet dans votre workspace.</p>
        </div>
        <CloseBtn onClose={onClose} />
      </div>
      <div className="modal-body">
        <div className="share-scope">
          <button
            type="button"
            className={`scope-opt${scope === "public" ? " sel" : ""}`}
            onClick={() => setScope("public")}
          >
            <span className="ic"><GlobeIcon size={18} /></span>
            <div>
              <div className="so-t">Public au workspace</div>
              <div className="so-d">Tous les membres de votre organisation peuvent voir ce projet et ses artefacts partagés.</div>
            </div>
          </button>
          <button
            type="button"
            className={`scope-opt${scope === "private" ? " sel" : ""}`}
            onClick={() => setScope("private")}
          >
            <span className="ic"><LockIcon size={18} /></span>
            <div>
              <div className="so-t">Privé</div>
              <div className="so-d">Seuls les membres invités ont accès à ce projet.</div>
            </div>
          </button>
        </div>
        <div className="viz-note">
          <span className="ic"><LockIcon size={15} /></span>
          <span>Les conversations et fichiers restent toujours accessibles uniquement aux participants, quelle que soit la visibilité.</span>
        </div>
      </div>
      <div className="modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button type="button" className="btn btn-primary" onClick={submit}>
          Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modals host                                                         */
/* ------------------------------------------------------------------ */
export function Modals() {
  const { modal, closeModal } = useModal();

  if (!modal.kind) return null;

  return (
    <Overlay onClose={closeModal}>
      {modal.kind === "new-project" && (
        <NewProjectModal onClose={closeModal} />
      )}
      {modal.kind === "invite" && (
        <InviteModal onClose={closeModal} />
      )}
      {modal.kind === "new-chat" && (
        <NewChatModal onClose={closeModal} />
      )}
      {modal.kind === "new-prompt" && (
        <NewPromptModal onClose={closeModal} />
      )}
      {modal.kind === "use-prompt" && (
        <UsePromptModal key={String(modal.props?.id ?? "use")} onClose={closeModal} props={modal.props} />
      )}
      {modal.kind === "visibility" && (
        <VisibilityModal onClose={closeModal} />
      )}
    </Overlay>
  );
}
