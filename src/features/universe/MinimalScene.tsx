import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import styles from './CinematicEntry.module.css'

/**
 * Minimal placeholder R3F scene proving the lazy-loaded WebGL pipeline
 * works end-to-end. This is NOT the Phase 4 cinematic "Fandom Universe"
 * experience — just an original, trivial rotating mesh so Phase 1 can
 * verify canvas mount/unmount, context-loss handling, and bundle
 * lazy-loading without building the real scene early.
 */
function RotatingIcosahedron() {
  return (
    <mesh rotation={[0.4, 0.2, 0]}>
      <icosahedronGeometry args={[1.4, 0]} />
      <meshStandardMaterial color="#5b7bff" wireframe />
    </mesh>
  )
}

interface MinimalSceneProps {
  onContextLost?: () => void
}

export function MinimalScene({ onContextLost }: MinimalSceneProps) {
  return (
    <div className={styles.hero} data-testid="cinematic-canvas">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 4] }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              onContextLost?.()
            })
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={0.8} />
          <RotatingIcosahedron />
        </Canvas>
      </Suspense>
      <div className={styles.overlay}>
        <h1>FandomVerse</h1>
        <p>Portal for Fandom World</p>
      </div>
    </div>
  )
}

export default MinimalScene
