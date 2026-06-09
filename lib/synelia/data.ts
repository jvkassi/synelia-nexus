/**
 * Synelia Cowork — canonical workspace data.
 *
 * Ported from the Claude Design handoff (`design_files/src/data.js`) into a
 * typed module. This is the real scenario data for the Direction Data & IA
 * department: members, shared projects, conversations, routines, files,
 * artifacts, activity and the shared prompt library.
 *
 * Until the Workspace/Thread schema and its write paths land, server
 * components read from here. The shape is intentionally close to the eventual
 * DB rows so wiring queries later is a drop-in.
 */

export type MemberRole = "Propriétaire" | "Membre";

export type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: MemberRole;
  title: string;
  online: boolean;
  you?: boolean;
  last?: string;
};

export type Project = {
  id: string;
  name: string;
  emoji: string; // lucide icon name
  color: string;
  desc: string;
  members: string[];
  updated: string;
  chats: number;
  files: number;
  routines: number;
  artifacts: number;
  public: boolean;
};

export type LiveState = "ai-typing" | "user-typing";

export type Chat = {
  id: string;
  title: string;
  project: string;
  lastBy: string;
  preview: string;
  updated: string;
  live: boolean;
  liveUser?: string;
  liveState?: LiveState;
  participants: string[];
  pinned?: boolean;
};

export type RoutineRun = {
  title: string;
  date: string;
  ranFor: string;
  thought: number;
  output: string;
};

export type Routine = {
  id: string;
  title: string;
  cadence: string;
  owner: string;
  next: string;
  project: string;
  icon: string;
  status: "active" | "paused";
  ago: string;
  prompt: string;
  runs: RoutineRun[];
};

export type WorkspaceFile = {
  id: string;
  name: string;
  type: "sheet" | "pdf" | "doc";
  size: string;
  by: string;
  when: string;
  icon: string;
  project: string;
};

export type ArtifactKind = "Document" | "Tableur" | "Diagramme";

export type Artifact = {
  id: string;
  title: string;
  kind: ArtifactKind;
  icon: string;
  creator: string;
  when: string;
  project: string;
  chat?: string;
  live?: boolean;
  shared?: boolean;
};

export type ActivityItem = {
  id: string;
  user: string;
  verb: string;
  target: string;
  project: string;
  when: string;
  live?: boolean;
};

export type ThreadMessage = {
  id: string;
  author: string;
  role: "user" | "assistant";
  at: string;
  text: string;
  attachments?: { name: string; icon: string }[];
};

export type PromptCategory = { id: string; label: string; icon: string };

export type Prompt = {
  id: string;
  title: string;
  cat: string;
  icon: string;
  author: string;
  uses: number;
  pinned?: boolean;
  official?: boolean;
  desc: string;
  body: string;
};

export const TEAM: Record<string, Member> = {
  awa: { id: "awa", name: "Awa Koné", initials: "AK", color: "#4B2882", role: "Propriétaire", title: "Lead Data & IA", online: true, you: true },
  kofi: { id: "kofi", name: "Kofi Mensah", initials: "KM", color: "#C0297A", role: "Membre", title: "Consultant Cybersécurité", online: true },
  fatou: { id: "fatou", name: "Fatou Diabaté", initials: "FD", color: "#6B3FA0", role: "Membre", title: "Data Scientist", online: true },
  yao: { id: "yao", name: "Yao N'Guessan", initials: "YN", color: "#00AEEF", role: "Membre", title: "Architecte SI", online: false, last: "il y a 22 min" },
  mariam: { id: "mariam", name: "Mariam Touré", initials: "MT", color: "#00C48C", role: "Membre", title: "Cheffe de projet", online: true },
  ibrahim: { id: "ibrahim", name: "Ibrahim Coulibaly", initials: "IC", color: "#FF6B35", role: "Membre", title: "Ingénieur DevOps", online: false, last: "hier" },
};

