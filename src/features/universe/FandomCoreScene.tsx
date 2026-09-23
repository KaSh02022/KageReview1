import { Suspense, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import { MathUtils } from 'three'
import { FANDOM_CORE_NODES } from './fandomCoreNodes'
import { useCategoryAccentColors } from './useCategoryAccentColors'
import { computeParallaxRotation } from './computeParallaxRotation'
import styles from './FandomCoreScene.module.css'

// Two distinct radii, deliberately not the same value: RING_RADIUS marks
// the *outer* orbit that visually lines up with the HTML overlay's seven
// labeled nodes (FandomCoreOverlay.module.css's --orbit-radius); the 3D
// meshes below sit on a smaller, *inner* FRAGMENT_RADIUS so they read as
// atmospheric depth behind the real interactive layer instead of a second,
// misaligned copy of the same seven markers (a real visual bug found and
// fixed during Phase 4 visual QA — see docs/11_DECISION_LOG.md).
const RING_RADIUS = 2.4
const FRAGMENT_RADIUS = 1.35

interface SceneProps {
  hoveredCategoryId: string | null
  reducedMotion: boolean
  isMobile: boolean
}

/** The central focal object — layered geometry, no external assets, code-generated. */
function FandomCore({ reducedMotion }: { reducedMotion: boolean }) {
  const innerRef = useRef<Mesh>(null)
  const outerRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (reducedMotion) return
    if (innerRef.current) innerRef.current.rotation.y += delta * 0.15
    if (outerRef.current) {
      outerRef.current.rotation.y -= delta * 0.08
      outerRef.current.rotation.x += delta * 0.04
    }
  })

  return (
    <group>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color="#1c2338"
          emissive="#5b7bff"
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>
      <mesh ref={outerRef} scale={1.35}>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color="#7c9bff" wireframe transparent opacity={0.35} />
      </mesh>
      <pointLight color="#5b7bff" intensity={12} distance={6} decay={2} />
    </group>
  )
}

/**
 * One of seven inner "energy fragments" — atmospheric depth cues tied to
 * each category's accent color, orbiting closer to the Core than the
 * outer ring (FRAGMENT_RADIUS < RING_RADIUS, see note above `RING_RADIUS`).
 * They still brighten on hover, so hovering a category's real HTML node
 * (FandomCoreOverlay) visibly lights up the matching inner fragment — a
 * connective visual detail — without ever presenting as a second,
 * independently-clickable "node".
 */
function CategoryFragment({
  angleDeg,
  color,
  isHovered,
  reducedMotion,
}: {
  angleDeg: number
  color: string
  isHovered: boolean
  reducedMotion: boolean
}) {
  const ref = useRef<Mesh>(null)
  const angleRad = MathUtils.degToRad(angleDeg)
  const basePosition: [number, number, number] = [
    Math.cos(angleRad) * FRAGMENT_RADIUS,
    Math.sin(angleRad) * FRAGMENT_RADIUS,
    0,
  ]
  // Deterministic per-node phase offset (not Math.random(), which React's
  // purity rule flags inside render/useMemo) — each node's fixed angle
  // already makes a unique, stable bob-animation offset.
  const phase = angleRad

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const targetScale = isHovered ? 1.7 : 1
    mesh.scale.setScalar(MathUtils.damp(mesh.scale.x, targetScale, 6, state.clock.getDelta() || 0.016))
    if (reducedMotion) return
    mesh.position.z = Math.sin(state.clock.elapsedTime * 0.6 + phase) * 0.12
    mesh.rotation.x += 0.004
    mesh.rotation.y += 0.006
  })

  return (
    <mesh ref={ref} position={basePosition}>
      <octahedronGeometry args={[0.09, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isHovered ? 1 : 0.35}
        roughness={0.3}
        metalness={0.2}
        transparent
        opacity={isHovered ? 1 : 0.75}
      />
    </mesh>
  )
}

function OrbitRing() {
  return (
    <mesh rotation={[0, 0, 0]}>
      <torusGeometry args={[RING_RADIUS, 0.006, 8, 96]} />
      <meshBasicMaterial color="#3a4568" transparent opacity={0.5} />
    </mesh>
  )
}

/** Subtle pointer parallax — deterministic base position, gentle lerp, never uncontrolled. */
function ParallaxRig({
  reducedMotion,
  isMobile,
  children,
}: {
  reducedMotion: boolean
  isMobile: boolean
  children: ReactNode
}) {
  const groupRef = useRef<Group>(null)
  const { pointer } = useThree()

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const target = computeParallaxRotation({
      pointerX: pointer.x,
      pointerY: pointer.y,
      reducedMotion,
      isMobile,
    })
    group.rotation.x = MathUtils.damp(group.rotation.x, target.rotationX, 4, 0.016)
    group.rotation.y = MathUtils.damp(group.rotation.y, target.rotationY, 4, 0.016)
  })

  return <group ref={groupRef}>{children}</group>
}

function Scene({ hoveredCategoryId, reducedMotion, isMobile }: SceneProps) {
  const accentColors = useCategoryAccentColors()

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 2, 4]} intensity={0.6} />
      <Stars
        radius={12}
        depth={20}
        count={isMobile ? 250 : 500}
        factor={2}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.3}
      />
      <ParallaxRig reducedMotion={reducedMotion} isMobile={isMobile}>
        <FandomCore reducedMotion={reducedMotion} />
        <OrbitRing />
        {FANDOM_CORE_NODES.map((node) => (
          <CategoryFragment
            key={node.categoryId}
            angleDeg={node.angleDeg}
            color={accentColors[node.categoryId] ?? '#5b7bff'}
            isHovered={hoveredCategoryId === node.categoryId}
            reducedMotion={reducedMotion}
          />
        ))}
      </ParallaxRig>
    </>
  )
}

export interface FandomCoreSceneProps extends SceneProps {
  onContextLost?: () => void
}

/**
 * The WebGL Fandom Core canvas. Performance guardrails (Phase 4 §13):
 * capped DPR, bounded starfield (250/500 points), 10 total meshes (1 core
 * inner + 1 core outer + 1 ring + 7 category fragments) with low-poly
 * procedural geometry, no post-processing/bloom (glow is emissive-material
 * + CSS-layer only), no texture loading (nothing to leak on unmount — R3F
 * disposes its own managed geometries/materials automatically).
 */
export function FandomCoreScene({ hoveredCategoryId, reducedMotion, isMobile, onContextLost }: FandomCoreSceneProps) {
  return (
    <div className={styles.canvasLayer} data-testid="fandom-core-canvas">
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, isMobile ? 1.25 : 1.5]}
          camera={{ position: [0, 0, 5.5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              onContextLost?.()
            })
          }}
        >
          <Scene hoveredCategoryId={hoveredCategoryId} reducedMotion={reducedMotion} isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  )
}

export default FandomCoreScene
