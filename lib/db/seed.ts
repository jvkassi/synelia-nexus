import { config } from "dotenv";
import { createHash } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, inArray } from "drizzle-orm";
import postgres from "postgres";

import {
  chat,
  document,
  message,
  project,
  projectFile,
  projectMember,
  prompt,
  routine,
  routineRun,
  stream,
  user,
  vote,
  workspace,
  workspaceMember,
} from "./schema";
import { generateHashedPassword } from "./utils";

config({
  path: ".env.local",
});

function uuidFor(key: string): string {
  const hex = createHash("sha1")
    .update("synelia-cowork:" + key)
    .digest("hex")
    .slice(0, 32);
  const arr = hex.split("");
  arr[12] = "5";
  return `${arr.slice(0, 8).join("")}-${arr.slice(8, 12).join("")}-${arr
    .slice(12, 16)
    .join("")}-${arr.slice(16, 20).join("")}-${arr.slice(20, 32).join("")}`;
}

const TEAM = [
  { key: "awa", email: "awa@synelia.tech", name: "Awa Koné" },
  { key: "kofi", email: "kofi@synelia.tech", name: "Kofi Mensah" },
  { key: "fatou", email: "fatou@synelia.tech", name: "Fatou Diabaté" },
  { key: "yao", email: "yao@synelia.tech", name: "Yao N'Guessan" },
  {
    key: "mariam",
    email: "mariam@synelia.tech",
    name: "Mariam Touré",
  },
  {
    key: "ibrahim",
    email: "ibrahim@synelia.tech",
    name: "Ibrahim Coulibaly",
  },
];

const PROJECTS_DATA = [
  {
    key: "coris",
    name: "Audit SI — Coris Bank",
    desc: "Audit du système d'information et plan de remédiation pour Coris Bank CI.",
    icon: "shield-check",
    color: "#4B2882",
    members: ["awa", "kofi", "fatou", "yao"],
    public: false,
  },
  {
    key: "cnps",
    name: "Migration Cloud — CNPS",
    desc: "Trajectoire de migration vers le cloud souverain et urbanisation du SI de la CNPS.",
    icon: "cloud",
    color: "#6B3FA0",
    members: ["awa", "yao", "ibrahim", "mariam"],
    public: false,
  },
  {
    key: "oneci",
    name: "Cybersécurité — ONECI",
    desc: "Évaluation SOC et durcissement de l'infrastructure d'identité nationale.",
    icon: "lock",
    color: "#C0297A",
    members: ["awa", "kofi", "ibrahim"],
    public: false,
  },
  {
    key: "academy",
    name: "Open Digital Academy",
    desc: "Conception du parcours « Data Engineering » et évaluation des candidats.",
    icon: "graduation-cap",
    color: "#00C48C",
    members: ["awa", "fatou", "mariam"],
    public: true,
  },
];

const CHATS_CORIS = [
  {
    id: "c-synthese",
    title: "Synthèse des constats d'audit",
    lastBy: "kofi",
    hoursAgo: 0,
  },
  {
    id: "c-remediation",
    title: "Plan de remédiation priorisé",
    lastBy: "awa",
    hoursAgo: 0.6,
  },
  {
    id: "c-entretiens",
    title: "Trame d'entretiens DSI",
    lastBy: "fatou",
    hoursAgo: 2,
  },
  {
    id: "c-conformite",
    title: "Conformité PCI-DSS",
    lastBy: "kofi",
    hoursAgo: 26,
  },
  {
    id: "c-archi",
    title: "Schéma d'architecture cible",
    lastBy: "yao",
    hoursAgo: 50,
  },
  {
    id: "c-budget",
    title: "Cadrage budgétaire",
    lastBy: "awa",
    hoursAgo: 74,
  },
];

