/**
 * Sombras bajo demanda (F25). La habitación es casi estática, así que los shadow maps no se recalculan cada frame:
 * cualquier cosa que mueva objetos con sombra llama a `markShadowsDirty()` y `ShadowUpdater` los refresca.
 */
export const shadowState = { dirty: true }

export function markShadowsDirty() {
  shadowState.dirty = true
}
