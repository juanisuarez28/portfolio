import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

/** Si la escena 3D falla, se muestra la versión 2D en lugar de una pantalla vacía (F12). */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[portfolio-3d] la escena falló, se muestra la versión 2D', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