const THREAD_SYNTHESE = [
  {
    id: "m1",
    author: "fatou",
    role: "user",
    minutesAgo: 18,
    text: "Voici les notes d'entretien et l'inventaire applicatif. On a relevé une douzaine de constats pendant la phase terrain.",
  },
  {
    id: "m2",
    author: "ai",
    role: "assistant",
    minutesAgo: 17,
    text: "Bien reçu. J'ai parcouru les notes et l'inventaire. Je relève 12 constats que je peux regrouper en 4 familles : gouvernance des accès, obsolescence applicative, sauvegarde/PRA, et conformité PCI-DSS. Souhaitez-vous que je les consolide dans une matrice de risques ?",
  },
  {
    id: "m3",
    author: "kofi",
    role: "user",
    minutesAgo: 15,
    text: "Oui, parfait. Ajoute une colonne « propriétaire » et une cotation sur 4 niveaux. Priorise pour le COPIL de vendredi.",
  },
];

const PROMPTS_DATA = [
  {
    key: "p-matrice",
    title: "Matrice de risques d'audit",
    cat: "audit",
    icon: "layout-grid",
    author: "kofi",
    uses: 34,
    pinned: true,
    official: true,
    desc: "Consolide des constats d'audit en une matrice probabilité × impact, cotée et priorisée.",
    body: "À partir des constats d'audit fournis, construis une matrice de risques (probabilité × impact). Pour chaque constat : un intitulé, une cotation sur 4 niveaux (Faible, Modéré, Élevé, Critique), un propriétaire désigné et une recommandation de remédiation. Trie par criticité décroissante et mets en tête les constats critiques à porter au COPIL.",
  },
  {
    key: "p-remediation",
    title: "Plan de remédiation en vagues",
    cat: "audit",
    icon: "list-checks",
    author: "awa",
    uses: 21,
    official: true,
    desc: "Génère un plan de remédiation priorisé en 3 vagues avec estimation de charge.",
    body: "Génère un plan de remédiation priorisé en 3 vagues (quick wins, structurant, fond) à partir des constats. Pour chaque action : objectif, prérequis, estimation de charge en jours-homme, propriétaire et indicateur de suivi. Présente le tout sous forme de tableau et ajoute une synthèse des dépendances entre vagues.",
  },
  {
    key: "p-entretien",
    title: "Trame d'entretien DSI",
    cat: "audit",
    icon: "messages-square",
    author: "fatou",
    uses: 18,
    desc: "Prépare un guide d'entretien structuré pour les responsables d'application.",
    body: "Prépare une trame d'entretien de 15 questions pour les responsables d'application, regroupées en 3 volets : cartographie applicative, interfaces et flux de données, plans de continuité. Pour chaque question, indique l'objectif et un exemple de réponse attendue. Adapte le ton au contexte d'un audit SI bancaire.",
  },
  {
    key: "p-pcidss",
    title: "Analyse d'écarts PCI-DSS v4",
    cat: "cyber",
    icon: "shield-alert",
    author: "kofi",
    uses: 27,
    official: true,
    desc: "Liste les écarts vis-à-vis du référentiel PCI-DSS v4 et les exigences associées.",
    body: "Analyse les écarts de conformité vis-à-vis du référentiel PCI-DSS v4. Pour chaque exigence non couverte : numéro de l'exigence, description de l'écart, niveau de sévérité, preuve attendue et action corrective recommandée. Conclus par un taux de conformité global et les 5 priorités absolues.",
  },
  {
    key: "p-veille",
    title: "Veille cybersécurité hebdomadaire",
    cat: "cyber",
    icon: "radar",
    author: "kofi",
    uses: 41,
    pinned: true,
    desc: "Synthèse hebdo des menaces, vulnérabilités et recommandations pour l'équipe.",
    body: "Rédige une synthèse de veille cybersécurité de la semaine pour l'équipe : 5 menaces ou vulnérabilités majeures (avec score CVSS si disponible), leur impact potentiel sur nos clients du secteur bancaire et public, et une recommandation d'action concrète pour chacune. Termine par une note de priorisation.",
  },
  {
    key: "p-soc",
    title: "Plan de durcissement SOC",
    cat: "cyber",
    icon: "lock",
    author: "ibrahim",
    uses: 12,
    desc: "Recommandations de durcissement d'une infrastructure d'identité et de détection.",
    body: "Propose un plan de durcissement pour notre SOC et l'infrastructure d'identité associée : gestion des comptes à privilèges, segmentation réseau, journalisation et détection, sauvegarde et PRA. Structure en 3 horizons (immédiat, 90 jours, 6 mois) avec, pour chaque mesure, l'effort estimé et le risque couvert.",
  },
  {
    key: "p-trajectoire",
    title: "Trajectoire de migration cloud",
    cat: "cloud",
    icon: "cloud-cog",
    author: "yao",
    uses: 23,
    official: true,
    desc: "Construit une trajectoire de migration vers le cloud souverain par vagues d'applications.",
    body: "Construis une trajectoire de migration vers le cloud souverain à partir de l'inventaire applicatif. Classe les applications selon la stratégie 6R (rehost, replatform, refactor, repurchase, retain, retire), regroupe-les en vagues de migration et indique pour chaque vague les prérequis, les risques et les bénéfices attendus.",
  },
  {
    key: "p-archi",
    title: "Schéma d'architecture cible",
    cat: "cloud",
    icon: "git-fork",
    author: "yao",
    uses: 16,
    desc: "Décris une architecture applicative cible en couches, avec flux et composants.",
    body: "Décris l'architecture applicative cible en couches (présentation, services, données, intégration, sécurité). Pour chaque couche : composants clés, technologies recommandées, flux d'échange et points d'attention sécurité. Propose ensuite une représentation textuelle du schéma que je pourrai transformer en diagramme.",
  },
  {
    key: "p-eda",
    title: "Analyse exploratoire d'un jeu de données",
    cat: "data",
    icon: "bar-chart-3",
    author: "fatou",
    uses: 29,
    official: true,
    desc: "Cadre une analyse exploratoire : qualité, distributions, corrélations, pistes.",
    body: "À partir du jeu de données fourni, mène une analyse exploratoire : qualité et complétude des données, distributions des variables clés, corrélations notables, valeurs aberrantes. Conclus par 3 à 5 hypothèses ou pistes d'analyse à creuser, et les transformations de données nécessaires avant modélisation.",
  },
  {
    key: "p-parcours",
    title: "Parcours de formation Data Engineering",
    cat: "data",
    icon: "graduation-cap",
    author: "mariam",
    uses: 14,
    desc: "Conçoit un parcours de formation modulaire avec objectifs et évaluations.",
    body: "Conçois un parcours de formation « Data Engineering » de 8 modules pour l'Open Digital Academy. Pour chaque module : objectifs pédagogiques, prérequis, durée, compétences visées et modalité d'évaluation. Termine par une grille d'évaluation des candidats à l'entrée et un projet fil rouge.",
  },
  {
    key: "p-copil",
    title: "Note de synthèse pour COPIL",
    cat: "redac",
    icon: "file-text",
    author: "awa",
    uses: 38,
    pinned: true,
    official: true,
    desc: "Rédige une note de synthèse exécutive prête à présenter en comité de pilotage.",
    body: "Rédige une note de synthèse exécutive pour le COPIL à partir des éléments du projet : contexte en 3 lignes, avancement, 3 points saillants, risques et arbitrages attendus, et décisions à valider. Ton sobre et institutionnel, vouvoiement, maximum une page. Termine par les prochaines étapes datées.",
  },
  {
    key: "p-devis",
    title: "Cadrage budgétaire sur 18 mois",
    cat: "projet",
    icon: "calculator",
    author: "mariam",
    uses: 19,
    desc: "Estime un budget de mise en conformité réparti par poste et par trimestre.",
    body: "Estime le budget de mise en conformité sur 18 mois. Répartis les coûts par poste (RH internes, prestations, licences, infrastructure) et par trimestre. Distingue investissement et fonctionnement, ajoute une marge d'incertitude et propose 2 scénarios : ambitieux et prudent. Présente sous forme de tableau récapitulatif.",
  },
];

