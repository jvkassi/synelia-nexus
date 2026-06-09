// lib/synelia/data.ts
// Synelia Cowork — full mock data, ported from the handoff's data.js + rightpanel.jsx
// Source: Claude cowork-handoff.zip (2026-06-09). Drives the UI today; the real
// Drizzle schema in lib/db/schema.ts will replace this layer as it lands.
//
// NOTE (per Olive, 2026-06-09): "don't use mock data, seed data in database".
// This module is a temporary compat layer so the UI can render while the seed
// script and queries.ts are built. Once queries.ts is wired to SQLite, this
// file becomes the data source for `pnpm db:seed` and the live module goes
// away. See .hermes/kanban.md Phase 1B.

import type {
  SyneliaData, Chat, ChatMessage, TeamMember, Project, Routine, RoutineRun,
  Artifact, ProjectFile, ArtifactKind, ProjectId, UserId, Prompt, PromptCategory,
  Activity, RiskRow, Role, ChatsByProject,
} from "./types";

// ===== Core data =====
const ME: TeamMember = {
  id: "awa", name: "Awa Koné", initials: "AK", color: "#4B2882",
  role: "Propriétaire", title: "Lead Data & IA", online: true, you: true,
};

const TEAM: SyneliaData["TEAM"] = {
  awa:     { id: "awa",     name: "Awa Koné",          initials: "AK", color: "#4B2882", role: "Propriétaire", title: "Lead Data & IA",            online: true,  you: true  },
  kofi:    { id: "kofi",    name: "Kofi Mensah",       initials: "KM", color: "#C0297A", role: "Membre",       title: "Consultant Cybersécurité",  online: true             },
  fatou:   { id: "fatou",   name: "Fatou Diabaté",     initials: "FD", color: "#6B3FA0", role: "Membre",       title: "Data Scientist",            online: true             },
  yao:     { id: "yao",     name: "Yao N'Guessan",     initials: "YN", color: "#00AEEF", role: "Membre",       title: "Architecte SI",             online: false, last: "il y a 22 min" },
  mariam:  { id: "mariam",  name: "Mariam Touré",      initials: "MT", color: "#00C48C", role: "Membre",       title: "Cheffe de projet",          online: true             },
  ibrahim: { id: "ibrahim", name: "Ibrahim Coulibaly", initials: "IC", color: "#FF6B35", role: "Membre",       title: "Ingénieur DevOps",          online: false, last: "hier"         },
};

const PROJECTS: SyneliaData["PROJECTS"] = [
  { id: "coris",   name: "Audit SI — Coris Bank",  emoji: "shield-check",   color: "#4B2882", desc: "Audit du système d'information et plan de remédiation pour Coris Bank CI.", members: ["awa", "kofi", "fatou", "yao"],    updated: "maintenant", chats: 6, files: 14, routines: 2, artifacts: 5, public: false },
  { id: "cnps",    name: "Migration Cloud — CNPS",  emoji: "cloud",          color: "#6B3FA0", desc: "Trajectoire de migration vers le cloud souverain et urbanisation du SI de la CNPS.", members: ["awa", "yao", "ibrahim", "mariam"], updated: "il y a 1 h", chats: 4, files: 9, routines: 1, artifacts: 2, public: false },
  { id: "oneci",   name: "Cybersécurité — ONECI",   emoji: "lock",           color: "#C0297A", desc: "Évaluation SOC et durcissement de l'infrastructure d'identité nationale.",     members: ["awa", "kofi", "ibrahim"],        updated: "hier",       chats: 3, files: 7, routines: 0, artifacts: 2, public: false },
  { id: "academy", name: "Open Digital Academy",    emoji: "graduation-cap", color: "#00C48C", desc: "Conception du parcours « Data Engineering » et évaluation des candidats.",      members: ["awa", "fatou", "mariam"],        updated: "il y a 2 j", chats: 5, files: 11, routines: 3, artifacts: 2, public: true  },
];

