"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private readonly reset = () => this.setState({ hasError: false });

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Something went wrong displaying the board</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Reservation data is safe in the database. Try again.</p>
          <Button variant="outline" size="sm" onClick={this.reset}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
}