const ROUTINES_DATA = [
  {
    key: "r1",
    title: "Veille cybersécurité hebdo",
    cadenceLabel: "Chaque lundi · 08:00",
    cadenceCron: "0 8 * * 1",
    icon: "radar",
    status: "active",
    owner: "kofi",
    project: "coris",
    prompt:
      "Chaque lundi à 08:00, rédige une synthèse de veille cybersécurité de la semaine : 5 menaces ou vulnérabilités majeures (score CVSS si disponible), leur impact potentiel sur nos clients des secteurs bancaire et public, et une recommandation d'action concrète pour chacune. Termine par une note de priorisation.",
    runs: [
      {
        title: "Veille — semaine 23",
        daysAgo: 3,
        ranForSec: 8.4,
        output:
          "**Synthèse de veille — 5 vulnérabilités majeures**\n\n1. **CVE-2026-1180** — Citrix NetScaler · CVSS 9.8 — exécution de code à distance, exploitée activement.\n2. **CVE-2026-0934** — Fortinet FortiOS · CVSS 8.6 — contournement d'authentification.\n3. **CVE-2026-0712** — Apache Struts · CVSS 8.1 — désérialisation non sécurisée.\n4. **CVE-2026-0588** — OpenSSL · CVSS 7.4 — fuite mémoire sous charge.\n5. **CVE-2026-0461** — VMware vCenter · CVSS 7.2 — élévation de privilèges.\n\n**Priorisation**\n\nAppliquer les correctifs NetScaler et FortiOS sous 48 h.",
      },
      {
        title: "Veille — semaine 22",
        daysAgo: 10,
        ranForSec: 7.1,
        output:
          "**Synthèse de veille — semaine calme**\n\nAucune vulnérabilité critique exploitée activement cette semaine.",
      },
    ],
  },
  {
    key: "r2",
    title: "Suivi des constats ouverts",
    cadenceLabel: "Chaque vendredi · 17:00",
    cadenceCron: "0 17 * * 5",
    icon: "list-checks",
    status: "active",
    owner: "awa",
    project: "coris",
    prompt:
      "Chaque vendredi à 17:00, dresse l'état des constats d'audit encore ouverts sur le projet Coris Bank : nombre par niveau de criticité, constats clôturés dans la semaine, et les 3 constats critiques à surveiller en priorité.",
    runs: [
      {
        title: "État au 5 juin",
        daysAgo: 2,
        ranForSec: 5.9,
        output:
          "**Constats ouverts : 7 sur 12**\n\n- Critiques : 2\n- Élevés : 3\n- Modérés : 2\n\n**Avancement global : 42 %**",
      },
      {
        title: "État au 29 mai",
        daysAgo: 9,
        ranForSec: 6.2,
        output:
          "**Constats ouverts : 9 sur 12**\n\n- Critiques : 3\n- Élevés : 4\n- Modérés : 2\n\n**Avancement global : 25 %**",
      },
    ],
  },
  {
    key: "r3",
    title: "Synthèse d'avancement migration",
    cadenceLabel: "Chaque jeudi · 16:00",
    cadenceCron: "0 16 * * 4",
    icon: "cloud-cog",
    status: "active",
    owner: "yao",
    project: "cnps",
    prompt:
      "Chaque jeudi à 16:00, produis une synthèse d'avancement de la migration cloud de la CNPS : applications migrées dans la semaine, vague en cours, points de blocage, et prochaines bascules planifiées. Ton sobre, prêt à transmettre au COPIL.",
    runs: [
      {
        title: "Avancement — S23",
        daysAgo: 3,
        ranForSec: 6.7,
        output:
          "**Vague 2 en cours — 60 % migrée**\n\n3 applications basculées cette semaine (paie, RH, portail agent).",
      },
      {
        title: "Avancement — S22",
        daysAgo: 10,
        ranForSec: 6.1,
        output:
          "**Vague 2 démarrée — 20 % migrée**\n\nMise en place de l'environnement cible terminée.",
      },
    ],
  },
  {
    key: "r4",
    title: "Revue des candidatures reçues",
    cadenceLabel: "Chaque lundi · 09:30",
    cadenceCron: "30 9 * * 1",
    icon: "users",
    status: "paused",
    owner: "mariam",
    project: "academy",
    prompt:
      "Chaque lundi à 09:30, passe en revue les candidatures reçues pour le parcours Data Engineering : nombre de dossiers, répartition par profil, et présélection des candidats correspondant aux prérequis.",
    runs: [
      {
        title: "Candidatures — S22",
        daysAgo: 12,
        ranForSec: 5.4,
        output:
          "**18 candidatures reçues**\n\n- Profils développeurs : 9\n- Profils data/analyse : 6\n- Reconversion : 3\n\n**Présélection**\n\n7 candidats remplissent les prérequis (SQL + Python + projet).",
      },
    ],
  },
  {
    key: "r5",
    title: "Génération des supports de module",
    cadenceLabel: "Chaque mercredi · 14:00",
    cadenceCron: "0 14 * * 3",
    icon: "graduation-cap",
    status: "active",
    owner: "fatou",
    project: "academy",
    prompt:
      "Chaque mercredi à 14:00, génère le support du prochain module du parcours Data Engineering : objectifs pédagogiques, plan détaillé, exercices pratiques et grille d'évaluation. Format prêt à relire avant publication.",
    runs: [
      {
        title: "Module 4 — Pipelines de données",
        daysAgo: 4,
        ranForSec: 9.8,
        output:
          "**Module 4 — Pipelines de données**\n\n**Objectifs**\n\nConcevoir, orchestrer et superviser un pipeline batch et streaming.\n\n**Plan**\n\n1. Ingestion et formats\n2. Orchestration (Airflow)\n3. Qualité et tests de données\n4. Supervision et alerting",
      },
    ],
  },
  {
    key: "r6",
    title: "Rapport d'employabilité mensuel",
    cadenceLabel: "1er du mois · 08:00",
    cadenceCron: "0 9 1 * *",
    icon: "bar-chart-3",
    status: "active",
    owner: "mariam",
    project: "academy",
    prompt:
      "Le 1er de chaque mois à 08:00, compile le rapport d'employabilité de l'Open Digital Academy : taux d'insertion des dernières promotions, partenaires recruteurs, et indicateurs clés à présenter à la direction.",
    runs: [
      {
        title: "Rapport — juin 2026",
        daysAgo: 5,
        ranForSec: 7.9,
        output:
          "**Taux d'insertion : 78 %**\n\nSur les 6 mois suivant la sortie, pour la promotion 2025.\n\n**Partenaires recruteurs**\n\nOrange CI, Sonatel, Coris Bank et 4 ESN locales ont recruté des diplômés.",
      },
    ],
  },
];

