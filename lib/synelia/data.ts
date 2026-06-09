// lib/synelia/data.ts
// This module is the **source of truth** for the mock data. The seed
// script (lib/synelia/seed.ts) reads SYN.* to populate the SQLite DB.
// The UI pages should NOT import from here — they import the live
// functions from "@/lib/synelia/queries" instead.
//
// The compat re-exports at the bottom let the prior session's call sites
// keep working: data.ts forwards queries.ts functions as plain values,
// so `import { getMember } from "@/lib/synelia/data"` still works.

import type {
  SyneliaData, Chat, ChatMessage, ChatId,
  TeamMember, Project, Routine, RoutineRun, Artifact, ArtifactKind,
  ProjectFile, Prompt, PromptCategory, ChatLiveState, RoutineStatus, Role,
  ProjectId, UserId, ChatsByProject, Activity, RiskRow, RiskLevel,
} from "./types";

// ===== Raw mock data (only seed.ts reads these) =====

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
  cnps: [
    { id: "c-migration-plan" as ChatId, title: "Trajectoire de migration par vagues", project: "cnps", lastBy: "yao", preview: "Propose une trajectoire de migration en 4 vagues avec critères…", updated: "il y a 1 h", live: false, participants: ["awa", "yao", "ibrahim"], pinned: true },
    { id: "c-archi-cible" as ChatId,    title: "Architecture cible cloud souverain",  project: "cnps", lastBy: "ibrahim", preview: "Décris l'architecture applicative cible pour le cloud souverain…", updated: "hier", live: false, participants: ["awa", "yao"] },
    { id: "c-budget-cnps" as ChatId,    title: "Estimation budgétaire migration",      project: "cnps", lastBy: "awa",     preview: "Estime le coût total de la migration sur 24 mois…",              updated: "il y a 2 j", live: false, participants: ["awa", "mariam"] },
  ],
  oneci: [
    { id: "c-soc-eval" as ChatId,    title: "Évaluation du SOC existant",         project: "oneci", lastBy: "kofi",    preview: "Analyse les capacités de détection et de réponse du SOC actuel…", updated: "hier", live: false, participants: ["awa", "kofi", "ibrahim"], pinned: true },
    { id: "c-durcissement" as ChatId, title: "Plan de durcissement identité",     project: "oneci", lastBy: "ibrahim", preview: "Définit les mesures de durcissement de l'infrastructure d'identité…", updated: "il y a 2 j", live: false, participants: ["awa", "kofi"] },
  ],
  academy: [
    { id: "c-cursus-data" as ChatId,    title: "Conception du parcours Data Engineering",     project: "academy", lastBy: "fatou",  preview: "Conçois un parcours de 8 modules pour les Data Engineers…",       updated: "il y a 1 j", live: false, participants: ["awa", "fatou", "mariam"], pinned: true },
    { id: "c-evaluation" as ChatId,     title: "Grille d'évaluation des candidats",            project: "academy", lastBy: "mariam", preview: "Crée une grille d'évaluation des compétences techniques et soft…", updated: "il y a 2 j", live: false, participants: ["awa", "mariam"] },
    { id: "c-employabilite" as ChatId,  title: "Rapport d'employabilité T1 2026",              project: "academy", lastBy: "awa",    preview: "Compile les indicateurs d'insertion pour la promo de mars 2026…",  updated: "il y a 3 j", live: false, participants: ["awa", "fatou"] },
  ],
};

