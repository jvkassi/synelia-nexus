export const meta = {
  name: 'synelia-feature-test',
  description: 'Test every Synelia Nexus feature via agent-browser against the live dev server, triage failures, write a report',
  phases: [
    { title: 'Test', detail: 'one agent per feature area drives the live app with agent-browser' },
    { title: 'Triage', detail: 'investigate each failure: real product bug vs test-author error' },
    { title: 'Report', detail: 'synthesize a single markdown report' },
  ],
}

const BASE = 'http://localhost:3000'

const RECIPE = `
## How to drive the app (READ FIRST)
The Synelia Nexus dev server is ALREADY RUNNING at ${BASE}. Do NOT start a server.
Test with the \`agent-browser\` CLI (v0.26.0). Rules:
- Use an ISOLATED session for every command: pass \`--session <YOUR_SESSION>\` (given below). Never use the default session.
- Set \`export AGENT_BROWSER_DEFAULT_TIMEOUT=30000\` once in your shell.
- After any navigation/click that changes the page, re-run \`snapshot -i\` — refs (@e1…) are invalidated by navigation.
- Prefer semantic locators when refs are flaky: \`agent-browser --session S find label "Mot de passe" fill "x"\`, \`find role button click --name "Créer mon compte"\`, \`find text "Artefacts" click\`.
- To inspect DOM/classes precisely use \`eval\`, e.g. \`agent-browser --session S eval 'document.querySelectorAll(".artg-card").length'\`.
- ALWAYS \`agent-browser --session <YOUR_SESSION> close\` at the very end.

## Auth recipe (you are NOT logged in — every session starts fresh)
The whole app is auth-gated; visiting any route unauthenticated 307-redirects to /login.
Register a fresh throwaway user, then you have a session cookie for the rest:
1. \`agent-browser --session S open ${BASE}/register && agent-browser --session S wait --load networkidle\`
2. \`agent-browser --session S find label "Nom complet" fill "WF Tester"\`
3. \`agent-browser --session S find label "Adresse e-mail professionnelle" fill "<UNIQUE_EMAIL>"\`  (make it unique, e.g. wf-<area>-<random>@synelia.tech)
4. \`agent-browser --session S find label "Mot de passe" fill "synelia123"\`
5. \`agent-browser --session S find role button click --name "Créer mon compte"\`
6. \`agent-browser --session S wait --url "**/" \` then \`get url\` should be exactly ${BASE}/ (the dashboard).
The data layer is NOT membership-gated: every logged-in user sees all seeded data.

## Seeded data (real ids/slugs — use these exact values)
- Workspace slug: \`data-ia\` (the ONLY workspace; the project is "Direction Data & IA"). Ignore stale docs that say coris/cnps/oneci.
- Threads: c-synthese (live risk-matrix build), c-remediation, c-entretiens (ghost typing), c-conformite, c-archi, c-budget.
- Artifacts: 11 (a1 "Matrice de risques", a2 Tableur, a3 Diagramme, a4 Document…). Routines: 6 (r1..r6). Prompts: 12.

## Routes
/ (dashboard) · /library · /artifacts · /routines · /w/data-ia (5-tab project) · /w/data-ia/t/c-synthese (chat) · /admin (5 tabs) · /login · /register

## What to return
For your assigned area, exercise EACH listed check in the live browser and report what you OBSERVED (not what you assume).
A check is "pass" only if you verified the expected element/behaviour was actually present on screen (via snapshot/eval/screenshot).
Mark "fail" if the expected thing was missing/broken, "warn" if partially working or ambiguous. Always fill \`observed\` with concrete evidence (counts, text, urls, console errors). Keep notes terse.
`