const ARTIFACTS_DATA = [
  {
    id: "a1",
    title: "Matrice de risques — 12 constats",
    kind: "Document",
    creator: "kofi",
    daysAgo: 0,
    project: "coris",
    chat: "c-synthese",
    shared: true,
    body: "## Matrice de risques consolidée\n\nCotation sur 4 niveaux (Faible → Critique) avec propriétaire désigné pour chaque constat. Les 3 constats critiques à porter au COPIL sont en tête.",
  },
  {
    id: "a2",
    title: "Plan de remédiation (3 vagues)",
    kind: "Tableur",
    creator: "awa",
    daysAgo: 0.25,
    project: "coris",
    chat: "c-remediation",
    shared: true,
    body: "## Plan de remédiation — 3 vagues\n\nVague 1 (quick wins) · Vague 2 (structurant) · Vague 3 (fond). Estimation de charge et dépendances par action.",
  },
  {
    id: "a3",
    title: "Schéma d'architecture cible",
    kind: "Diagramme",
    creator: "yao",
    daysAgo: 2,
    project: "coris",
    chat: "c-archi",
    body: "## Architecture cible en couches\n\nPrésentation · Services · Données · Intégration · Sécurité. Flux d'échange et points d'attention par couche.",
  },
  {
    id: "a4",
    title: "Note de synthèse — COPIL",
    kind: "Document",
    creator: "awa",
    daysAgo: 3,
    project: "coris",
    chat: "c-budget",
    shared: true,
    body: "## Note de synthèse COPIL\n\nContexte, avancement, 3 points saillants, risques et arbitrages attendus. Décisions à valider en comité.",
  },
  {
    id: "a5",
    title: "Trame d'entretien DSI",
    kind: "Document",
    creator: "fatou",
    daysAgo: 0.1,
    project: "coris",
    chat: "c-entretiens",
    body: "## Trame d'entretien — 15 questions\n\n3 volets : cartographie applicative, interfaces et flux, plans de continuité. Objectifs et exemples de réponse par question.",
  },
  {
    id: "a6",
    title: "Trajectoire de migration cloud",
    kind: "Tableur",
    creator: "yao",
    daysAgo: 0.05,
    project: "cnps",
    body: "## Trajectoire cloud souverain\n\nApplications classées 6R (rehost, replatform, refactor, repurchase, retain, retire), regroupées en vagues avec prérequis et risques.",
  },
  {
    id: "a7",
    title: "Cartographie applicative 6R",
    kind: "Diagramme",
    creator: "ibrahim",
    daysAgo: 1,
    project: "cnps",
    shared: true,
    body: "## Cartographie 6R\n\nVisualisation des applications par stratégie de migration recommandée. Code couleur par criticité métier.",
  },
  {
    id: "a8",
    title: "Plan de durcissement SOC",
    kind: "Document",
    creator: "kofi",
    daysAgo: 1,
    project: "oneci",
    body: "## Plan de durcissement SOC\n\n3 horizons (immédiat, 90 jours, 6 mois) avec effort estimé et risque couvert pour chaque mesure.",
  },
  {
    id: "a9",
    title: "Évaluation des risques d'identité",
    kind: "Document",
    creator: "ibrahim",
    daysAgo: 2,
    project: "oneci",
    body: "## Risques d'identité\n\nÉvaluation des comptes à privilèges, MFA, journalisation et revue des accès. Sévérité et actions correctives.",
  },
  {
    id: "a10",
    title: "Parcours Data Engineering — 8 modules",
    kind: "Document",
    creator: "mariam",
    daysAgo: 2,
    project: "academy",
    shared: true,
    body: "## Parcours Data Engineering\n\n8 modules : objectifs, prérequis, durée, compétences visées, modalité d'évaluation. Projet fil rouge et grille d'entrée.",
  },
  {
    id: "a11",
    title: "Grille d'évaluation des candidats",
    kind: "Tableur",
    creator: "fatou",
    daysAgo: 4,
    project: "academy",
    body: "## Grille d'évaluation\n\nCritères techniques (SQL, Python, data modeling) et critères comportementaux. Pondération et seuils de présélection.",
  },
];

