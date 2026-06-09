/**
 * Synelia Cowork — design tokens (sRGB hex).
 *
 * Mirror of /opt/data/synelia-nexus/DESIGN.md, exposed as a typed const
 * for feature code that needs to reference the palette directly
 * (e.g. background colors for kind-specific chart palettes, inline SVG
 * fills, programmatic generation of pixel-perfect avatars).
 *
 * DO NOT add tokens here that aren't in DESIGN.md. To change a token,
 * edit DESIGN.md first, then update this file to match.
 */

export const colors = {
  // Brand
  primary: "#4B2882",
  primaryDark: "#2D1557",
  primaryMid: "#6B3FA0",
  accent: "#C0297A",

  // Surfaces
  background: "#FFFFFF",
  backgroundAlt: "#F5F4F8",
  card: "#FFFFFF",
  popover: "#FFFFFF",

  // Text
  text: "#1C1C2E",
  textSub: "#3D3550",
  textMuted: "#9A90A8",

  // Borders
  border: "#E0DCE8",
  borderSoft: "#E7E3EE",

  // Semantic state
  success: "#00C48C",
  warning: "#FF6B35",
  error: "#E63946",
  info: "#00AEEF",

  // Kind chips (1:1 with artifact types)
  kindDoc: "#4B2882",
  kindTableur: "#00C48C",
  kindDiagramme: "#00AEEF",

  // Live state (semantic alias for accent)
  livePill: "#C0297A",

  // White / black
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const shadow = {
  sm: "0 1px 3px rgba(45, 21, 87, 0.08)",
  md: "0 4px 12px rgba(45, 21, 87, 0.12)",
  lg: "0 8px 32px rgba(45, 21, 87, 0.16)",
} as const;

export const fonts = {
  display: "'Montserrat', system-ui, sans-serif",
  body: "'Open Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const dimensions = {
  sidebarWidth: 264,
  composerHeight: 72,
  modalMax: 880,
  artifactCardWidth: 280,
  artifactCardHeight: 160,
  ruleWidth: 56,
  ruleHeight: 3,
  iconSm: 14,
  iconMd: 17,
  iconLg: 20,
  avatarSm: 24,
  avatarMd: 32,
  avatarStackOverlap: 10,
} as const;

/**
 * The avatar palette — used to color the initials avatars in the
 * sidebar presence card, the login left panel, and similar.
 * Cycles through: violet, magenta, pink, cyan, emerald.
 */
export const avatarPalette = [
  "#4B2882", // primary
  "#C0297A", // accent
  "#E85B9C", // pink (derived)
  "#00AEEF", // info
  "#00C48C", // success
] as const;
