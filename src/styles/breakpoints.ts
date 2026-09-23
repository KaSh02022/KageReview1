/**
 * Mirrors the breakpoint values in src/styles/tokens.css. Kept as plain TS
 * constants because CSS custom properties can't be read inside @media rules.
 */
export const BREAKPOINTS = {
  mobileMax: 599,
  tabletMin: 600,
  tabletMax: 1023,
  desktopMin: 1024,
  wideMin: 1440,
} as const