export const PROJECTS: Project[] = [
  { id: "coris", name: "Audit SI — Coris Bank", emoji: "shield-check", color: "#4B2882", desc: "Audit du système d'information et plan de remédiation pour Coris Bank CI.", members: ["awa", "kofi", "fatou", "yao"], updated: "maintenant", chats: 6, files: 14, routines: 2, artifacts: 5, public: false },
  { id: "cnps", name: "Migration Cloud — CNPS", emoji: "cloud", color: "#6B3FA0", desc: "Trajectoire de migration vers le cloud souverain et urbanisation du SI de la CNPS.", members: ["awa", "yao", "ibrahim", "mariam"], updated: "il y a 1 h", chats: 4, files: 9, routines: 1, artifacts: 2, public: false },
  { id: "oneci", name: "Cybersécurité — ONECI", emoji: "lock", color: "#C0297A", desc: "Évaluation SOC et durcissement de l'infrastructure d'identité nationale.", members: ["awa", "kofi", "ibrahim"], updated: "hier", chats: 3, files: 7, routines: 0, artifacts: 2, public: false },
  { id: "academy", name: "Open Digital Academy", emoji: "graduation-cap", color: "#00C48C", desc: "Conception du parcours « Data Engineering » et évaluation des candidats.", members: ["awa", "fatou", "mariam"], updated: "il y a 2 j", chats: 5, files: 11, routines: 3, artifacts: 2, public: true },
];

export const CHATS: Record<string, Chat[]> = {
  coris: [
    { id: "c-synthese", title: "Synthèse des constats d'audit", project: "coris", lastBy: "kofi", preview: "Peux-tu consolider les 12 constats en une matrice de risques…", updated: "maintenant", live: true, liveUser: "kofi", liveState: "ai-typing", participants: ["awa", "kofi", "fatou"], pinned: true },
    { id: "c-remediation", title: "Plan de remédiation priorisé", project: "coris", lastBy: "awa", preview: "Génère un plan en 3 vagues avec estimation de charge…", updated: "il y a 35 min", live: false, participants: ["awa", "yao"] },
    { id: "c-entretiens", title: "Trame d'entretiens DSI", project: "coris", lastBy: "fatou", preview: "Prépare 15 questions pour les responsables d'application…", updated: "il y a 2 h", live: true, liveUser: "fatou", liveState: "user-typing", participants: ["awa", "fatou"] },
    { id: "c-conformite", title: "Conformité PCI-DSS", project: "coris", lastBy: "kofi", preview: "Liste les écarts vis-à-vis du référentiel PCI-DSS v4…", updated: "hier", live: false, participants: ["awa", "kofi"] },
    { id: "c-archi", title: "Schéma d'architecture cible", project: "coris", lastBy: "yao", preview: "Décris l'architecture applicative cible en couches…", updated: "il y a 2 j", live: false, participants: ["awa", "yao"] },
    { id: "c-budget", title: "Cadrage budgétaire", project: "coris", lastBy: "awa", preview: "Estime le budget de mise en conformité sur 18 mois…", updated: "il y a 3 j", live: false, participants: ["awa", "mariam"] },
  ],
  cnps: [
    { id: "cn-1", title: "Trajectoire de migration cloud", project: "cnps", lastBy: "yao", preview: "Classe les applications selon la stratégie 6R…", updated: "il y a 1 h", live: false, participants: ["awa", "yao", "ibrahim"] },
    { id: "cn-2", title: "Urbanisation du SI", project: "cnps", lastBy: "ibrahim", preview: "Cartographie cible des domaines fonctionnels…", updated: "hier", live: false, participants: ["awa", "ibrahim"] },
  ],
  oneci: [
    { id: "on-1", title: "Plan de durcissement SOC", project: "oneci", lastBy: "kofi", preview: "Propose un plan de durcissement en 3 horizons…", updated: "hier", live: false, participants: ["awa", "kofi", "ibrahim"] },
  ],
  academy: [
    { id: "ac-1", title: "Parcours Data Engineering", project: "academy", lastBy: "mariam", preview: "Conçois un parcours de 8 modules…", updated: "il y a 2 j", live: false, participants: ["awa", "mariam", "fatou"] },
  ],
};

