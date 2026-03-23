"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Don't catch Next.js internal errors (redirects, not-found)
        if ((error as any).digest?.startsWith("NEXT_REDIRECT") || (error as any).digest?.startsWith("NEXT_NOT_FOUND")) {
            throw error;
        }
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] w-full items-center justify-center p-6">
                    <Card className="max-w-md border-destructive/20 shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl font-bold italic">Something went wrong</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">
                                An unexpected error occurred while rendering this page. This might be a temporary issue.
                            </p>
                            {this.state.error && (
                                <div className="mt-4 rounded bg-muted p-2 text-left text-xs font-mono overflow-auto max-h-32">
                                    {this.state.error.message}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button onClick={this.handleReset} variant="outline" className="gap-2">
                                <RefreshCcw className="h-4 w-4" />
                                Reload Page
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