const CHATS: SyneliaData["CHATS"] = {
  coris: [
    { id: "c-synthese",    title: "Synthèse des constats d'audit", project: "coris", lastBy: "kofi",  preview: "Peux-tu consolider les 12 constats en une matrice de risques…",  updated: "maintenant",  live: true,  liveUser: "kofi",  liveState: "ai-typing",   participants: ["awa", "kofi", "fatou"], pinned: true },
    { id: "c-remediation", title: "Plan de remédiation priorisé",   project: "coris", lastBy: "awa",   preview: "Génère un plan en 3 vagues avec estimation de charge…",          updated: "il y a 35 min", live: false,                                    participants: ["awa", "yao"] },
    { id: "c-entretiens",  title: "Trame d'entretiens DSI",         project: "coris", lastBy: "fatou", preview: "Prépare 15 questions pour les responsables d'application…",       updated: "il y a 2 h",   live: true,  liveUser: "fatou", liveState: "user-typing", participants: ["awa", "fatou"] },
    { id: "c-conformite",  title: "Conformité PCI-DSS",             project: "coris", lastBy: "kofi",  preview: "Liste les écarts vis-à-vis du référentiel PCI-DSS v4…",            updated: "hier",         live: false,                                    participants: ["awa", "kofi"] },
    { id: "c-archi",       title: "Schéma d'architecture cible",    project: "coris", lastBy: "yao",   preview: "Décris l'architecture applicative cible en couches…",              updated: "il y a 2 j",   live: false,                                    participants: ["awa", "yao"] },
    { id: "c-budget",      title: "Cadrage budgétaire",             project: "coris", lastBy: "awa",   preview: "Estime le budget de mise en conformité sur 18 mois…",              updated: "il y a 3 j",   live: false,                                    participants: ["awa", "mariam"] },
  ],
  cnps: [], oneci: [], academy: [],
};

const ROUTINES_DATA: SyneliaData["ROUTINES"] = [
  { id: "r1", title: "Veille cybersécurité hebdo",          cadence: "Chaque lundi · 08:00",   owner: "kofi",   next: "Lun. 9 juin",  project: "coris",   icon: "radar",          status: "active", ago: "il y a 2 j", prompt: "Chaque lundi à 08:00, rédige une synthèse de veille cybersécurité de la semaine : 5 menaces ou vulnérabilités majeures (score CVSS si disponible), leur impact potentiel sur nos clients des secteurs bancaire et public, et une recommandation d'action concrète pour chacune. Termine par une note de priorisation.", runs: [] },
  { id: "r2", title: "Suivi des constats ouverts",           cadence: "Chaque vendredi · 17:00", owner: "awa",    next: "Ven. 6 juin",  project: "coris",   icon: "list-checks",    status: "active", ago: "il y a 6 h", prompt: "Chaque vendredi à 17:00, dresse l'état des constats d'audit encore ouverts sur le projet Coris Bank : nombre par niveau de criticité, constats clôturés dans la semaine, et les 3 constats critiques à surveiller en priorité. Présente un tableau de synthèse et conclus par le taux d'avancement global.", runs: [] },
  { id: "r3", title: "Synthèse d'avancement migration",      cadence: "Chaque jeudi · 16:00",   owner: "yao",    next: "Jeu. 11 juin", project: "cnps",    icon: "cloud-cog",      status: "active", ago: "il y a 1 j", prompt: "Chaque jeudi à 16:00, produis une synthèse d'avancement de la migration cloud de la CNPS : applications migrées dans la semaine, vague en cours, points de blocage, et prochaines bascules planifiées. Ton sobre, prêt à transmettre au COPIL.", runs: [] },
  { id: "r4", title: "Revue des candidatures reçues",         cadence: "Chaque lundi · 09:30",   owner: "mariam", next: "Lun. 9 juin",  project: "academy", icon: "users",          status: "paused", ago: "il y a 5 j", prompt: "Chaque lundi à 09:30, passe en revue les candidatures reçues pour le parcours Data Engineering : nombre de dossiers, répartition par profil, et présélection des candidats correspondant aux prérequis. Conclus par les entretiens à programmer.", runs: [] },
  { id: "r5", title: "Génération des supports de module",     cadence: "Chaque mercredi · 14:00", owner: "fatou",  next: "Mer. 10 juin", project: "academy", icon: "graduation-cap", status: "active", ago: "il y a 3 j", prompt: "Chaque mercredi à 14:00, génère le support du prochain module du parcours Data Engineering : objectifs pédagogiques, plan détaillé, exercices pratiques et grille d'évaluation. Format prêt à relire avant publication.", runs: [] },
  { id: "r6", title: "Rapport d'employabilité mensuel",       cadence: "1er du mois · 08:00",    owner: "mariam", next: "1 juil.",      project: "academy", icon: "bar-chart-3",    status: "active", ago: "il y a 5 j", prompt: "Le 1er de chaque mois à 08:00, compile le rapport d'employabilité de l'Open Digital Academy : taux d'insertion des dernières promotions, partenaires recruteurs, et indicateurs clés à présenter à la direction.", runs: [] },
];

