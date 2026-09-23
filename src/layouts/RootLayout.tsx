import { useRef } from 'react'
import { Outlet } from 'react-router-dom'
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

  return (
    <div className={styles.appShell}>
      <DocumentTitle />
      <SkipLink />
      <Header />
      <div className={styles.contentWrapper}>
        <Breadcrumb />
        <main id="main-content" ref={mainRef} className={styles.main} tabIndex={-1}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <Footer />
      <ChatbotLauncher />
      <DummyAuthModal />
    </div>
  )
}