const FILES_DATA = [
  {
    key: "f1",
    name: "Cartographie SI — Coris.xlsx",
    type: "sheet",
    sizeLabel: "284 Ko",
    by: "yao",
  },
  {
    key: "f2",
    name: "Politique de sécurité v3.pdf",
    type: "pdf",
    sizeLabel: "1,2 Mo",
    by: "kofi",
  },
  {
    key: "f3",
    name: "Entretien DSI — notes.docx",
    type: "doc",
    sizeLabel: "48 Ko",
    by: "fatou",
  },
  {
    key: "f4",
    name: "Référentiel PCI-DSS v4.pdf",
    type: "pdf",
    sizeLabel: "3,4 Mo",
    by: "kofi",
  },
  {
    key: "f5",
    name: "Inventaire applicatif.csv",
    type: "sheet",
    sizeLabel: "92 Ko",
    by: "yao",
  },
];

const TYPE_TO_MIME: Record<string, string> = {
  sheet: "application/vnd.ms-excel",
  pdf: "application/pdf",
  doc: "application/msword",
};

function parseSize(label: string): number {
  const cleaned = label.replace(",", ".").trim();
  const match = cleaned.match(/^([\d.]+)\s*(Ko|Mo|Go|o|K|M|G)$/i);
  if (!match) {
    return 0;
  }
  const num = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith("k")) {
    return Math.round(num * 1024);
  }
  if (unit.startsWith("m")) {
    return Math.round(num * 1024 * 1024);
  }
  if (unit.startsWith("g")) {
    return Math.round(num * 1024 * 1024 * 1024);
  }
  return Math.round(num);
}

