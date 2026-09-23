import { useState } from 'react'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { Button } from '../components/ui/Button/Button'
import buttonStyles from '../components/ui/Button/Button.module.css'
import styles from './ContactPage.module.css'

const DESTINATION_QUERY = 'FandomVerse HQ, Seed City'
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(DESTINATION_QUERY)}&output=embed`
const DIRECTIONS_BASE_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESTINATION_QUERY)}`

type GeolocationState = 'idle' | 'loading' | 'unavailable' | 'denied' | 'ready'

/**
 * Contact Us, FR-039, architecture per D-006 (docs/11_DECISION_LOG.md):
 * a client-only Google Maps iframe embed (no API key, no backend), a
 * manual "Get Directions" link that always works, and an optional,
 * user-initiated "directions from my location" control. Geolocation is
 * requested only on click — never automatically — and its failure/denial
 * degrades gracefully without blocking the rest of the page.
 */
export function ContactPage() {
  const [geoState, setGeoState] = useState<GeolocationState>('idle')
  const [directionsFromMeUrl, setDirectionsFromMeUrl] = useState<string | null>(null)

  function handleUseMyLocation() {
    if (!('geolocation' in navigator)) {
      setGeoState('unavailable')
      return
    }
    setGeoState('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setDirectionsFromMeUrl(`${DIRECTIONS_BASE_URL}&origin=${latitude},${longitude}`)
        setGeoState('ready')
      },
      () => setGeoState('denied'),
      { timeout: 10_000 },
    )
  }

  return (
    <PagePlaceholder
      title="Contact Us"
      description="Team contact information with a responsive map and directions."
      requirementIds={['FR-039']}
    >
      <address className={styles.address}>
        FandomVerse Team
        <br />
        Seed City, Placeholder Region
        <br />
        <a href="mailto:hello@example.invalid">hello@example.invalid</a>
      </address>

      <div className={styles.mapWrapper}>
        <iframe
          title="FandomVerse location map"
          src={MAP_EMBED_SRC}
          className={styles.map}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className={styles.actions}>
        <a
          href={DIRECTIONS_BASE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className={`${buttonStyles.button} ${buttonStyles['variant-outline']} ${buttonStyles['size-medium']}`}
        >
          Get Directions
        </a>

        <Button
          variant="outline"
          onClick={handleUseMyLocation}
          disabled={geoState === 'loading'}
          isLoading={geoState === 'loading'}
        >
          Directions from my location
        </Button>

        {geoState === 'ready' && directionsFromMeUrl && (
          <a
            href={directionsFromMeUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={`${buttonStyles.button} ${buttonStyles['variant-primary']} ${buttonStyles['size-medium']}`}
          >
            Open directions from your location
          </a>
        )}
        {(geoState === 'denied' || geoState === 'unavailable') && (
          <p role="status" className={styles.geoFallback}>
            Location unavailable — use the map or the "Get Directions" link above.
          </p>
        )}
      </div>
    </PagePlaceholder>
  )
}
