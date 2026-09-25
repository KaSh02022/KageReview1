import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SkipLink } from '../components/SkipLink/SkipLink'
import { Header } from '../components/Header/Header'
import { Breadcrumb } from '../components/Breadcrumb/Breadcrumb'
import { Footer } from '../components/Footer/Footer'
import { ChatbotLauncher } from '../components/ChatbotLauncher/ChatbotLauncher'
import { DummyAuthModal } from '../components/DummyAuth/DummyAuthModal'
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary'
import { DocumentTitle } from '../components/DocumentTitle/DocumentTitle'
import { useRouteTransitionEffects } from '../hooks/useRouteTransitionEffects'
import styles from './RootLayout.module.css'

/** Reusable app shell — wraps every route (docs/02_PRODUCT_ARCHITECTURE.md §2). */
export function RootLayout() {
  const mainRef = useRef<HTMLElement>(null)
  useRouteTransitionEffects(mainRef)

  /**
   * The cinematic landing is a full-bleed document with its own navigation,
   * its own heading and its own colophon. Layering the app header, breadcrumb
   * and footer on top of it would give the visitor two of each, so the shell
   * stands down for that one route. Every other route is untouched.
   */
  const isCinematicLanding = useLocation().pathname === '/'

  return (
    <div className={styles.appShell}>
      <DocumentTitle />
      {isCinematicLanding ? null : (
        <>
          <SkipLink />
          <Header />
        </>
      )}
      <div className={isCinematicLanding ? styles.bleedWrapper : styles.contentWrapper}>
        {isCinematicLanding ? null : <Breadcrumb />}
        <main id="main-content" ref={mainRef} className={styles.main} tabIndex={-1}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      {isCinematicLanding ? null : (
        <>
          <Footer />
          <ChatbotLauncher />
        </>
      )}
      <DummyAuthModal />
    </div>
  )
}