export const ROUTINES: Routine[] = [
  {
    id: "r1", title: "Veille cybersécurité hebdo", cadence: "Chaque lundi · 08:00", owner: "kofi", next: "Lun. 9 juin", project: "coris", icon: "radar", status: "active", ago: "il y a 2 j",
    prompt: "Chaque lundi à 08:00, rédige une synthèse de veille cybersécurité de la semaine : 5 menaces ou vulnérabilités majeures (score CVSS si disponible), leur impact potentiel sur nos clients des secteurs bancaire et public, et une recommandation d'action concrète pour chacune. Termine par une note de priorisation.",
    runs: [
      { title: "Veille — semaine 23", date: "Lun. 2 juin 2026", ranFor: "8,4 s", thought: 4, output: "**Synthèse de veille — 5 vulnérabilités majeures**\n\n1. **CVE-2026-1180** — Citrix NetScaler · CVSS 9.8 — exécution de code à distance, exploitée activement.\n2. **CVE-2026-0934** — Fortinet FortiOS · CVSS 8.6 — contournement d'authentification.\n3. **CVE-2026-0712** — Apache Struts · CVSS 8.1 — désérialisation non sécurisée.\n4. **CVE-2026-0588** — OpenSSL · CVSS 7.4 — fuite mémoire sous charge.\n5. **CVE-2026-0461** — VMware vCenter · CVSS 7.2 — élévation de privilèges.\n\n**Impact pour nos clients**\n\nCoris Bank et la SIB exposent des passerelles NetScaler en frontal : exposition directe à la CVE-2026-1180.\n\n**Priorisation**\n\nAppliquer les correctifs NetScaler et FortiOS sous 48 h. Les trois autres peuvent attendre la prochaine fenêtre de maintenance." },
      { title: "Veille — semaine 22", date: "Lun. 26 mai 2026", ranFor: "7,1 s", thought: 3, output: "**Synthèse de veille — semaine calme**\n\nAucune vulnérabilité critique exploitée activement cette semaine.\n\n1. **CVE-2026-0399** — Microsoft Exchange · CVSS 7.8 — correctif disponible.\n2. **CVE-2026-0277** — Cisco IOS XE · CVSS 6.9 — déni de service.\n\n**Priorisation**\n\nIntégrer les correctifs au cycle de patch mensuel. Aucune action en urgence." },
    ],
  },
  {
    id: "r2", title: "Suivi des constats ouverts", cadence: "Chaque vendredi · 17:00", owner: "awa", next: "Ven. 6 juin", project: "coris", icon: "list-checks", status: "active", ago: "il y a 6 h",
    prompt: "Chaque vendredi à 17:00, dresse l'état des constats d'audit encore ouverts sur le projet Coris Bank : nombre par niveau de criticité, constats clôturés dans la semaine, et les 3 constats critiques à surveiller en priorité. Présente un tableau de synthèse et conclus par le taux d'avancement global.",
    runs: [
      { title: "État au 5 juin", date: "Ven. 5 juin 2026", ranFor: "5,9 s", thought: 3, output: "**Constats ouverts : 7 sur 12**\n\n- Critiques : 2\n- Élevés : 3\n- Modérés : 2\n\n**Clôturés cette semaine**\n\nDeux constats résolus : journalisation centralisée et revue des comptes de service.\n\n**À surveiller**\n\n1. Comptes à privilèges non revus — Critique\n2. Absence de PRA testé — Critique\n\n**Avancement global : 42 %**" },
      { title: "État au 29 mai", date: "Ven. 29 mai 2026", ranFor: "6,2 s", thought: 3, output: "**Constats ouverts : 9 sur 12**\n\n- Critiques : 3\n- Élevés : 4\n- Modérés : 2\n\n**Clôturés cette semaine**\n\nUn constat résolu : chiffrement des sauvegardes.\n\n**Avancement global : 25 %**" },
    ],
  },
  {
    id: "r3", title: "Synthèse d'avancement migration", cadence: "Chaque jeudi · 16:00", owner: "yao", next: "Jeu. 11 juin", project: "cnps", icon: "cloud-cog", status: "active", ago: "il y a 1 j",
    prompt: "Chaque jeudi à 16:00, produis une synthèse d'avancement de la migration cloud de la CNPS : applications migrées dans la semaine, vague en cours, points de blocage, et prochaines bascules planifiées. Ton sobre, prêt à transmettre au COPIL.",
    runs: [
      { title: "Avancement — S23", date: "Jeu. 4 juin 2026", ranFor: "6,7 s", thought: 4, output: "**Vague 2 en cours — 60 % migrée**\n\n3 applications basculées cette semaine (paie, RH, portail agent).\n\n**Point de blocage**\n\nLa dépendance à l'annuaire legacy retarde la bascule du module cotisations.\n\n**Prochaines bascules**\n\nModule cotisations prévu S24, sous réserve de la synchronisation annuaire." },
      { title: "Avancement — S22", date: "Jeu. 28 mai 2026", ranFor: "6,1 s", thought: 3, output: "**Vague 2 démarrée — 20 % migrée**\n\nMise en place de l'environnement cible terminée. Première application (portail agent) en recette.\n\n**Prochaines bascules**\n\nPaie et RH planifiées en S23." },
    ],
  },
  {
    id: "r4", title: "Revue des candidatures reçues", cadence: "Chaque lundi · 09:30", owner: "mariam", next: "Lun. 9 juin", project: "academy", icon: "users", status: "paused", ago: "il y a 5 j",
    prompt: "Chaque lundi à 09:30, passe en revue les candidatures reçues pour le parcours Data Engineering : nombre de dossiers, répartition par profil, et présélection des candidats correspondant aux prérequis. Conclus par les entretiens à programmer.",
    runs: [
      { title: "Candidatures — S22", date: "Lun. 26 mai 2026", ranFor: "5,4 s", thought: 3, output: "**18 candidatures reçues**\n\n- Profils développeurs : 9\n- Profils data/analyse : 6\n- Reconversion : 3\n\n**Présélection**\n\n7 candidats remplissent les prérequis (SQL + Python + projet).\n\n**À programmer**\n\n7 entretiens techniques sur la semaine du 2 juin." },
    ],
  },
  {
    id: "r5", title: "Génération des supports de module", cadence: "Chaque mercredi · 14:00", owner: "fatou", next: "Mer. 10 juin", project: "academy", icon: "graduation-cap", status: "active", ago: "il y a 3 j",
    prompt: "Chaque mercredi à 14:00, génère le support du prochain module du parcours Data Engineering : objectifs pédagogiques, plan détaillé, exercices pratiques et grille d'évaluation. Format prêt à relire avant publication.",
    runs: [
      { title: "Module 4 — Pipelines de données", date: "Mer. 3 juin 2026", ranFor: "9,8 s", thought: 5, output: "**Module 4 — Pipelines de données**\n\n**Objectifs**\n\nConcevoir, orchestrer et superviser un pipeline batch et streaming.\n\n**Plan**\n\n1. Ingestion et formats\n2. Orchestration (Airflow)\n3. Qualité et tests de données\n4. Supervision et alerting\n\n**Évaluation**\n\nProjet fil rouge : pipeline d'ingestion de logs avec contrôle qualité." },
    ],
  },
  {
    id: "r6", title: "Rapport d'employabilité mensuel", cadence: "1er du mois · 08:00", owner: "mariam", next: "1 juil.", project: "academy", icon: "bar-chart-3", status: "active", ago: "il y a 5 j",
    prompt: "Le 1er de chaque mois à 08:00, compile le rapport d'employabilité de l'Open Digital Academy : taux d'insertion des dernières promotions, partenaires recruteurs, et indicateurs clés à présenter à la direction.",
    runs: [
      { title: "Rapport — juin 2026", date: "Dim. 1 juin 2026", ranFor: "7,9 s", thought: 4, output: "**Taux d'insertion : 78 %**\n\nSur les 6 mois suivant la sortie, pour la promotion 2025.\n\n**Partenaires recruteurs**\n\nOrange CI, Sonatel, Coris Bank et 4 ESN locales ont recruté des diplômés.\n\n**Indicateurs**\n\n- Délai moyen d'insertion : 2,3 mois\n- Salaire d'entrée médian en progression de 12 %." },
    ],
  },
];