const ARTIFACT_KIND_MAP: Record<string, "text" | "sheet"> = {
  Document: "text",
  Tableur: "sheet",
  Diagramme: "text",
};

const main = async () => {
  if (!process.env.POSTGRES_URL) {
    console.log("POSTGRES_URL not defined, skipping seed");
    process.exit(0);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  const now = new Date();

  console.log("Seeding database…");

  const teamByKey: Record<string, { id: string; email: string; name: string }> = {};

  for (const member of TEAM) {
    const existingRows = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, member.email))
      .limit(1);
    if (existingRows.length > 0) {
      const existingId = existingRows[0].id;
      await db
        .update(user)
        .set({ name: member.name, updatedAt: now })
        .where(eq(user.id, existingId));
      teamByKey[member.key] = {
        id: existingId,
        email: member.email,
        name: member.name,
      };
    } else {
      const id = uuidFor(`user:${member.key}`);
      const password = generateHashedPassword("cowork2026");
      await db.insert(user).values({
        id,
        email: member.email,
        password,
        name: member.name,
      });
      teamByKey[member.key] = { id, email: member.email, name: member.name };
    }
  }

  const awa = teamByKey.awa;

  // Nettoyage : les FK Message_v2.chatId / Document.chatId ne cascadent pas —
  // supprimer d'abord les enfants des conversations semées, puis l'espace.
  const seededChatIds = CHATS_CORIS.map((c) => uuidFor(`chat:${c.id}`));
  if (seededChatIds.length > 0) {
    await db.delete(vote).where(inArray(vote.chatId, seededChatIds));
    await db.delete(message).where(inArray(message.chatId, seededChatIds));
    await db.delete(stream).where(inArray(stream.chatId, seededChatIds));
    await db.delete(document).where(inArray(document.chatId, seededChatIds));
    await db.delete(chat).where(inArray(chat.id, seededChatIds));
  }

  const existingWsRows = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, "data-ia"))
    .limit(1);

  if (existingWsRows.length > 0) {
    await db.delete(workspace).where(eq(workspace.id, existingWsRows[0].id));
  }

  const wsId = uuidFor("ws:data-ia");
  await db.insert(workspace).values({
    id: wsId,
    name: "Direction Data & IA",
    slug: "data-ia",
    createdBy: awa.id,
  });

  await db.insert(workspaceMember).values(
    TEAM.map((m) => ({
      workspaceId: wsId,
      userId: teamByKey[m.key].id,
      role: m.key === "awa" ? ("owner" as const) : ("member" as const),
    })),
  );

  const projectIds: Record<string, string> = {};
  for (const p of PROJECTS_DATA) {
    const projectId = uuidFor(`project:${p.key}`);
    projectIds[p.key] = projectId;
    await db.insert(project).values({
      id: projectId,
      workspaceId: wsId,
      name: p.name,
      description: p.desc,
      icon: p.icon,
      color: p.color,
      visibility: p.public
        ? ("public_to_workspace" as const)
        : ("private" as const),
      createdBy: awa.id,
    });
    await db.insert(projectMember).values(
      p.members.map((mk) => ({
        projectId,
        userId: teamByKey[mk].id,
        addedBy: awa.id,
      })),
    );
  }

  const chatIds: Record<string, string> = {};
  for (const c of CHATS_CORIS) {
    const chatId = uuidFor(`chat:${c.id}`);
    chatIds[c.id] = chatId;
    const createdAt = new Date(now.getTime() - c.hoursAgo * 3_600_000);
    await db.insert(chat).values({
      id: chatId,
      title: c.title,
      userId: teamByKey[c.lastBy].id,
      visibility: "private" as const,
      projectId: projectIds.coris,
      createdAt,
      updatedAt: createdAt,
    });
  }

  const syntheseChatId = chatIds["c-synthese"];
  const syntheseBase = new Date(now.getTime() - 20 * 60_000);
  for (const m of THREAD_SYNTHESE) {
    const createdAt = new Date(syntheseBase.getTime() - m.minutesAgo * 60_000);
    const authorId =
      m.role === "user" && m.author !== "ai"
        ? teamByKey[m.author as keyof typeof teamByKey]?.id
        : null;
    await db.insert(message).values({
      id: uuidFor(`msg:${m.id}`),
      chatId: syntheseChatId,
      role: m.role,
      parts: [{ type: "text", text: m.text }],
      attachments: [],
      createdAt,
      authorId,
    });
  }

  await db.insert(prompt).values(
    PROMPTS_DATA.map((p) => ({
      id: uuidFor(`prompt:${p.key}`),
      workspaceId: wsId,
      title: p.title,
      description: p.desc,
      body: p.body,
      category: p.cat,
      icon: p.icon,
      authorId: teamByKey[p.author as keyof typeof teamByKey].id,
      official: p.official ?? false,
      pinned: p.pinned ?? false,
      uses: p.uses,
    })),
  );

  const tomorrow = new Date(now.getTime() + 24 * 3_600_000);
  for (const r of ROUTINES_DATA) {
    const routineId = uuidFor(`routine:${r.key}`);
    await db.insert(routine).values({
      id: routineId,
      projectId: projectIds[r.project],
      title: r.title,
      prompt: r.prompt,
      icon: r.icon,
      cadenceCron: r.cadenceCron,
      cadenceLabel: r.cadenceLabel,
      status: r.status as "active" | "paused",
      nextRunAt: tomorrow,
      ownerId: teamByKey[r.owner].id,
    });

    for (const run of r.runs) {
      const startedAt = new Date(now.getTime() - run.daysAgo * 24 * 3_600_000);
      const durationMs = Math.round((run.ranForSec ?? 30) * 1000);
      const finishedAt = new Date(startedAt.getTime() + durationMs);
      await db.insert(routineRun).values({
        id: uuidFor(`run:${r.key}:${run.title}`),
        routineId,
        title: run.title,
        output: run.output,
        status: "success" as const,
        startedAt,
        finishedAt,
        durationMs,
      });
    }
  }

  for (const a of ARTIFACTS_DATA) {
    const createdAt = new Date(now.getTime() - a.daysAgo * 24 * 3_600_000);
    await db.insert(document).values({
      id: uuidFor(`artifact:${a.id}`),
      createdAt,
      title: a.title,
      content: a.body,
      kind: ARTIFACT_KIND_MAP[a.kind] ?? "text",
      userId: teamByKey[a.creator as keyof typeof teamByKey].id,
      projectId: projectIds[a.project],
      chatId: a.chat ? (chatIds[a.chat] ?? null) : null,
      shareScope: a.shared ? ("workspace" as const) : ("project" as const),
      shareToken: null,
    });
  }

  for (const f of FILES_DATA) {
    await db.insert(projectFile).values({
      id: uuidFor(`file:${f.key}`),
      projectId: projectIds.coris,
      name: f.name,
      contentType: TYPE_TO_MIME[f.type] ?? "application/octet-stream",
      size: parseSize(f.sizeLabel),
      url: null,
      uploadedBy: teamByKey[f.by as keyof typeof teamByKey].id,
    });
  }

  const counts = {
    users: Object.keys(teamByKey).length,
    workspace: 1,
    workspaceMembers: TEAM.length,
    projects: PROJECTS_DATA.length,
    projectMembers: PROJECTS_DATA.reduce((acc, p) => acc + p.members.length, 0),
    chats: CHATS_CORIS.length,
    messages: THREAD_SYNTHESE.length,
    prompts: PROMPTS_DATA.length,
    routines: ROUTINES_DATA.length,
    routineRuns: ROUTINES_DATA.reduce((acc, r) => acc + r.runs.length, 0),
    documents: ARTIFACTS_DATA.length,
    projectFiles: FILES_DATA.length,
  };

  console.log("Seed completed:", counts);
  process.exit(0);
};

main().catch((err) => {
  console.error("Seed failed");
  console.error(err);
  process.exit(1);
});
