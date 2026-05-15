import React, { useEffect, useState, useCallback } from 'react';
import { useSemanticraftContext } from './SemanticraftProvider';
import type { SemanticraftContentProps } from './types';

export function SemanticraftContent({
  children,
  selector,
  parseOptions,
  renderLoading,
  renderError,
  fallback,
}: SemanticraftContentProps) {
  const { parse, isLoading, error } = useSemanticraftContext();
  const [hasLoaded, setHasLoaded] = useState(false);

  const effectiveSelector = selector ?? (typeof document !== 'undefined' ? 'article' : null);
  const contentToParse = children ?? '';

  const doParse = useCallback(async () => {
    if (!contentToParse) return;
    try {
      await parse(contentToParse);
      setHasLoaded(true);
    } catch {
    }
  }, [contentToParse, parse]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    doParse();
  }, [doParse]);

  if (isLoading) {
    return renderLoading?.() ?? fallback ?? null;
  }

  if (error) {
    return renderError?.(error) ?? fallback ?? null;
  }

  if (!hasLoaded) {
    return fallback ?? null;
  }

  return React.createElement('div', { 'data-semanticraft-content': true, 'data-selector': effectiveSelector }, children);
}