export const FILES: WorkspaceFile[] = [
  { id: "f1", name: "Cartographie SI — Coris.xlsx", type: "sheet", size: "284 Ko", by: "yao", when: "il y a 2 j", icon: "table-2", project: "coris" },
  { id: "f2", name: "Politique de sécurité v3.pdf", type: "pdf", size: "1,2 Mo", by: "kofi", when: "il y a 2 j", icon: "file-text", project: "coris" },
  { id: "f3", name: "Entretien DSI — notes.docx", type: "doc", size: "48 Ko", by: "fatou", when: "hier", icon: "file-text", project: "coris" },
  { id: "f4", name: "Référentiel PCI-DSS v4.pdf", type: "pdf", size: "3,4 Mo", by: "kofi", when: "hier", icon: "file-text", project: "coris" },
  { id: "f5", name: "Inventaire applicatif.csv", type: "sheet", size: "92 Ko", by: "yao", when: "il y a 3 j", icon: "table-2", project: "coris" },
];

export const ARTIFACTS: Artifact[] = [
  { id: "a1", title: "Matrice de risques — 12 constats", kind: "Document", icon: "layout-grid", creator: "kofi", when: "maintenant", project: "coris", chat: "c-synthese", live: true, shared: true },
  { id: "a2", title: "Plan de remédiation (3 vagues)", kind: "Tableur", icon: "table-2", creator: "awa", when: "il y a 35 min", project: "coris", chat: "c-remediation", shared: true },
  { id: "a3", title: "Schéma d'architecture cible", kind: "Diagramme", icon: "git-fork", creator: "yao", when: "il y a 2 j", project: "coris", chat: "c-archi" },
  { id: "a4", title: "Note de synthèse — COPIL", kind: "Document", icon: "file-text", creator: "awa", when: "il y a 3 j", project: "coris", chat: "c-budget", shared: true },
  { id: "a5", title: "Trame d'entretien DSI", kind: "Document", icon: "messages-square", creator: "fatou", when: "il y a 2 h", project: "coris", chat: "c-entretiens" },
  { id: "a6", title: "Trajectoire de migration cloud", kind: "Tableur", icon: "cloud-cog", creator: "yao", when: "il y a 1 h", project: "cnps" },
  { id: "a7", title: "Cartographie applicative 6R", kind: "Diagramme", icon: "network", creator: "ibrahim", when: "hier", project: "cnps", shared: true },
  { id: "a8", title: "Plan de durcissement SOC", kind: "Document", icon: "shield-check", creator: "kofi", when: "hier", project: "oneci" },
  { id: "a9", title: "Évaluation des risques d'identité", kind: "Document", icon: "shield-alert", creator: "ibrahim", when: "il y a 2 j", project: "oneci" },
  { id: "a10", title: "Parcours Data Engineering — 8 modules", kind: "Document", icon: "graduation-cap", creator: "mariam", when: "il y a 2 j", project: "academy", shared: true },
  { id: "a11", title: "Grille d'évaluation des candidats", kind: "Tableur", icon: "list-checks", creator: "fatou", when: "il y a 4 j", project: "academy" },
];

