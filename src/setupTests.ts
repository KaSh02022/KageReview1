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

// jsdom doesn't implement Element.scrollIntoView either — found via a real
// test failure (CinematicEntry's skip-intro control threw before it could
// move focus). Real browsers always have this; only the test environment
// needs the stub.
if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}
