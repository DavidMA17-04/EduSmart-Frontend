import { Component, Suspense, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { ErrorScreen, ErrorScreenAction } from './ErrorScreen';
import styles from './PageSuspense.module.css';

const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|Loading (CSS )?chunk|ChunkLoadError|error loading dynamically/i;

export function PageLoading({ fullscreen = false }: { fullscreen?: boolean }) {
  return (
    <div className={`${styles.loading} ${fullscreen ? styles.fullscreen : ''}`.trim()} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Cargando…</span>
    </div>
  );
}

interface BoundaryProps {
  /** Cambia al navegar: limpia el error para que la página nueva intente cargar. */
  resetKey?: string;
  fullscreen?: boolean;
  children: ReactNode;
}

interface BoundaryState {
  failed: boolean;
  /** La página no se pudo descargar (conexión) vs. falló al mostrarse. */
  network: boolean;
}

class PageErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false, network: false };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
    return { failed: true, network: CHUNK_ERROR.test(message) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('No se pudo mostrar la página', error, info.componentStack);
  }

  componentDidUpdate(previous: BoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false, network: false });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const { network } = this.state;
    return (
      <ErrorScreen
        actions={
          <ErrorScreenAction
            icon={<RefreshCw aria-hidden="true" size={18} />}
            onClick={() => window.location.reload()}
          >
            Recargar página
          </ErrorScreenAction>
        }
        description={
          <p>
            {network
              ? 'No pudimos descargar esta sección. Revise su conexión a internet y vuelva a intentarlo.'
              : 'Ocurrió un problema al mostrar esta sección. Recargue la página; si se repite, avise a la administración del colegio.'}
          </p>
        }
        eyebrow={network ? 'Sin conexión' : 'Error inesperado'}
        standalone={this.props.fullscreen}
        title={network ? 'No se pudo cargar esta página' : 'Algo salió mal'}
        variant={network ? 'offline' : 'crash'}
      />
    );
  }
}

/** Muestra un indicador mientras se descarga una página y un aviso si falla. */
export function PageSuspense({
  children,
  resetKey,
  fullscreen = false,
}: PropsWithChildren<{ resetKey?: string; fullscreen?: boolean }>) {
  return (
    <PageErrorBoundary fullscreen={fullscreen} resetKey={resetKey}>
      <Suspense fallback={<PageLoading fullscreen={fullscreen} />}>{children}</Suspense>
    </PageErrorBoundary>
  );
}