const AREAS = [
  {
    key: 'auth', session: 'wf-auth',
    title: 'Authentication & gating',
    checks: [
      'Register a new user then land on the dashboard (/) with greeting visible',
      'Log out (sidebar user pill / Déconnexion if present) then log back in via /login with the same creds and return to dashboard',
      'On /login, submitting a wrong password (nobody@synelia.tech / wrongpass) shows a French error like "Adresse e-mail ou mot de passe incorrect"',
      'Visiting / in a brand-new session (no cookie) redirects to /login?next=%2F',
    ],
  },
  {
    key: 'shell', session: 'wf-shell',
    title: 'App shell (sidebar + topbar)',
    checks: [
      'Sidebar shows the SYNELIA wordmark (.sb-brand / wordmark text contains SYNELIA)',
      'Sidebar has 4 nav links: Accueil, Bibliothèque de prompts, Artefacts, Routines (Routines has a count badge)',
      'Sidebar lists the project "Direction Data & IA" with a live "En direct" dot',
      'Sidebar has an "Administration" link and a user pill at the bottom',
      'Topbar has a search textbox (Rechercher, with ⌘K hint), an "Inviter" button and a Notifications (bell) button',
      'Clicking each of the 4 nav links navigates to the right route (/, /library, /artifacts, /routines)',
    ],
  },
  {
    key: 'dashboard', session: 'wf-dash',
    title: 'Dashboard',
    checks: [
      'Greeting "Bonjour, {prénom}." (H1) is present with a magenta rule under the hero',
      'At least one project card renders (Direction Data & IA) with stats (chats/files/avatars)',
      'An active-routines list renders with at least one routine and "PROCHAINE" next-run labels',
      'A "Conversations récentes" list renders with clickable conversation links',
      'Hero has "Inviter" and "Nouveau projet" buttons',
      'Clicking a recent conversation navigates into a /w/data-ia/t/<id> chat',
    ],
  },
  {
    key: 'library', session: 'wf-lib',
    title: 'Prompt library',
    checks: [
      '/library renders a prompt grid (.prompt-card) with about 12 cards and category filters (.lib-cats)',
      'Typing in the search filters the visible prompt cards (count drops)',
      'Clicking a category chip filters the grid',
      'A pinned prompt (if any) sorts first',
      'Clicking "Utiliser" on a prompt opens the UsePrompt modal OR starts a pre-filled new conversation',
    ],
  },
  {
    key: 'artifacts', session: 'wf-art',
    title: 'Global artifacts gallery',
    checks: [
      '/artifacts renders a read-only gallery grid (.artg-grid / .artg-card) with about 11 cards',
      'Kind filter (Document / Tableur / Diagramme) narrows the grid',
      'Search narrows the grid by title',
      'Clicking a card opens an ArtifactModal (overlay) showing artifact content + a close X (NO "create artifact" button anywhere — artifacts are AI outputs)',
      'The modal has a share affordance ("Partager par lien" / share box with a cowork.synelia.tech/a/... link)',
    ],
  },
  {
    key: 'routines', session: 'wf-rout',
    title: 'Routines master-detail',
    checks: [
      '/routines renders the master-detail (.tasks-view) with a routine list (.rt-card) of 6 routines',
      'Selecting a routine shows its detail on the right with run history (chevrons / "Dernier")',
      'An Active/Pause toggle is present and clicking it flips state + fires a toast',
      'Detail has "Modifier" and "Tester" buttons',
    ],
  },
  {
    key: 'project', session: 'wf-proj',
    title: 'Project view (/w/data-ia)',
    checks: [
      '/w/data-ia renders the project header (.projhead) with icon, title "Direction Data & IA", a visibility badge, avatar stack, Inviter + Nouvelle conversation',
      'A tab bar (.ph-tabs) shows 5 tabs: Conversations · Artefacts · Connaissances · Routines · Équipe — clicking each switches content without crashing',
      'The Conversations tab shows a big composer with 4 suggestion chips and a chat list (chat-row) with live pills',
      'Clicking the visibility badge opens the Visibility modal',
      'Clicking a chat row opens its /w/data-ia/t/<id> chat workspace',
    ],
  },
  {
    key: 'chat', session: 'wf-chat',
    title: 'Chat workspace (streaming, steering, live artifact)',
    checks: [
      'Open /w/data-ia/t/c-synthese — the chat workspace renders (chat-main / composer) with existing messages',
      'Sending a message (type in composer + send) triggers the streaming simulator: a "thinking" indicator then word-by-word assistant text appears',
      'The send button swaps to a stop button while streaming; clicking stop halts the stream',
      'Steering: hitting Enter with new text mid-stream interrupts (previous tagged "interrompu" / yours "orientation") and the AI re-streams',
      'For c-synthese, the right panel builds the risk matrix (risk-table) row by row as the AI streams',
      'Open /w/data-ia/t/c-entretiens — ghost typing of another user is shown character by character',
      'Layout switch via ?layout=canvas and ?layout=wide both render without crashing',
    ],
  },
  {
    key: 'modals', session: 'wf-modal',
    title: 'Modals',
    checks: [
      'Sidebar "Nouveau projet" opens NewProjectModal (NO icon picker, NO color picker — palette auto-assigns); cancel/close works',
      'Topbar "Inviter" opens InviteModal with an invite link/token; close works',
      'A "Nouvelle conversation" action opens NewChatModal; close works',
      'Library "Nouveau prompt" (if present) opens NewPromptModal; close works',
      'Submitting NewProject creates a project and fires a success toast (or at minimum a toast appears on a mutating action)',
    ],
  },
  {
    key: 'admin', session: 'wf-admin',
    title: 'Admin console (/admin)',
    checks: [
      "/admin renders the overview with KPI stat cards (.adm-stats / .stat-card) and a \"Retour à l'espace\" link in its own dark sidebar",
      'Members tab (/admin?tab=members) renders a team table (.adm-table) with roles',
      'Projects tab renders project rows with visibility/archive toggles',
      'Usage tab renders per-member/per-project consumption',
      'Governance tab (/admin?tab=governance) renders policy rows (.policy-row) with switches (.switch); toggling one fires a toast',
    ],
  },
]

