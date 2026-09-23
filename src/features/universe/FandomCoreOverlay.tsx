import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { FANDOM_CORE_NODES } from './fandomCoreNodes'
import styles from './FandomCoreOverlay.module.css'

export interface FandomCoreOverlayProps {
  hoveredCategoryId: string | null
  onHoverChange: (categoryId: string | null) => void
}

/**
 * The Fandom Core's real interaction surface — seven semantic, keyboard-
 * reachable links, positioned in a ring via CSS trig functions (`cos()`/
 * `sin()`), independent of the WebGL canvas underneath. This is the SAME
 * component used whether WebGL is available (layered over the canvas) or
 * not (layered over the static gradient fallback) — one accessible
 * implementation, not two (docs/03_UX_ARCHITECTURE.md, Phase 4 §9/§10):
 * "if the WebGL layer disappears entirely, the user must still be able to
 * reach every fandom category."
 *
 * `pointer-events: none` on the wrapper + `auto` on each link means empty
 * space between nodes never blocks the canvas's own pointer-based parallax.
 */
export function FandomCoreOverlay({ hoveredCategoryId, onHoverChange }: FandomCoreOverlayProps) {
  return (
    <div className={styles.overlay}>
      <ul className={styles.nodeList}>
        {FANDOM_CORE_NODES.map((node) => {
          const isHovered = hoveredCategoryId === node.categoryId
          const style = {
            '--node-angle': `${node.angleDeg}deg`,
            '--node-accent': `var(${node.accentVar})`,
          } as CSSProperties

          return (
            <li key={node.categoryId} className={styles.nodeItem} style={style}>
              <Link
                to={`/${node.path}`}
                className={`${styles.nodeLink} ${isHovered ? styles.nodeLinkHovered : ''}`}
                aria-label={`Explore ${node.label}`}
                onMouseEnter={() => onHoverChange(node.categoryId)}
                onMouseLeave={() => onHoverChange(null)}
                onFocus={() => onHoverChange(node.categoryId)}
                onBlur={() => onHoverChange(null)}
              >
                <span className={styles.nodeDot} aria-hidden="true" />
                <span className={styles.nodeLabel}>{node.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
