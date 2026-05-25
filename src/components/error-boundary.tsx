"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4 pixel-border pixel-shadow bg-[var(--card)] p-6">
            <h1 className="font-pixel text-xl text-[var(--destructive)]">
              Something went wrong
            </h1>
            <p className="font-retro text-sm text-[var(--muted-foreground)]">
              The expedition hit an unexpected error. You can try again without
              reloading the page.
            </p>
            <Button onClick={this.handleRetry} className="font-pixel">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
