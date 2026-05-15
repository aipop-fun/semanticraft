import { useMemo } from 'react';
import { useSemanticraftContext } from './SemanticraftProvider';
import type { UseSemanticraftReturn } from './types';

export function useSemanticraft(): UseSemanticraftReturn {
  const { config, parse, parsedContent, isLoading, error } = useSemanticraftContext();

  const result = useMemo<UseSemanticraftReturn>(
    () => ({
      data: parsedContent,
      parse,
      isLoading,
      error,
      entities: parsedContent?.entities ?? [],
      relationships: parsedContent?.relationships ?? [],
      intent: parsedContent?.intent ?? null,
      confidence: parsedContent?.confidence ?? null,
    }),
    [parsedContent, parse, isLoading, error]
  );

  return result;
}