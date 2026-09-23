import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement matchMedia — polyfill it so hooks like
// usePrefersReducedMotion (and any `prefers-*` media query) don't throw.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom doesn't implement scrollTo — polyfill it as a no-op so
// useRouteTransitionEffects' scroll-restoration-on-navigate doesn't log a
// noisy "not implemented" warning on every route-change test.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
