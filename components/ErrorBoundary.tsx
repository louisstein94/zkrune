"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zk-darker flex items-center justify-center px-8">
          <div className="max-w-2xl text-center">
            <div className="text-8xl mb-8">⚠️</div>
            <h1 className="font-hatton text-4xl text-white mb-4">
              Something Went Wrong
            </h1>
            <p className="text-xl text-zk-gray mb-8">
              The runes encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {this.state.error && (
              <div className="mb-8 p-4 bg-zk-dark/50 border border-red-500/30 rounded-xl text-left">
                <p className="text-sm text-red-400 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-8 py-3 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:bg-zk-primary/10 transition-all"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

