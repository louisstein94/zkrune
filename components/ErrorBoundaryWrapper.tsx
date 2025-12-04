"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // Log to analytics service (if implemented)
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Error Caught', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
    
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-zk-darker flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zk-dark border border-red-500/30 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-hatton text-white">Bir Hata Oluştu</h2>
            <p className="text-sm text-zk-gray">Üzgünüz, beklenmedik bir sorun yaşandı</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400 font-mono">{error.message}</p>
            {process.env.NODE_ENV === 'development' && error.stack && (
              <pre className="mt-2 text-xs text-red-300 overflow-auto max-h-32">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all"
          >
            Tekrar Dene
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 border border-zk-gray/30 text-zk-gray rounded-lg font-medium hover:border-zk-primary hover:text-zk-primary transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-zk-gray/20">
          <p className="text-xs text-zk-gray text-center">
            Sorun devam ederse{' '}
            <a href="https://github.com/louisstein94/zkrune/issues" className="text-zk-primary hover:underline">
              GitHub'da bildir
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ErrorBoundaryWrapper(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}

