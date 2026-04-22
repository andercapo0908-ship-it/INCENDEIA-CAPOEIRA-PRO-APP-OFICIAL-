import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado pelo sistema:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center">
          <div className="bg-zinc-900 border border-red-600/30 p-8 rounded-2xl max-w-md w-full">
            <h2 style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              OPS! ALGO DEU ERRADO
            </h2>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {this.state.error?.message || "Ocorreu um erro inesperado no aplicativo."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              RECARREGAR APP
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