export const ACTIVITY: ActivityItem[] = [
  { id: "ac1", user: "kofi", verb: "interroge l'IA dans", target: "Synthèse des constats d'audit", project: "Audit SI — Coris Bank", when: "maintenant", live: true },
  { id: "ac2", user: "fatou", verb: "rédige dans", target: "Trame d'entretiens DSI", project: "Audit SI — Coris Bank", when: "maintenant", live: true },
  { id: "ac3", user: "mariam", verb: "a lancé la routine", target: "Suivi des constats ouverts", project: "Audit SI — Coris Bank", when: "il y a 8 min" },
  { id: "ac4", user: "yao", verb: "a importé", target: "Cartographie SI — Coris.xlsx", project: "Migration Cloud — CNPS", when: "il y a 22 min" },
  { id: "ac5", user: "awa", verb: "a partagé un artefact dans", target: "Plan de remédiation priorisé", project: "Audit SI — Coris Bank", when: "il y a 35 min" },
];

export const THREAD_SYNTHESE: ThreadMessage[] = [
  { id: "m1", author: "fatou", role: "user", at: "10:02", text: "Voici les notes d'entretien et l'inventaire applicatif. On a relevé une douzaine de constats pendant la phase terrain.", attachments: [{ name: "Entretien DSI — notes.docx", icon: "file-text" }, { name: "Inventaire applicatif.csv", icon: "table-2" }] },
  { id: "m2", author: "ai", role: "assistant", at: "10:03", text: "Bien reçu. J'ai parcouru les notes et l'inventaire. Je relève **12 constats** que je peux regrouper en 4 familles : gouvernance des accès, obsolescence applicative, sauvegarde/PRA, et conformité PCI-DSS.\n\nSouhaitez-vous que je les consolide dans une matrice de risques (probabilité × impact) avec une cotation par constat ?" },
  { id: "m3", author: "kofi", role: "user", at: "10:05", text: "Oui, parfait. Ajoute une colonne « propriétaire » et une cotation sur 4 niveaux. Priorise pour le COPIL de vendredi." },
];