const ROUTINES_DATA: SyneliaData["ROUTINES"] = [
  { id: "r1", title: "Veille cybersécurité hebdo",          cadence: "Chaque lundi · 08:00",    owner: "kofi",   next: "Lun. 9 juin",  project: "coris",   icon: "radar",          status: "active", ago: "il y a 2 j",
    prompt: "Chaque lundi à 08:00, rédige une synthèse de veille cybersécurité de la semaine : 5 menaces ou vulnérabilités majeures (score CVSS si disponible), leur impact potentiel sur nos clients des secteurs bancaire et public, et une recommandation d'action concrète pour chacune. Termine par une note de priorisation.",
    runs: [
      { title: "Veille du 2 juin 2026", date: "Lun. 2 juin · 08:04", ranFor: "1 min 42 s", thought: 3, output: "## Veille cybersécurité — semaine du 26 mai au 1er juin 2026\n\n**CVE-2026-31337** (CVSS 9.1) — Faille RCE dans OpenSSH 9.x. Impact élevé sur l'infrastructure des clients bancaires. **Recommandation** : patcher sous 48 h.\n\n**Ransomware LockBit 4.0** — Nouvelle vague ciblant les institutions financières africaines. **Recommandation** : renforcer les sauvegardes hors ligne et la segmentation réseau.\n\n**Credential stuffing OWA** — Tentatives massives sur les portails Exchange. **Recommandation** : activer l'authentification multifacteur sur tous les comptes.\n\n> Priorisation : CVE-2026-31337 > Ransomware > Credential stuffing" },
      { title: "Veille du 26 mai 2026", date: "Lun. 26 mai · 08:02", ranFor: "1 min 58 s", thought: 2, output: "## Veille cybersécurité — semaine du 19 au 25 mai 2026\n\n**CVE-2026-28890** (CVSS 8.4) — Faille d'élévation de privilèges Windows Server 2022. **Recommandation** : déployer KB5037849.\n\n**Phishing ciblé OFA** — Campagne de spear-phishing ciblant les DSI de banques ivoiriennes. **Recommandation** : sensibiliser les équipes et bloquer les domaines identifiés.\n\n> Priorisation : CVE-2026-28890 > Phishing OFA" },
    ]
  },
  { id: "r2", title: "Suivi des constats ouverts",           cadence: "Chaque vendredi · 17:00", owner: "awa",    next: "Ven. 6 juin",  project: "coris",   icon: "list-checks",    status: "active", ago: "il y a 6 h",
    prompt: "Chaque vendredi à 17:00, dresse l'état des constats d'audit encore ouverts sur le projet Coris Bank : nombre par niveau de criticité, constats clôturés dans la semaine, et les 3 constats critiques à surveiller en priorité. Présente un tableau de synthèse et conclus par le taux d'avancement global.",
    runs: [
      { title: "Rapport du 30 mai 2026", date: "Ven. 30 mai · 17:01", ranFor: "2 min 14 s", thought: 4, output: "## Suivi des constats — 30 mai 2026\n\n| Criticité | Ouverts | Clôturés cette semaine |\n|-----------|---------|------------------------|\n| Critique  | 3       | 1                      |\n| Élevé     | 4       | 2                      |\n| Moyen     | 3       | 0                      |\n| Faible    | 2       | 1                      |\n\n**Top 3 constats critiques à surveiller :**\n1. Absence de MFA sur les accès VPN administrateurs (C1)\n2. Politique de mots de passe non conforme PCI-DSS (C2)\n3. Journaux d'audit incomplets sur le système de paiement (C3)\n\n**Taux d'avancement global : 33 %** (4/12 constats clôturés)" },
      { title: "Rapport du 23 mai 2026", date: "Ven. 23 mai · 17:03", ranFor: "1 min 51 s", thought: 3, output: "## Suivi des constats — 23 mai 2026\n\n| Criticité | Ouverts | Clôturés cette semaine |\n|-----------|---------|------------------------|\n| Critique  | 4       | 0                      |\n| Élevé     | 6       | 1                      |\n| Moyen     | 3       | 0                      |\n| Faible    | 3       | 2                      |\n\n**Taux d'avancement global : 25 %** (3/12 constats clôturés)" },
      { title: "Rapport du 16 mai 2026", date: "Ven. 16 mai · 17:00", ranFor: "1 min 38 s", thought: 2, output: "## Suivi des constats — 16 mai 2026\n\nAudit démarré cette semaine. 12 constats identifiés, aucun clôturé.\n\n**Taux d'avancement global : 0 %**" },
    ]
  },
  { id: "r3", title: "Synthèse d'avancement migration",      cadence: "Chaque jeudi · 16:00",   owner: "yao",    next: "Jeu. 11 juin", project: "cnps",    icon: "cloud-cog",      status: "active", ago: "il y a 1 j",
    prompt: "Chaque jeudi à 16:00, produis une synthèse d'avancement de la migration cloud de la CNPS : applications migrées dans la semaine, vague en cours, points de blocage, et prochaines bascules planifiées. Ton sobre, prêt à transmettre au COPIL.",
    runs: [
      { title: "Synthèse du 5 juin 2026", date: "Jeu. 5 juin · 16:02", ranFor: "2 min 03 s", thought: 3, output: "## Avancement migration cloud CNPS — 5 juin 2026\n\n**Vague en cours :** Vague 1 — Applications non critiques (8/14 migrées)\n\n**Migrées cette semaine :** Portail RH, Messagerie interne\n\n**Points de blocage :**\n- Dépendance legacy sur le module paie (résolution prévue semaine 24)\n- Validation juridique du contrat hébergement souverain en attente\n\n**Prochaines bascules :** Gestion documentaire (12 juin), Intranet (19 juin)\n\n**Avancement global Vague 1 : 57 %**" },
      { title: "Synthèse du 29 mai 2026", date: "Jeu. 29 mai · 16:01", ranFor: "1 min 55 s", thought: 2, output: "## Avancement migration cloud CNPS — 29 mai 2026\n\n**Vague en cours :** Vague 1\n\n**Migrées cette semaine :** Annuaire LDAP, Service de monitoring\n\n**Avancement global Vague 1 : 43 %**" },
    ]
  },
  { id: "r4", title: "Revue des candidatures reçues",         cadence: "Chaque lundi · 09:30",   owner: "mariam", next: "Lun. 9 juin",  project: "academy", icon: "users",          status: "paused", ago: "il y a 5 j",
    prompt: "Chaque lundi à 09:30, passe en revue les candidatures reçues pour le parcours Data Engineering : nombre de dossiers, répartition par profil, et présélection des candidats correspondant aux prérequis. Conclus par les entretiens à programmer.",
    runs: [
      { title: "Revue du 2 juin 2026", date: "Lun. 2 juin · 09:31", ranFor: "1 min 22 s", thought: 2, output: "## Revue des candidatures — 2 juin 2026\n\n**Dossiers reçus :** 47 (+12 cette semaine)\n\n**Répartition :** 21 Data Analysts, 18 Data Engineers, 8 Data Scientists\n\n**Présélectionnés :** 14 candidats répondant aux prérequis techniques\n\n**Entretiens à programmer :** 8 pour la semaine du 9 juin (créneaux à confirmer avec Fatou)" },
    ]
  },
  { id: "r5", title: "Génération des supports de module",     cadence: "Chaque mercredi · 14:00", owner: "fatou",  next: "Mer. 10 juin", project: "academy", icon: "graduation-cap", status: "active", ago: "il y a 3 j",
    prompt: "Chaque mercredi à 14:00, génère le support du prochain module du parcours Data Engineering : objectifs pédagogiques, plan détaillé, exercices pratiques et grille d'évaluation. Format prêt à relire avant publication.",
    runs: [
      { title: "Module 5 — Pipelines de données", date: "Mer. 4 juin · 14:03", ranFor: "3 min 28 s", thought: 5, output: "## Module 5 : Pipelines de données (ETL/ELT)\n\n**Objectifs pédagogiques :**\n- Maîtriser les patterns ETL et ELT\n- Implémenter un pipeline avec Apache Airflow\n- Gérer la qualité des données en production\n\n**Plan (4 séances de 3 h) :**\n1. Concepts fondamentaux des pipelines de données\n2. Orchestration avec Apache Airflow\n3. Qualité et observabilité des données\n4. Projet fil rouge — pipeline end-to-end\n\n**Exercice pratique :** Construire un pipeline d'ingestion des données de ventes d'un retailer fictif." },
      { title: "Module 4 — SQL avancé & dbt", date: "Mer. 28 mai · 14:01", ranFor: "2 min 52 s", thought: 4, output: "## Module 4 : SQL avancé et dbt\n\n**Objectifs pédagogiques :**\n- Maîtriser les fonctions analytiques SQL\n- Utiliser dbt pour la transformation des données\n- Documenter et tester les modèles\n\n**Plan :** 4 séances de 3 h couvrant les CTEs, window functions, dbt core et tests.\n\n**Exercice pratique :** Modéliser un entrepôt de données e-commerce avec dbt." },
      { title: "Module 3 — Python pour la data", date: "Mer. 21 mai · 14:00", ranFor: "2 min 41 s", thought: 3, output: "## Module 3 : Python pour la data\n\n**Objectifs :** Pandas, NumPy, visualisation avec Matplotlib/Seaborn.\n\n**Plan :** 4 séances couvrant la manipulation de DataFrames, l'analyse exploratoire et la visualisation." },
    ]
  },
  { id: "r6", title: "Rapport d'employabilité mensuel",       cadence: "1er du mois · 08:00",    owner: "mariam", next: "1 juil.",      project: "academy", icon: "bar-chart-3",    status: "active", ago: "il y a 5 j",
    prompt: "Le 1er de chaque mois à 08:00, compile le rapport d'employabilité de l'Open Digital Academy : taux d'insertion des dernières promotions, partenaires recruteurs, et indicateurs clés à présenter à la direction.",
    runs: [
      { title: "Rapport de juin 2026", date: "Lun. 1 juin · 08:02", ranFor: "2 min 09 s", thought: 3, output: "## Rapport d'employabilité — juin 2026\n\n**Promo mars 2026 (32 diplômés) :**\n- Taux d'insertion à 3 mois : **87.5 %** (28/32)\n- Délai médian d'embauche : 6 semaines\n- Salaire médian à l'embauche : 680 000 FCFA / mois\n\n**Partenaires recruteurs actifs :** Orange CI, MTN, BNI, Ecobank, Wave\n\n**Indicateurs clés :**\n- NPS entreprises partenaires : +68\n- Taux de recommandation des diplômés : 94 %\n\n**Objectif juillet :** Signer 2 nouveaux partenariats (Société Générale CI, Jumia)." },
    ]
  },
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

const THREAD_SYNTHESE_DATA: ChatMessage[] = [
  { id: "m1", author: "kofi",  role: "user",      at: "10:02", text: "On a passé la matinée à interviewer les responsables d'application. 12 constats ressortent, mais ils sont éclatés dans les notes de chacun. Peux-tu me faire une **matrice de risques unique** que je puisse partager avec le DSI vendredi ?" },
  { id: "m2", author: "ai",    role: "assistant", at: "10:05", text: "Bien reçu. Je croise les 12 constats avec ta bibliothèque de risques d'audit. Voici la matrice consolidée, par famille et cotation :" },
  { id: "m3", author: "kofi",  role: "user",      at: "10:07", text: "Oui, parfait. Ajoute une colonne « propriétaire » et une cotation sur 4 niveaux. Priorise pour le COPIL de vendredi." },
];

const PROMPT_CATS_DATA: SyneliaData["PROMPT_CATS"] = [
  { id: "all",    label: "Tous",                  icon: "library",          count: 12 },
  { id: "audit",  label: "Audit & Conformité",    icon: "shield-check",     count: 3 },
  { id: "cyber",  label: "Cybersécurité",         icon: "shield-alert",     count: 2 },
  { id: "cloud",  label: "Cloud & Architecture",  icon: "cloud-cog",        count: 2 },
  { id: "data",   label: "Data & IA",             icon: "brain-circuit",    count: 2 },
  { id: "rh",     label: "People & Academy",      icon: "graduation-cap",   count: 2 },
  { id: "ops",    label: "Opérations & Routines", icon: "repeat",           count: 1 },
];

const PROMPTS_DATA: SyneliaData["PROMPTS"] = [
  { id: "p-matrice",      title: "Matrice de risques d'audit",          cat: "audit", icon: "shield-check",    author: "awa",  uses: 34, pinned: true,  official: true,  desc: "Consolide des constats d'audit en une matrice de risques unique avec cotation, propriétaire et priorité.", body: "Tu es consultant senior en audit SI. On te fournit une liste de constats d'audit (format libre). Produis une matrice unique avec :\n\n1. Pour chaque constat : famille, cotation (1-4), niveau de risque (critique/élevé/moyen/faible), propriétaire suggéré\n2. Regroupe par famille de risque\n3. Termine par un top 3 des constats critiques à présenter en COPIL" },
  { id: "p-remediation",  title: "Plan de remédiation en vagues",        cat: "audit", icon: "list-checks",     author: "awa",  uses: 21, pinned: true,  official: true,  desc: "Génère un plan de remédiation en 3 vagues avec estimation de charge et dépendances.",            body: "Tu es chef de projet SI. À partir d'une matrice de risques d'audit, propose un plan de remédiation structuré en 3 vagues sur 18 mois :\n\n1. Vague 1 (mois 1-3) : quick wins, risques critiques, blocage des fuites immédiates\n2. Vague 2 (mois 4-12) : risques élevés, refonte des processus sensibles\n3. Vague 3 (mois 13-18) : risques moyens, mise en conformité durable\nPour chaque vague : chantiers, charge estimée en j/h, dépendances, et indicateurs de succès." },
  { id: "p-entretien",    title: "Trame d'entretien DSI",                cat: "audit", icon: "messages-square", author: "awa",  uses: 18, pinned: false, official: true,  desc: "Trame d'entretien semi-directif pour les responsables d'application, orientée audit SI.",           body: "Tu es consultant en audit SI. Prépare une trame d'entretien de 45 minutes pour un DSI d'un grand compte bancaire ivoirien. 15 questions ouvertes réparties en 4 axes :\n\n1. Gouvernance SI (5 questions)\n2. Sécurité et continuité (4 questions)\n3. Urbanisation et dette technique (3 questions)\n4. Relation métier / DSI (3 questions)\n\nPour chaque question, précise l'objectif de l'information recherchée et les relances possibles." },
  { id: "p-pcidss",       title: "Analyse d'écarts PCI-DSS v4",          cat: "cyber", icon: "shield-alert",    author: "kofi", uses: 27, pinned: true,  official: true,  desc: "Liste les écarts entre ton environnement et le référentiel PCI-DSS v4, par exigence.",           body: "Tu es expert cybersécurité PCI-DSS v4. À partir d'un brief décrivant l'environnement (réseau, applicatif, organisation), liste les écarts entre l'existant et le référentiel PCI-DSS v4. Pour chaque écart : exigence, niveau (SAQ/AOC/Rapport), constat, recommandation, priorité." },
  { id: "p-veille",       title: "Veille cybersécurité hebdomadaire",    cat: "cyber", icon: "radar",           author: "kofi", uses: 41, pinned: true,  official: true,  desc: "Synthèse hebdomadaire des 5 principales menaces ou vulnérabilités de la semaine.",              body: "Tu es RSSI d'un grand groupe africain. Chaque lundi matin, produis une synthèse de veille cybersécurité de la semaine écoulée : 5 menaces ou vulnérabilités majeures (score CVSS si disponible), impact potentiel sur tes clients (banque, télécom, secteur public), et une recommandation d'action concrète pour chacune. Termine par une note de priorisation sur 4 niveaux." },
  { id: "p-cartographie", title: "Cartographie applicative 6R",          cat: "cloud", icon: "network",         author: "yao",  uses: 12, pinned: false, official: true,  desc: "Cartographie applicative avec classification 6R (Rehost, Replatform, Refactor, Repurchase, Retire, Retain).", body: "Tu es architecte SI d'un grand compte. À partir d'un inventaire d'applications (nom, techno, volumétrie, criticité, propriétaire), propose une cartographie applicative 6R :\n\n1. Pour chaque application :\n   - Recommandation 6R (Rehost / Replatform / Refactor / Repurchase / Retire / Retain)\n   - Justification courte\n   - Horizon suggéré (court / moyen / long terme)\n2. Synthèse par famille applicative\n3. Top 3 des quick wins de migration" },
  { id: "p-migration",    title: "Plan de migration cloud par vagues",   cat: "cloud", icon: "cloud-cog",       author: "yao",  uses: 9,  pinned: false, official: false, desc: "Trajectoire de migration cloud par vagues successives avec critères de sortie et bascule.",        body: "Tu es architecte cloud souverain. À partir d'une cartographie applicative 6R, propose une trajectoire de migration en 4 vagues :\n\n1. Pour chaque vague : applications concernées, critères d'entrée, conditions de sortie, plan de bascule, plan de retour arrière\n2. Verrous techniques et organisationnels\n3. Indicateurs de succès" },
  { id: "p-prompts",      title: "Générateur de prompts de cadrage",      cat: "data",  icon: "brain-circuit",   author: "fatou", uses: 22, pinned: false, official: true,  desc: "Crée des prompts structurés pour cadrer un projet Data ou IA en 5 axes : objectif, données, livrables, …", body: "Tu es Data Scientist senior en charge du cadrage projet. À partir d'une description libre d'un projet Data/IA, propose un cadrage structuré :\n\n1. Objectif métier et critères de succès\n2. Données disponibles et qualité attendue\n3. Approche technique recommandée (modèles, infrastructures)\n4. Livrables et jalons\n5. Risques et points d'attention\nFormat prêt à intégrer dans une fiche projet." },
  { id: "p-dataviz",      title: "Recommandations dataviz & dashboard",  cat: "data",  icon: "bar-chart-3",     author: "fatou", uses: 14, pinned: false, official: false, desc: "Recommande les visualisations les plus adaptées pour un dataset et un message.",                  body: "Tu es expert en dataviz. À partir d'un dataset (description des colonnes, volumétrie) et d'un message à faire passer, recommande les visualisations les plus adaptées. Pour chaque recommandation : type de chart, encodage, axes, insights clés à mettre en avant. Justifie en t'appuyant sur les principes de Tufte et Few." },
  { id: "p-cursus",       title: "Conception d'un parcours de formation", cat: "rh",    icon: "graduation-cap",  author: "mariam", uses: 7, pinned: false, official: true,  desc: "Conçois un parcours de formation Data/IA de 8 à 12 modules avec progression pédagogique.",         body: "Tu es responsable pédagogique d'une academy Data/IA. Conçois un parcours de formation de 8 à 12 modules pour un public cible (débutant/intermédiaire/avancé). Pour chaque module :\n\n1. Objectifs pédagogiques\n2. Prérequis\n3. Plan détaillé (4 à 8 séances de 3h)\n4. Exercices pratiques et projet fil rouge\n5. Grille d'évaluation" },
  { id: "p-entretien-rh", title: "Trame d'entretien candidat Data",      cat: "rh",    icon: "users",           author: "mariam", uses: 11, pinned: false, official: false, desc: "Trame d'entretien 45 min pour évaluer un candidat Data Engineer/Analyst/Scientist.",              body: "Tu es DRH d'une academy Data. Prépare une trame d'entretien de 45 min pour évaluer un candidat à un parcours Data Engineering. Structure :\n\n1. Mise en confiance (5 min)\n2. Parcours et motivations (10 min)\n3. Test technique court (15 min)\n4. Aptitudes relationnelles (10 min)\n5. Questions candidat et clôture (5 min)\n\nPour chaque section : objectifs et questions de relance." },
  { id: "p-routine",      title: "Routine de revue hebdomadaire",         cat: "ops",   icon: "repeat",          author: "awa",  uses: 6,  pinned: false, official: false, desc: "Routine récurrente : génère une revue hebdomadaire des projets en cours avec avancement et blocages.", body: "Tu es lead PMO. Chaque vendredi à 17:00, compile une revue hebdomadaire des projets en cours :\n\n1. Avancement par projet (% global, jalons franchis, jalons glissés)\n2. Risques et blocages identifiés\n3. Décisions à prendre la semaine suivante\n4. Charge par équipe\nFormat prêt à diffuser à la direction." },
];

const RISK_ROWS_DATA: SyneliaData["RISK_ROWS"] = [
  { c: "Absence d'authentification multifacteur sur les accès VPN administrateurs", fam: "Contrôle d'accès", cote: "C1", lvl: "crit", owner: "Yao" },
  { c: "Politique de mots de passe non conforme aux exigences PCI-DSS v4", fam: "Contrôle d'accès", cote: "C2", lvl: "crit", owner: "Kofi" },
  { c: "Journaux d'audit incomplets sur le système de traitement des paiements", fam: "Traçabilité", cote: "C3", lvl: "crit", owner: "Yao" },
  { c: "Absence de chiffrement des données sensibles au repos dans la base Oracle", fam: "Protection des données", cote: "C4", lvl: "high", owner: "Fatou" },
  { c: "Correctifs de sécurité non appliqués sur 4 serveurs Windows Server 2019", fam: "Gestion des vulnérabilités", cote: "C5", lvl: "high", owner: "Yao" },
  { c: "Cloisonnement réseau insuffisant entre la zone de production et la DMZ", fam: "Architecture réseau", cote: "C6", lvl: "high", owner: "Ibrahim" },
  { c: "Droits d'accès excessifs accordés à 12 comptes utilisateurs de service", fam: "Contrôle d'accès", cote: "C7", lvl: "high", owner: "Kofi" },
  { c: "Absence de procédure formalisée de réponse aux incidents de sécurité", fam: "Gouvernance", cote: "C8", lvl: "med", owner: "Awa" },
  { c: "Tests d'intrusion non réalisés depuis plus de 18 mois", fam: "Gestion des vulnérabilités", cote: "C9", lvl: "med", owner: "Kofi" },
  { c: "Documentation de l'architecture applicative absente ou obsolète", fam: "Documentation", cote: "C10", lvl: "med", owner: "Yao" },
  { c: "Sauvegardes non testées depuis 6 mois — RPO non garanti", fam: "Continuité d'activité", cote: "C11", lvl: "low", owner: "Ibrahim" },
  { c: "Absence de politique de classification des actifs informationnels", fam: "Gouvernance", cote: "C12", lvl: "low", owner: "Awa" },
];

const LIVE_AI_REPLY_DATA = "Voici la matrice consolidée des 12 constats d'audit, classés par famille et niveau de criticité…";

export const SYN: SyneliaData = {
  TEAM, ME, PROJECTS, CHATS,
  ROUTINES: ROUTINES_DATA,
  FILES: [],
  ARTIFACTS: ARTIFACTS_DATA,
  ACTIVITY: [],
  THREAD_SYNTHESE: THREAD_SYNTHESE_DATA,
  LIVE_AI_REPLY: LIVE_AI_REPLY_DATA,
  RISK_ROWS: RISK_ROWS_DATA,
  PROMPT_CATS: PROMPT_CATS_DATA,
  PROMPTS: PROMPTS_DATA,
};

// ===== Compat shims for the prior session's call sites =====
//
// The data in this module is the **mock** — it's what the seed script
// writes to the DB and what the UI renders if the live loader in
// queries.ts hasn't warmed up yet. The live loader reads from SQLite
// and is the source of truth at runtime.
//
// UI pages should import the live-data functions from
// "@/lib/synelia/queries" (e.g. `getProjectChats(pid)`) and the static
// snapshots from this module (e.g. `PROJECTS`, `ARTIFACTS`). The seed
// script imports `SYN` from this module.
//
// Both paths serve the same data; the live loader is a 30s-cached read
// from the same SQLite DB that the seed populates from these consts.

export const DEPARTMENT = { id: "data-ia", name: "Direction Data & IA", company: "Groupe Synelia", memberCount: 6, initials: "DDIA" };
export const KIND_VAR: Record<ArtifactKind, string> = {
  Document: "rgba(75,40,130,0.10)", Tableur: "rgba(0,196,140,0.10)", Diagramme: "rgba(0,174,239,0.10)",
};
export const KIND_TEXT: Record<ArtifactKind, string> = {
  Document: "#4B2882", Tableur: "#00936A", Diagramme: "#0086BB",
};
// Re-export the static snapshots (mock data — same shape as the live
// loader returns, so the UI doesn't care which it imports).
export { PROJECTS, CHATS, ME, TEAM, ARTIFACTS_DATA as ARTIFACTS, ROUTINES_DATA as ROUTINES };
// Function-shaped API (mock-data implementations — replaced by live
// loader in queries.ts once a server component awaits `ensureLoaded()`).
// Pages can call these and they'll return the mock data, which is good
// enough for server-rendered pages. After a real DB write, the
// queries.ts loader returns the updated data and these can be ignored.
export function getMember(id: UserId | string): TeamMember | undefined { return TEAM[id as UserId]; }
export function getProject(slugOrId: string): Project | undefined { return PROJECTS.find((p) => p.id === slugOrId || p.name === slugOrId); }
export function getProjectChats(pid: ProjectId | string): Chat[] { return CHATS[pid as ProjectId] ?? []; }
export function getProjectArtifacts(pid: ProjectId | string): typeof ARTIFACTS_DATA { return ARTIFACTS_DATA.filter((a) => a.project === pid); }
export function getProjectFiles(_pid: ProjectId | string): typeof SYN["FILES"] { return []; }
export function getProjectRoutines(pid: ProjectId | string): typeof ROUTINES_DATA { return ROUTINES_DATA.filter((r) => r.project === pid); }
export function getProjectMembers(pid: ProjectId | string): Project["members"] { const p = getProject(pid as string); return p ? p.members : []; }
export function allChats(): Chat[] { return (Object.values(CHATS) as Chat[][]).flat(); }
export function projectNameOf(pid: ProjectId | string): string { return PROJECTS.find((p) => p.id === pid)?.name ?? String(pid); }

// Types
export type {
  SyneliaData, TeamMember, Project, Chat, ChatMessage, ChatId,
  Routine, RoutineRun, Artifact, ArtifactKind, ProjectFile,
  Prompt, PromptCategory, ChatLiveState, RoutineStatus, Role,
  ProjectId, UserId, ChatsByProject, Activity, RiskRow, RiskLevel,
} from "./types";
