import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-brand-card p-8 rounded-3xl border border-brand-red shadow-2xl max-w-md">
            <h1 className="text-2xl font-suez text-brand-red mb-4">Ops! Algo deu errado.</h1>
            <p className="text-gray-400 mb-6 text-sm">
              Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
            </p>
            <pre className="bg-black/50 p-4 rounded-xl text-left text-[10px] text-red-400 overflow-auto max-h-40 mb-6 font-mono">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-red text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all"
            >
              RECARREGAR PÁGINA
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