export const LIVE_AI_REPLY =
  "Très bien. Voici la **matrice de risques** consolidée à partir des 12 constats, cotée sur 4 niveaux (Faible → Critique) avec un propriétaire désigné pour chacun.\n\nJ'ai priorisé en tête les 3 constats critiques à porter au COPIL de vendredi :\n\n1. **Comptes à privilèges non revus** — Critique — propriétaire : DSI\n2. **Absence de PRA testé** — Critique — propriétaire : Production\n3. **Chiffrement des flux PAN incomplet** — Élevé — propriétaire : Sécurité\n\nLa matrice complète est disponible dans le panneau Artefacts à droite. Voulez-vous que je génère aussi la slide de synthèse pour le COPIL ?";

export const PROMPT_CATS: PromptCategory[] = [
  { id: "all", label: "Tous", icon: "library" },
  { id: "audit", label: "Audit & Conseil", icon: "clipboard-check" },
  { id: "cyber", label: "Cybersécurité", icon: "shield-check" },
  { id: "cloud", label: "Cloud & Infra", icon: "cloud" },
  { id: "data", label: "Data & IA", icon: "brain-circuit" },
  { id: "projet", label: "Gestion de projet", icon: "kanban-square" },
  { id: "redac", label: "Rédaction & Synthèse", icon: "pen-line" },
];

