/**
 * Valor 0 (día) → 1 (noche) suavizado por `Lights` en cada frame.
 * Los objetos lo leen en su propio `useFrame` para animar emisivos sin re-renderizar React.
 */
export const nightMix = { value: 0 }

/** Respeta prefers-reduced-motion */
export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
