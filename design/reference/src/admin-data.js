/* ============================================================
   Synelia Cowork — Console d'administration : données simulées
   S'appuie sur window.SYN (src/data.js). Awa Koné est la
   propriétaire de l'espace ; cette console est sa vue admin.
   ============================================================ */
(function () {
  const T = SYN.TEAM;

  // ---- Rôles d'espace (distincts du rôle « projet ») ----
  // Propriétaire · Administrateur · Membre · Invité
  const roles = {
    awa: "Propriétaire",
    mariam: "Administrateur",
    fatou: "Membre",
    kofi: "Membre",
    yao: "Membre",
    ibrahim: "Membre",
  };

  // ---- Statut, ancienneté, dernière activité, conso IA du mois ----
  const meta = {
    awa:     { status: "actif", joined: "Mars 2023", last: "à l'instant",   usage: 412, projects: 4 },
    mariam:  { status: "actif", joined: "Janv. 2024", last: "il y a 8 min",  usage: 198, projects: 2 },
    kofi:    { status: "actif", joined: "Sept. 2023", last: "à l'instant",   usage: 587, projects: 2 },
    fatou:   { status: "actif", joined: "Févr. 2024", last: "il y a 4 min",  usage: 521, projects: 2 },
    yao:     { status: "actif", joined: "Mai 2023",   last: "il y a 22 min", usage: 243, projects: 2 },
    ibrahim: { status: "suspendu", joined: "Nov. 2024", last: "il y a 6 j",  usage: 176, projects: 2 },
  };

  const order = ["awa", "kofi", "fatou", "yao", "mariam", "ibrahim"];

  // ---- Invitations en attente ----
  const invites = [
    { email: "n.diallo@synelia.tech",   role: "Membre",        by: "awa",    when: "il y a 2 j",  initials: "ND", color: "#6B3FA0" },
    { email: "s.bamba@synelia.tech",     role: "Administrateur", by: "awa",    when: "il y a 4 j",  initials: "SB", color: "#C0297A" },
    { email: "audit@coris-bank.ci",      role: "Invité",        by: "kofi",   when: "il y a 1 j",  initials: "CB", color: "#00AEEF" },
  ];

  const seats = { total: 12 }; // 6 membres + invités à venir

  // ---- Série de consommation IA — 60 derniers jours (messages/jour) ----
  // déterministe : variation hebdo + tendance légèrement haussière
  const daily = [];
  const base = new Date(2026, 5, 9); // 9 juin 2026
  const MO = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dow = d.getDay(); // 0 dim … 6 sam
    const weekend = dow === 0 || dow === 6;
    const trend = 1 + (59 - i) * 0.004;              // hausse douce
    const wave = 1 + 0.18 * Math.sin((59 - i) / 3.1); // ondulation
    let v = (weekend ? 22 : 96) * trend * wave;
    v += ((i * 37) % 17) - 8;                         // bruit déterministe
    daily.push({
      date: d,
      label: d.getDate() + " " + MO[d.getMonth()],
      dow,
      weekend,
      v: Math.max(6, Math.round(v)),
    });
  }
  const last30 = daily.slice(-30);
  const prev30 = daily.slice(-60, -30);
  const sum = (arr) => arr.reduce((s, x) => s + x.v, 0);
  const total30 = sum(last30);
  const totalPrev30 = sum(prev30);
  const delta30 = Math.round(((total30 - totalPrev30) / totalPrev30) * 100);

  // ---- Conso IA par projet (messages du mois) ----
  const usageByProject = {
    coris:   1180,
    cnps:     642,
    oneci:    498,
    academy:  617,
  };

  // ---- Journal d'audit (le plus récent en tête) ----
  // kind : auth | member | project | governance | data | routine
  const audit = [
    { id: "e1",  when: "Aujourd'hui · 09:41", actor: "awa",     kind: "governance", action: "a activé", target: "Double authentification obligatoire", ip: "41.207.x.x · Abidjan" },
    { id: "e2",  when: "Aujourd'hui · 09:12", actor: "kofi",    kind: "auth",       action: "s'est connecté", target: "Web · Chrome", ip: "41.207.x.x · Abidjan" },
    { id: "e3",  when: "Aujourd'hui · 08:55", actor: "awa",     kind: "member",     action: "a suspendu le compte de", target: "Ibrahim Coulibaly", ip: "41.207.x.x · Abidjan" },
    { id: "e4",  when: "Hier · 17:30",        actor: "awa",     kind: "data",       action: "a exporté le journal d'audit", target: "audit-2026-05.csv", ip: "41.207.x.x · Abidjan" },
    { id: "e5",  when: "Hier · 16:02",        actor: "mariam",  kind: "routine",    action: "a mis en pause la routine", target: "Revue des candidatures reçues", ip: "41.207.x.x · Abidjan" },
    { id: "e6",  when: "Hier · 11:48",        actor: "awa",     kind: "project",    action: "a rendu public l'espace", target: "Open Digital Academy", ip: "41.207.x.x · Abidjan" },
    { id: "e7",  when: "Hier · 10:15",        actor: "yao",     kind: "auth",       action: "s'est connecté", target: "Web · Firefox", ip: "196.49.x.x · Yamoussoukro" },
    { id: "e8",  when: "7 juin · 14:20",      actor: "awa",     kind: "member",     action: "a nommé Administrateur", target: "Mariam Touré", ip: "41.207.x.x · Abidjan" },
    { id: "e9",  when: "7 juin · 09:05",      actor: "kofi",    kind: "data",       action: "a importé un référentiel", target: "Référentiel PCI-DSS v4.pdf", ip: "41.207.x.x · Abidjan" },
    { id: "e10", when: "6 juin · 18:32",      actor: "awa",     kind: "governance", action: "a fixé la rétention des conversations à", target: "12 mois", ip: "41.207.x.x · Abidjan" },
    { id: "e11", when: "6 juin · 15:10",      actor: "fatou",   kind: "auth",       action: "a échoué à se connecter (2 tentatives)", target: "Web · Safari", ip: "102.16.x.x · Inconnu", warn: true },
    { id: "e12", when: "5 juin · 11:00",      actor: "awa",     kind: "member",     action: "a invité", target: "s.bamba@synelia.tech", ip: "41.207.x.x · Abidjan" },
  ];

  // ---- Politiques de gouvernance (état initial) ----
  const policies = {
    sso:        { on: true,  label: "Authentification unique (SSO)", desc: "Connexion via l'annuaire d'entreprise Synelia (Azure AD)." },
    twofa:      { on: true,  label: "Double authentification obligatoire", desc: "Exigée pour tous les membres ayant accès aux espaces clients." },
    residency:  { on: true,  label: "Résidence des données en Côte d'Ivoire", desc: "Stockage et traitement sur le cloud souverain national." },
    training:   { on: false, label: "Exclure les données de l'entraînement", desc: "Les conversations ne sont jamais utilisées pour entraîner les modèles.", locked: true },
    extShare:   { on: false, label: "Partage public d'artefacts hors espace", desc: "Autoriser les liens de partage accessibles sans connexion." },
    dlp:        { on: true,  label: "Détection de données sensibles (DLP)", desc: "Alerte sur les numéros de carte, identifiants nationaux et secrets." },
  };

  const retention = "12 mois";

  window.ADMIN = {
    roles, meta, order, invites, seats,
    daily, last30, prev30, total30, totalPrev30, delta30,
    usageByProject, audit, policies, retention,
    sum,
    ROLE_LIST: ["Propriétaire", "Administrateur", "Membre", "Invité"],
  };
})();