export const PROMPTS: Prompt[] = [
  { id: "p-matrice", title: "Matrice de risques d'audit", cat: "audit", icon: "layout-grid", author: "kofi", uses: 34, pinned: true, official: true, desc: "Consolide des constats d'audit en une matrice probabilité × impact, cotée et priorisée.", body: "À partir des constats d'audit fournis, construis une matrice de risques (probabilité × impact). Pour chaque constat : un intitulé, une cotation sur 4 niveaux (Faible, Modéré, Élevé, Critique), un propriétaire désigné et une recommandation de remédiation. Trie par criticité décroissante et mets en tête les constats critiques à porter au COPIL." },
  { id: "p-remediation", title: "Plan de remédiation en vagues", cat: "audit", icon: "list-checks", author: "awa", uses: 21, official: true, desc: "Génère un plan de remédiation priorisé en 3 vagues avec estimation de charge.", body: "Génère un plan de remédiation priorisé en 3 vagues (quick wins, structurant, fond) à partir des constats. Pour chaque action : objectif, prérequis, estimation de charge en jours-homme, propriétaire et indicateur de suivi. Présente le tout sous forme de tableau et ajoute une synthèse des dépendances entre vagues." },
  { id: "p-entretien", title: "Trame d'entretien DSI", cat: "audit", icon: "messages-square", author: "fatou", uses: 18, desc: "Prépare un guide d'entretien structuré pour les responsables d'application.", body: "Prépare une trame d'entretien de 15 questions pour les responsables d'application, regroupées en 3 volets : cartographie applicative, interfaces et flux de données, plans de continuité. Pour chaque question, indique l'objectif et un exemple de réponse attendue. Adapte le ton au contexte d'un audit SI bancaire." },
  { id: "p-pcidss", title: "Analyse d'écarts PCI-DSS v4", cat: "cyber", icon: "shield-alert", author: "kofi", uses: 27, official: true, desc: "Liste les écarts vis-à-vis du référentiel PCI-DSS v4 et les exigences associées.", body: "Analyse les écarts de conformité vis-à-vis du référentiel PCI-DSS v4. Pour chaque exigence non couverte : numéro de l'exigence, description de l'écart, niveau de sévérité, preuve attendue et action corrective recommandée. Conclus par un taux de conformité global et les 5 priorités absolues." },
  { id: "p-veille", title: "Veille cybersécurité hebdomadaire", cat: "cyber", icon: "radar", author: "kofi", uses: 41, pinned: true, desc: "Synthèse hebdo des menaces, vulnérabilités et recommandations pour l'équipe.", body: "Rédige une synthèse de veille cybersécurité de la semaine pour l'équipe : 5 menaces ou vulnérabilités majeures (avec score CVSS si disponible), leur impact potentiel sur nos clients du secteur bancaire et public, et une recommandation d'action concrète pour chacune. Termine par une note de priorisation." },
  { id: "p-soc", title: "Plan de durcissement SOC", cat: "cyber", icon: "lock", author: "ibrahim", uses: 12, desc: "Recommandations de durcissement d'une infrastructure d'identité et de détection.", body: "Propose un plan de durcissement pour notre SOC et l'infrastructure d'identité associée : gestion des comptes à privilèges, segmentation réseau, journalisation et détection, sauvegarde et PRA. Structure en 3 horizons (immédiat, 90 jours, 6 mois) avec, pour chaque mesure, l'effort estimé et le risque couvert." },
  { id: "p-trajectoire", title: "Trajectoire de migration cloud", cat: "cloud", icon: "cloud-cog", author: "yao", uses: 23, official: true, desc: "Construit une trajectoire de migration vers le cloud souverain par vagues d'applications.", body: "Construis une trajectoire de migration vers le cloud souverain à partir de l'inventaire applicatif. Classe les applications selon la stratégie 6R (rehost, replatform, refactor, repurchase, retain, retire), regroupe-les en vagues de migration et indique pour chaque vague les prérequis, les risques et les bénéfices attendus." },
  { id: "p-archi", title: "Schéma d'architecture cible", cat: "cloud", icon: "git-fork", author: "yao", uses: 16, desc: "Décris une architecture applicative cible en couches, avec flux et composants.", body: "Décris l'architecture applicative cible en couches (présentation, services, données, intégration, sécurité). Pour chaque couche : composants clés, technologies recommandées, flux d'échange et points d'attention sécurité. Propose ensuite une représentation textuelle du schéma que je pourrai transformer en diagramme." },
  { id: "p-eda", title: "Analyse exploratoire d'un jeu de données", cat: "data", icon: "bar-chart-3", author: "fatou", uses: 29, official: true, desc: "Cadre une analyse exploratoire : qualité, distributions, corrélations, pistes.", body: "À partir du jeu de données fourni, mène une analyse exploratoire : qualité et complétude des données, distributions des variables clés, corrélations notables, valeurs aberrantes. Conclus par 3 à 5 hypothèses ou pistes d'analyse à creuser, et les transformations de données nécessaires avant modélisation." },
  { id: "p-parcours", title: "Parcours de formation Data Engineering", cat: "data", icon: "graduation-cap", author: "mariam", uses: 14, desc: "Conçoit un parcours de formation modulaire avec objectifs et évaluations.", body: "Conçois un parcours de formation « Data Engineering » de 8 modules pour l'Open Digital Academy. Pour chaque module : objectifs pédagogiques, prérequis, durée, compétences visées et modalité d'évaluation. Termine par une grille d'évaluation des candidats à l'entrée et un projet fil rouge." },
  { id: "p-copil", title: "Note de synthèse pour COPIL", cat: "redac", icon: "file-text", author: "awa", uses: 38, pinned: true, official: true, desc: "Rédige une note de synthèse exécutive prête à présenter en comité de pilotage.", body: "Rédige une note de synthèse exécutive pour le COPIL à partir des éléments du projet : contexte en 3 lignes, avancement, 3 points saillants, risques et arbitrages attendus, et décisions à valider. Ton sobre et institutionnel, vouvoiement, maximum une page. Termine par les prochaines étapes datées." },
  { id: "p-devis", title: "Cadrage budgétaire sur 18 mois", cat: "projet", icon: "calculator", author: "mariam", uses: 19, desc: "Estime un budget de mise en conformité réparti par poste et par trimestre.", body: "Estime le budget de mise en conformité sur 18 mois. Répartis les coûts par poste (RH internes, prestations, licences, infrastructure) et par trimestre. Distingue investissement et fonctionnement, ajoute une marge d'incertitude et propose 2 scénarios : ambitieux et prudent. Présente sous forme de tableau récapitulatif." },
];

