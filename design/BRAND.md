# Synelia — Brand & Voice

> Contexte de marque, voix et fondamentaux visuels du **Groupe Synelia**.
> Référence amont du design system. Les **tokens** sont dans [`../DESIGN.md`](../DESIGN.md)
> (spec) et `app/globals.css` (implémentation) ; ce document porte le **pourquoi** :
> qui est Synelia, comment la marque parle, et les règles non-négociables.
> Fondé en 2013 · Abidjan, Côte d'Ivoire · [synelia.tech](https://synelia.tech)

---

## 1. Contexte produit & entreprise

**Groupe Synelia** est un leader ivoirien de la **transformation numérique** :
conseil, intégration de solutions et accompagnement de bout en bout pour les
organisations publiques et privées en Afrique de l'Ouest.

- **Promesse :** *L'excellence technologique pour relever les défis de la transformation numérique des Organisations.*
- **Valeurs :** Excellence · Expertise · Agilité · Ancrage local · Confiance
- **Positionnement :** partenaire stratégique « de la stratégie au delivery », ancrage ivoirien / ouest-africain.
- **Clients de référence :** Orange, MTN, Sonatel, CNPS, CNAM, Coris Bank, BOA, SIB, ONECI, Union Africaine, Groupe Cofina, UNOPS… (~100 organisations).

**Synelia Nexus** (ce dépôt) est le **plan de travail IA multi-utilisateur** du
groupe : l'unité d'organisation est le **projet** (espace d'équipe partagé),
l'unité de conversation le **thread**, et l'unité de sortie l'**artefact**
(Document · Tableur · Diagramme). Produit intégralement en français.

---

## 2. Voix & rédaction

Langue principale : **français** (institutionnel & client). L'**anglais** est
réservé à la documentation technique internationale (API, DevOps, SOC).
**Jamais de mélange dans un même paragraphe.**

| Attribut | Description |
|---|---|
| **Expert** | Vocabulaire technique précis, pas de jargon gratuit |
| **Confiant** | Assertions directes, pas de formulations hésitantes |
| **Accessible** | Vulgarisation sans condescendance |
| **Ancré** | Références au contexte ivoirien / Afrique de l'Ouest quand pertinent |
| **Sobre** | Pas d'emoji en contexte formel, ponctuation standard |

- **« Vous »** de politesse vers le client ; **« nous »** = Synelia.
- **MAJUSCULES** assumées pour les sur-titres / titres de section institutionnels.
  Motif récurrent : *sur-titre court en majuscules → titre en casse normale → trait magenta*.
- **Italique** = citation, terme étranger, emphase éditoriale. Pas de gras dans le corps pour insister.
- Accroches longues et ambitieuses pour les titres ; phrases courtes (≤ ~5 lignes) dans le corps.
- Libellés produit récurrents : « Nouvelle conversation », « Partager par lien »,
  « L'IA répond », « En cours », « Conversations · Artefacts · Connaissances · Routines · Équipe ».

---

## 3. Fondamentaux visuels (résumé)

> Détail des tokens et composants : [`../DESIGN.md`](../DESIGN.md).

- **Le violet structure, le magenta ponctue.** Violet `#4B2882` = architecture
  (fonds forts, en-têtes, couvertures, sidebar) ; magenta `#C0297A` = signal
  uniquement (trait 56×3, puce du wordmark, pin, live pill). Jamais 50/50.
- **Sobriété institutionnelle avant l'effet.** Aplat > dégradé, filet > ombre
  lourde, blanc respirant > densité. En cas de doute : moins.
- **Répartition cible d'une surface :** ~60 % neutre (blanc / `#F5F4F8`),
  ~30 % violet, ~10 % magenta + sémantiques.
- **Typo :** Montserrat (display) + Open Sans (corps, interligne 1.6) + JetBrains
  Mono (code). Max 2 familles par document. **Jamais** Arial / Roboto / Inter / system-ui.
- **Backgrounds :** aplats blanc / `#F5F4F8` / violet / violet sombre. **Pas de
  dégradé violet**, pas de palette « tech-startup », pas de photo stock générique.
- **Rayons :** 4px (boutons/champs) · 8px (cartes) · 16px (panneaux/modales).
- **Ombres :** toujours teintées violet `rgba(45,21,87,…)`, jamais noires.
- **Mouvement sobre :** fondus et légers `translateY`. Pas de bounce, pas de boucle infinie.
  Hover boutons : primaire `#4B2882` → `#6B3FA0` ; liens : violet → magenta ;
  press : assombrir (pas de scale agressif).

---

## 4. Iconographie & imagerie

- **Line icons** (Lucide via `lucide-react`), stroke ~1.5–2px, géométrie nette,
  en **violet ou blanc** sur la marque. Pas d'icônes pleines lourdes, pas d'emoji formel.
- **Le bleu/cyan est un piège.** La charte source le mentionne pour l'iconographie
  *et* l'interdit comme couleur de marque (conflit documenté). Résolution retenue :
  cyan `#00AEEF` **cantonné aux callouts Info et schémas techniques** ; jamais
  comme couleur d'accent générale.
- **Illustrations** géométriques abstraites, palette restreinte aux couleurs brand.
- **Pas de stock générique.** Privilégier schémas, captures produit, contexte africain réel.

---

## 5. CAVEATS

- ⚠️ **Logo officiel non fourni.** Les fichiers de `public/brand/`
  (`synelia-wordmark*.svg`, `synelia-mark.svg`) sont des **substituts
  typographiques**. → *Remplacer par le logo officiel (PNG/SVG) avant livraison finale.*
- ⚠️ **Conflit source bleu/cyan** dans l'iconographie (cf. §4) — résolution provisoire, à trancher.
- ⚠️ **Fonts via CDN Google Fonts** (Montserrat / Open Sans / JetBrains Mono).
  Pour un usage hors-ligne, fournir les `.woff2` et basculer sur `@font-face`.
