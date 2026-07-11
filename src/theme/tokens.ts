/**
 * Design tokens — single source of truth for Dishly's visual language.
 *
 * Derived from the Claude Design handoff:
 *   ../../project/Dishly Prototype.dc.html  (the exported prototype)
 *   ../../project/CLAUDE.md                 (recipe-app design conventions)
 *
 * Consumed two ways — change a value here and it propagates everywhere:
 *   1. tailwind.config.js spreads these into `theme.extend`, so components use
 *      semantic classes: bg-surface, text-primary, rounded-card, font-display.
 *   2. Non-class consumers import the raw values directly, because RN has no
 *      CSS gradient/shadow classes:
 *        - expo-linear-gradient  -> gradients.*
 *        - RN shadow props + elevation -> shadows.*
 *        - loaded font families  -> fontFamily.*
 */

// ---------------------------------------------------------------------------
// Colors (semantic) — warm cream base, single warm-orange accent (#E8622C)
// ---------------------------------------------------------------------------
export const colors = {
  // surfaces
  background: '#FAF6F1', // app base — warm cream
  surface: '#FFFFFF', // cards, inputs, buttons
  'surface-muted': '#F5F1EA', // saved / disabled surface
  'surface-sunken': '#EDEAE3', // segmented-control track, device shell bg

  // text
  primary: '#1F1B16', // primary text / near-black graphite
  secondary: '#8A8175', // secondary/meta text
  tertiary: '#A39C90', // hints, skip links
  'body-muted': '#6B6459', // info panel body text

  // accent — Dishly brand green (from the logo)
  accent: '#1C6E4A', // the single accent — CTAs, selection
  'accent-tint': '#E7F1EC', // soft accent fill (selected pills, mic button)
  'accent-tint-strong': '#D3E7DC', // allergen flag background
  'accent-muted': '#A6C9B6', // disabled primary button
  'on-accent': '#FFFFFF', // text/icon on accent

  // status
  danger: '#B03A0E', // allergen "contains" text

  // lines
  border: '#E5DFD5', // default hairline border
  'border-strong': '#D8D0C2', // hover/emphasis border
  divider: '#EFEAE1', // list row divider
} as const;

// ---------------------------------------------------------------------------
// Radii — px numbers (RN) + tailwind px strings (borderRadius)
// ---------------------------------------------------------------------------
export const radii = {
  sm: 6, // checkbox
  md: 14, // inputs, secondary buttons
  lg: 16, // upload/camera tiles
  xl: 18, // photo tiles
  card: 20, // recipe cards, hero
  full: 9999, // pills, mic, circular
} as const;

const toPx = <T extends Record<string, number>>(m: T) =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v}px`])) as {
    [K in keyof T]: string;
  };

export const borderRadius = toPx(radii);

// ---------------------------------------------------------------------------
// Spacing — named tokens layered ON TOP of Tailwind's default 4px scale.
// (Tailwind defaults like p-4/px-6 stay available; these add design rhythm.)
// ---------------------------------------------------------------------------
export const spacing = {
  screen: '24px', // default screen horizontal padding
  'screen-top': '68px', // status-bar-safe top padding used across screens
  gutter: '20px', // tighter screen padding (results/recipe/camera)
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
// Loaded via expo-font in the root layout (see app/_layout.tsx).
// Display = Fraunces (serif) for dish names + screen titles.
// Body    = Inter (sans) for everything else.
export const fontFamily = {
  display: ['Fraunces_500Medium'],
  'display-semibold': ['Fraunces_600SemiBold'],
  body: ['Inter_400Regular'],
  'body-medium': ['Inter_500Medium'],
  'body-semibold': ['Inter_600SemiBold'],
  'body-bold': ['Inter_700Bold'],
} as const;

// Type scale — keys are the design's px sizes; classes become text-12 … text-26.
// Tuple form: [fontSize, lineHeight].
export const fontSize = {
  '11': ['11px', '15px'],
  '12': ['12px', '16px'],
  '13': ['13px', '18px'],
  '13.5': ['13.5px', '18px'],
  '14': ['14px', '21px'],
  '14.5': ['14.5px', '22px'],
  '15': ['15px', '22px'],
  '16': ['16px', '24px'],
  '17': ['17px', '24px'],
  '18': ['18px', '24px'],
  '19': ['19px', '26px'],
  '20': ['20px', '28px'],
  '22': ['22px', '29px'],
  '24': ['24px', '30px'],
  '26': ['26px', '32px'],
} as const;

// ---------------------------------------------------------------------------
// Shadows — RN style objects (no CSS box-shadow in RN). The one soft overlap
// shadow allowed by the design conventions: 0 8px 24px rgba(0,0,0,0.08).
// ---------------------------------------------------------------------------
export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 0.08,
    elevation: 6, // Android
  },
} as const;

// ---------------------------------------------------------------------------
// Gradients — color stops for expo-linear-gradient (top -> bottom).
// The text-on-photo overlay used on recipe cards, favorites tiles, and hero.
// ---------------------------------------------------------------------------
export const gradients = {
  // transparent at top, 65% black at bottom — confined to bottom third by the
  // consumer's height/locations.
  photoOverlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'] as [string, string],
} as const;

export const tokens = {
  colors,
  radii,
  borderRadius,
  spacing,
  fontFamily,
  fontSize,
  shadows,
  gradients,
} as const;

export type Tokens = typeof tokens;