export const DEPARTMENT = { name: "Direction Data & IA", initials: "DI", memberCount: Object.keys(TEAM).length };

/* ----------------------------- accessors ----------------------------- */

export const getMember = (id: string): Member | undefined => TEAM[id];
export const teamList = (): Member[] => Object.values(TEAM);

export const getProject = (id: string): Project | undefined =>
  PROJECTS.find((p) => p.id === id);

export const getProjectChats = (projectId: string): Chat[] =>
  CHATS[projectId] ?? [];

export const getProjectMembers = (projectId: string): Member[] => {
  const p = getProject(projectId);
  if (!p) {
    return [];
  }
  return p.members.map((m) => TEAM[m]).filter(Boolean);
};

export const getProjectArtifacts = (projectId: string): Artifact[] =>
  ARTIFACTS.filter((a) => a.project === projectId);

export const getProjectFiles = (projectId: string): WorkspaceFile[] =>
  FILES.filter((f) => f.project === projectId);

export const getProjectRoutines = (projectId: string): Routine[] =>
  ROUTINES.filter((r) => r.project === projectId);

export const getArtifact = (id: string): Artifact | undefined =>
  ARTIFACTS.find((a) => a.id === id);

export const getRoutine = (id: string): Routine | undefined =>
  ROUTINES.find((r) => r.id === id);

export const getPrompt = (id: string): Prompt | undefined =>
  PROMPTS.find((p) => p.id === id);

/** All conversations across projects, most-recently-active first-ish. */
export const allChats = (): Chat[] => Object.values(CHATS).flat();

export const projectNameOf = (projectId: string): string =>
  getProject(projectId)?.name ?? projectId;

export const KIND_VAR: Record<ArtifactKind, string> = {
  Document: "var(--kind-doc)",
  Tableur: "var(--kind-tableur)",
  Diagramme: "var(--kind-diagramme)",
};

export const KIND_TEXT: Record<ArtifactKind, string> = {
  Document: "var(--white)",
  Tableur: "var(--primary-dark)",
  Diagramme: "var(--primary-dark)",
};
