import { create } from 'zustand'

interface UiState {
  isMobileNavOpen: boolean
  isDummyAuthOpen: boolean
  isDummyLoggedIn: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
  openDummyAuth: () => void
  closeDummyAuth: () => void
  setDummyLoggedIn: (value: boolean) => void
}

/**
 * Minimal cross-cutting UI state that doesn't belong to any single
 * component (mobile nav toggle, dummy login/signup modal — FR-045).
 * Intentionally in-memory only: closing the tab resets it, and the
 * dummy-login flag never implies a real, persisted account.
 */
export const useUiStore = create<UiState>()((set) => ({
  isMobileNavOpen: false,
  isDummyAuthOpen: false,
  isDummyLoggedIn: false,
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  openDummyAuth: () => set({ isDummyAuthOpen: true }),
  closeDummyAuth: () => set({ isDummyAuthOpen: false }),
  setDummyLoggedIn: (value) => set({ isDummyLoggedIn: value }),
}))
