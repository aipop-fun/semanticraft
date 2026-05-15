'use client';

import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import type { SemanticraftConfig, SemanticraftContextValue } from './types';

const SemanticraftContext = createContext<SemanticraftContextValue | null>(null);

export function SemanticraftProvider({
  children,
  apiKey,
  contentSelector,
  mode = 'static',
  parseOptions,
  onError,
}: SemanticraftConfig & { children: React.ReactNode }) {
  const [parsedContent, setParsedContent] = useState<SemanticraftContextValue['parsedContent']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const config = useMemo<SemanticraftConfig>(
    () => ({ apiKey, contentSelector, mode, parseOptions, onError }),
    [apiKey, contentSelector, mode, parseOptions, onError]
  );

  const parse = useCallback(
    async (content: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('https://api.semanticraft.io/v1/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ content, options: parseOptions }),
        });

        if (!response.ok) {
          throw new Error(`Parse failed: ${response.statusText}`);
        }

        const result = await response.json();
        setParsedContent(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Parse failed');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, parseOptions, onError]
  );

  const value = useMemo<SemanticraftContextValue>(
    () => ({ config, parse, parsedContent, isLoading, error }),
    [config, parse, parsedContent, isLoading, error]
  );

  return React.createElement(SemanticraftContext.Provider, { value }, children);
}

export function useSemanticraftContext(): SemanticraftContextValue {
  const context = useContext(SemanticraftContext);
  if (!context) {
    throw new Error('useSemanticraftContext must be used within SemanticraftProvider');
  }
  return context;
}