const ARTIFACTS_DATA: SyneliaData["ARTIFACTS"] = [
  { id: "a1",  title: "Matrice de risques — 12 constats",        kind: "Document",  icon: "layout-grid",    creator: "kofi",    when: "maintenant",    project: "coris",   chat: "c-synthese",    live: true, shared: true },
  { id: "a2",  title: "Plan de remédiation (3 vagues)",           kind: "Tableur",   icon: "table-2",        creator: "awa",     when: "il y a 35 min", project: "coris",   chat: "c-remediation", shared: true },
  { id: "a3",  title: "Schéma d'architecture cible",               kind: "Diagramme", icon: "git-fork",       creator: "yao",     when: "il y a 2 j",    project: "coris",   chat: "c-archi" },
  { id: "a4",  title: "Note de synthèse — COPIL",                  kind: "Document",  icon: "file-text",      creator: "awa",     when: "il y a 3 j",    project: "coris",   chat: "c-budget",      shared: true },
  { id: "a5",  title: "Trame d'entretien DSI",                     kind: "Document",  icon: "messages-square", creator: "fatou",   when: "il y a 2 h",    project: "coris",   chat: "c-entretiens" },
  { id: "a6",  title: "Trajectoire de migration cloud",            kind: "Tableur",   icon: "cloud-cog",      creator: "yao",     when: "il y a 1 h",    project: "cnps" },
  { id: "a7",  title: "Cartographie applicative 6R",               kind: "Diagramme", icon: "network",        creator: "ibrahim", when: "hier",          project: "cnps",    shared: true },
  { id: "a8",  title: "Plan de durcissement SOC",                  kind: "Document",  icon: "shield-check",   creator: "kofi",    when: "hier",          project: "oneci" },
  { id: "a9",  title: "Évaluation des risques d'identité",         kind: "Document",  icon: "shield-alert",   creator: "ibrahim", when: "il y a 2 j",    project: "oneci" },
  { id: "a10", title: "Parcours Data Engineering — 8 modules",    kind: "Document",  icon: "graduation-cap", creator: "mariam",  when: "il y a 2 j",    project: "academy", shared: true },
  { id: "a11", title: "Grille d'évaluation des candidats",         kind: "Tableur",   icon: "list-checks",    creator: "fatou",   when: "il y a 4 j",    project: "academy" },
];

