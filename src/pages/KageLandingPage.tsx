import { KageStage } from '../features/landing/KageStage'

/**
 * Route `/` — the cinematic landing.
 *
 * The React chapter landing it replaced is still in the repository
 * (`src/pages/HomePage.tsx` and `src/sections/`), unused but intact, so
 * switching back is a one-line change in `routes.tsx`.
 */
export function KageLandingPage() {
  return <KageStage />
}
