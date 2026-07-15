import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * ErrorCard per design.md §14.3
 * Replaces skeleton after 8s timeout or API error without full-page takeover.
 */
const ErrorCard = ({ message = "Couldn't load data", onRetry, className }) => {
  return (
    <div className={cn("border border-status-warning bg-status-warning/10 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-foreground animate-in fade-in-50 duration-200", className)}>
      <div className="flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-lg bg-status-warning/20 border border-status-warning/30 flex items-center justify-center text-status-warning shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{message}</h4>
          <p className="text-xs text-text-muted mt-0.5">Check your connection and retry.</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0 border-status-warning/30 hover:bg-status-warning/20 font-medium">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Try again</span>
        </Button>
      )}
    </div>
  );
};

/**
 * AsyncState wrapper per design.md §14.1 & §14.3
 * Handles loading skeleton rendering and 8-second timeout to ErrorCard.
 */
const AsyncState = ({ isLoading, isError, errorMessage, onRetry, skeleton, children }) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setHasTimedOut(false);
      timer = setTimeout(() => {
        setHasTimedOut(true);
      }, 8000); // 8 seconds per design.md §14.1
    } else {
      setHasTimedOut(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    if (hasTimedOut) {
      return <ErrorCard message="Data loading timed out after 8 seconds" onRetry={onRetry} />;
    }
    return skeleton || null;
  }

  if (isError) {
    return <ErrorCard message={errorMessage || "Couldn't load requested data"} onRetry={onRetry} />;
  }

  return children;
};

/**
 * EmptyState per design.md §11 (Invitation, not apology)
 */
const EmptyState = ({ title, description, actionLabel, onAction, icon: Icon = Plus, className }) => {
  return (
    <div className={cn("border border-dashed border-border bg-surface rounded-lg p-8 text-center flex flex-col items-center justify-center space-y-3 animate-in fade-in-50 duration-200", className)}>
      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-ink dark:text-chalk-teal">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-foreground leading-snug">{title}</h3>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="accent" size="sm" onClick={onAction} className="mt-2">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
};

export { ErrorCard, AsyncState, EmptyState };