const RESULT_SCHEMA = {
  type: 'object',
  required: ['area', 'cases', 'summary'],
  properties: {
    area: { type: 'string' },
    summary: { type: 'string', description: 'one-line verdict for this area' },
    passCount: { type: 'number' },
    failCount: { type: 'number' },
    cases: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'status', 'observed'],
        properties: {
          name: { type: 'string' },
          status: { type: 'string', enum: ['pass', 'fail', 'warn'] },
          observed: { type: 'string', description: 'concrete evidence: counts, text, url, console errors' },
        },
      },
    },
  },
}

const TRIAGE_SCHEMA = {
  type: 'object',
  required: ['area', 'verdicts'],
  properties: {
    area: { type: 'string' },
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'classification', 'reason'],
        properties: {
          name: { type: 'string' },
          classification: { type: 'string', enum: ['real-bug', 'test-author-error', 'expected-stub', 'inconclusive'] },
          reason: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
        },
      },
    },
  },
}

phase('Test')

const results = await pipeline(
  AREAS,
  (a, _orig, i) => agent(
    `You are testing the "${a.title}" feature area of the Synelia Nexus web app.
Your isolated agent-browser session name is: ${a.session}
Use a unique throwaway email for registration: wf-${a.key}-${i}-trial@synelia.tech (vary it if registration says the email already exists).

${RECIPE}

## Your checks (exercise each one in the live browser, report what you OBSERVED):
${a.checks.map((c, n) => `${n + 1}. ${c}`).join('\n')}

Work methodically: register, then for each check navigate + snapshot/eval + verify the expected thing is really on screen, capturing concrete evidence. Note any console errors or 500s. Close your session at the end. Then return the structured result.`,
    { label: `test:${a.key}`, phase: 'Test', schema: RESULT_SCHEMA }
  ),
  (res, a) => {
    if (!res) return { area: a.title, verdicts: [], _testFailed: true }
    const failures = (res.cases || []).filter(c => c.status === 'fail' || c.status === 'warn')
    if (failures.length === 0) return { area: a.title, verdicts: [], _allPass: true, _result: res }
    return agent(
      `Triage the failing/warn checks from an automated browser test of the Synelia Nexus "${a.title}" area.
You have READ access to the codebase at /home/jekas/dev/lang/vibecoding/synelia-nexus and the dev server is live at ${BASE} (auth-gated; register a throwaway user with session "${a.session}-triage" if you need to look). For each failing check, decide whether it is:
- "real-bug": the product is genuinely broken/missing the feature,
- "test-author-error": the browser agent used a wrong selector/route/expectation but the feature actually works (verify by reading the relevant source under app/ or components/ and/or re-checking in the browser),
- "expected-stub": fails because of a known intentional stub (e.g. /api/chat returns 501 — the chat workspace runs on the client-side SIMULATOR, so real network chat is expected to be stubbed),
- "inconclusive": cannot determine.
Give a severity for real bugs. Be skeptical and check the source before calling something a real bug.

Failing checks with the tester's evidence:
${failures.map(f => `- [${f.status}] ${f.name}\n    observed: ${f.observed}`).join('\n')}`,
      { label: `triage:${a.key}`, phase: 'Triage', schema: TRIAGE_SCHEMA }
    ).then(t => ({ ...t, _result: res }))
  }
)

phase('Report')

const payload = JSON.stringify(results.filter(Boolean), null, 2)
const report = await agent(
  `You are writing the final feature-test report for Synelia Nexus after an automated agent-browser test pass of all 10 feature areas.

Write a single, well-structured markdown report and SAVE it to /home/jekas/dev/lang/vibecoding/synelia-nexus/.hermes/FEATURE-TEST-REPORT.md using your file-write tool. Date it 2026-06-09. Structure:
1. Title + one-paragraph executive summary (how many areas fully pass, how many have real bugs).
2. A pass/fail matrix table: one row per feature area, columns = pass / warn / fail counts + a one-line verdict.
3. "Confirmed bugs" section — ONLY items triaged as "real-bug", grouped by severity (high to low), each with the area, what's broken, and the evidence. If none, say so plainly.
4. "Known stubs / expected" — items triaged "expected-stub" (e.g. /api/chat 501 -> simulator).
5. "Test-author noise" — a short list of checks that were test-author-error (so we know they are NOT product problems).
6. "Recommendations" — the top 3-5 things to fix next, prioritized.
Be accurate and concrete. Do not invent results. Base everything strictly on the data below.

DATA (per-area results + triage verdicts):
${payload}

After saving the file, return a concise plain-text summary (counts of areas passing, count of confirmed real bugs by severity, and the single most important next fix).`,
  { label: 'synthesize-report', phase: 'Report' }
)

return { report, areaCount: AREAS.length, raw: results.filter(Boolean) }