export const SYN: SyneliaData = {
  TEAM, ME, PROJECTS, CHATS,
  ROUTINES: ROUTINES_DATA,
  FILES: [],
  ARTIFACTS: ARTIFACTS_DATA,
  ACTIVITY: [],
  THREAD_SYNTHESE: [],
  LIVE_AI_REPLY: "",
  RISK_ROWS: [],
  PROMPT_CATS: [
{ id: "all",    label: "Tous",                icon: "library" },
  { id: "audit",  label: "Audit & Conseil",     icon: "clipboard-check" },
  { id: "cyber",  label: "Cybersécurité",       icon: "shield-check" },
  { id: "cloud",  label: "Cloud & Infra",       icon: "cloud" },
  { id: "data",   label: "Data & IA",           icon: "brain-circuit" },
  { id: "projet", label: "Gestion de projet",   icon: "kanban-square" },
  { id: "redac",  label: "Rédaction & Synthèse",icon: "pen-line" },
] as SyneliaData['PROMPT_CATS'],
  PROMPTS: [
{
    id: "p-matrice", title: "Matrice de risques d'audit", cat: "audit", icon: "layout-grid",
    author: "kofi", uses: 34, pinned: true, official: true,
    desc: "Consolide des constats d'audit en une matrice probabilité × impact, cotée et priorisée.",
    body: "À partir des constats d'audit fournis, construis une matrice de risques (probabilité × impact). Pour chaque constat : un intitulé, une cotation sur 4 niveaux (Faible, Modéré, Élevé, Critique), un propriétaire désigné et une recommandation de remédiation. Trie par criticité décroissante et mets en tête les constats critiques à porter au COPIL.",
  },
  {
    id: "p-remediation", title: "Plan de remédiation en vagues", cat: "audit", icon: "list-checks",
    author: "awa", uses: 21, official: true,
    desc: "Génère un plan de remédiation priorisé en 3 vagues avec estimation de charge.",
    body: "Génère un plan de remédiation priorisé en 3 vagues (quick wins, structurant, fond) à partir des constats. Pour chaque action : objectif, prérequis, estimation de charge en jours-homme, propriétaire et indicateur de suivi. Présente le tout sous forme de tableau et ajoute une synthèse des dépendances entre vagues.",
  },
  {
    id: "p-entretien", title: "Trame d'entretien DSI", cat: "audit", icon: "messages-square",
    author: "fatou", uses: 18,
    desc: "Prépare un guide d'entretien structuré pour les responsables d'application.",
    body: "Prépare une trame d'entretien de 15 questions pour les responsables d'application, regroupées en 3 volets : cartographie applicative, interfaces et flux de données, plans de continuité. Pour chaque question, indique l'objectif et un exemple de réponse attendue. Adapte le ton au contexte d'un audit SI bancaire.",
  },
  {
    id: "p-pcidss", title: "Analyse d'écarts PCI-DSS v4", cat: "cyber", icon: "shield-alert",
    author: "kofi", uses: 27, official: true,
    desc: "Liste les écarts vis-à-vis du référentiel PCI-DSS v4 et les exigences associées.",
    body: "Analyse les écarts de conformité vis-à-vis du référentiel PCI-DSS v4. Pour chaque exigence non couverte : numéro de l'exigence, description de l'écart, niveau de sévérité, preuve attendue et action corrective recommandée. Conclus par un taux de conformité global et les 5 priorités absolues.",
  },
  {
    id: "p-veille", title: "Veille cybersécurité hebdomadaire", cat: "cyber", icon: "radar",
    author: "kofi", uses: 41, pinned: true,
    desc: "Synthèse hebdo des menaces, vulnérabilités et recommandations pour l'équipe.",
    body: "Rédige une synthèse de veille cybersécurité de la semaine pour l'équipe : 5 menaces ou vulnérabilités majeures (avec score CVSS si disponible), leur impact potentiel sur nos clients du secteur bancaire et public, et une recommandation d'action concrète pour chacune. Termine par une note de priorisation.",
  },
  {
    id: "p-soc", title: "Plan de durcissement SOC", cat: "cyber", icon: "lock",
    author: "ibrahim", uses: 12,
    desc: "Recommandations de durcissement d'une infrastructure d'identité et de détection.",
    body: "Propose un plan de durcissement pour notre SOC et l'infrastructure d'identité associée : gestion des comptes à privilèges, segmentation réseau, journalisation et détection, sauvegarde et PRA. Structure en 3 horizons (immédiat, 90 jours, 6 mois) avec, pour chaque mesure, l'effort estimé et le risque couvert.",
  },
  {
    id: "p-trajectoire", title: "Trajectoire de migration cloud", cat: "cloud", icon: "cloud-cog",
    author: "yao", uses: 23, official: true,
    desc: "Construit une trajectoire de migration vers le cloud souverain par vagues d'applications.",
    body: "Construis une trajectoire de migration vers le cloud souverain à partir de l'inventaire applicatif. Classe les applications selon la stratégie 6R (rehost, replatform, refactor, repurchase, retain, retire), regroupe-les en vagues de migration et indique pour chaque vague les prérequis, les risques et les bénéfices attendus.",
  },
  {
    id: "p-archi", title: "Schéma d'architecture cible", cat: "cloud", icon: "git-fork",
    author: "yao", uses: 16,
    desc: "Décris une architecture applicative cible en couches, avec flux et composants.",
    body: "Décris l'architecture applicative cible en couches (présentation, services, données, intégration, sécurité). Pour chaque couche : composants clés, technologies recommandées, flux d'échange et points d'attention sécurité. Propose ensuite une représentation textuelle du schéma que je pourrai transformer en diagramme.",
  },
  {
    id: "p-eda", title: "Analyse exploratoire d'un jeu de données", cat: "data", icon: "bar-chart-3",
    author: "fatou", uses: 29, official: true,
    desc: "Cadre une analyse exploratoire : qualité, distributions, corrélations, pistes.",
    body: "À partir du jeu de données fourni, mène une analyse exploratoire : qualité et complétude des données, distributions des variables clés, corrélations notables, valeurs aberrantes. Conclus par 3 à 5 hypothèses ou pistes d'analyse à creuser, et les transformations de données nécessaires avant modélisation.",
  },
  {
    id: "p-parcours", title: "Parcours de formation Data Engineering", cat: "data", icon: "graduation-cap",
    author: "mariam", uses: 14,
    desc: "Conçoit un parcours de formation modulaire avec objectifs et évaluations.",
    body: "Conçois un parcours de formation « Data Engineering » de 8 modules pour l'Open Digital Academy. Pour chaque module : objectifs pédagogiques, prérequis, durée, compétences visées et modalité d'évaluation. Termine par une grille d'évaluation des candidats à l'entrée et un projet fil rouge.",
  },
  {
    id: "p-copil", title: "Note de synthèse pour COPIL", cat: "redac", icon: "file-text",
    author: "awa", uses: 38, pinned: true, official: true,
    desc: "Rédige une note de synthèse exécutive prête à présenter en comité de pilotage.",
    body: "Rédige une note de synthèse exécutive pour le COPIL à partir des éléments du projet : contexte en 3 lignes, avancement, 3 points saillants, risques et arbitrages attendus, et décisions à valider. Ton sobre et institutionnel, vouvoiement, maximum une page. Termine par les prochaines étapes datées.",
  },
  {
    id: "p-devis", title: "Cadrage budgétaire sur 18 mois", cat: "projet", icon: "calculator",
    author: "mariam", uses: 19,
    desc: "Estime un budget de mise en conformité réparti par poste et par trimestre.",
    body: "Estime le budget de mise en conformité sur 18 mois. Répartis les coûts par poste (RH internes, prestations, licences, infrastructure) et par trimestre. Distingue investissement et fonctionnement, ajoute une marge d'incertitude et propose 2 scénarios : ambitieux et prudent. Présente sous forme de tableau récapitulatif.",
  },
] as SyneliaData['PROMPTS'],
};

// ===== Compat API for the prior session's call sites =====
export function getMember(id: UserId | string): TeamMember | undefined { return TEAM[id as UserId]; }
export function getProject(slugOrId: string): Project | undefined { return PROJECTS.find((p) => p.id === slugOrId || p.name === slugOrId); }
export function getProjectChats(pid: ProjectId | string): Chat[] { return CHATS[pid as ProjectId] ?? []; }
export function getProjectArtifacts(pid: ProjectId | string): Artifact[] { return ARTIFACTS_DATA.filter((a) => a.project === pid); }
export function getProjectFiles(pid: ProjectId | string): ProjectFile[] { return SYN.FILES; }
export function getProjectRoutines(pid: ProjectId | string): Routine[] { return ROUTINES_DATA.filter((r) => r.project === pid); }
export function getProjectMembers(pid: ProjectId | string) { const p = getProject(pid as string); return p ? p.members : []; }
export function allChats(): Chat[] { return (Object.values(CHATS) as Chat[][]).flat(); }
export function projectNameOf(pid: ProjectId | string): string { return PROJECTS.find((p) => p.id === pid)?.name ?? String(pid); }

export const DEPARTMENT = { id: "data-ia", name: "Direction Data & IA", company: "Groupe Synelia", memberCount: 6, initials: "DDIA" };
export const KIND_VAR: Record<ArtifactKind, string> = {
  Document: "rgba(75,40,130,0.10)", Tableur: "rgba(0,196,140,0.10)", Diagramme: "rgba(0,174,239,0.10)",
};
export const KIND_TEXT: Record<ArtifactKind, string> = {
  Document: "#4B2882", Tableur: "#00936A", Diagramme: "#0086BB",
};

// Re-exports
export { ME, TEAM, PROJECTS, CHATS };
export const ARTIFACTS = ARTIFACTS_DATA;
export const ROUTINES = ROUTINES_DATA;
export type { Chat, ArtifactKind, TeamMember, UserId, Project, Routine, Artifact, ProjectFile, Prompt, PromptCategory, ChatMessage, RoutineRun, Activity, RiskRow, Role, ChatsByProject };
