import type { Entity, IntentClassification } from './validator';

export type IntentSignal =
  | 'hasPrice'
  | 'hasBuyIntent'
  | 'isComparison'
  | 'isHowTo'
  | 'isTroubleshooting'
  | 'isProductPage';

const INTENT_WEIGHTS: Record<IntentSignal, number> = {
  hasPrice: 0.9,
  hasBuyIntent: 0.85,
  isComparison: 0.7,
  isHowTo: 0.5,
  isTroubleshooting: 0.6,
  isProductPage: 0.8,
};

export function classifyIntent(entities: Entity[]): IntentClassification {
  const signals = detectSignals(entities);
  const { primary, secondary } = determineIntent(signals);
  const confidence = calculateIntentConfidence(signals, primary);

  return {
    primary,
    secondary,
    confidence,
    signals,
    pageType: inferPageType(signals, entities),
  };
}

export function detectSignals(entities: Entity[]): IntentClassification['signals'] {
  let hasPrice = false;
  let hasBuyIntent = false;
  let isComparison = false;
  let isHowTo = false;
  let isTroubleshooting = false;
  let isProductPage = false;

  for (const entity of entities) {
    switch (entity.type) {
      case 'Offer':
        hasPrice = true;
        hasBuyIntent = true;
        break;
      case 'Product':
        isProductPage = true;
        break;
      case 'Specification':
        if (entity.content.toLowerCase().includes('vs') ||
            entity.content.toLowerCase().includes('versus') ||
            entity.content.toLowerCase().includes('comparar')) {
          isComparison = true;
        }
        break;
      case 'Question':
        const q = entity.content.toLowerCase();
        if (q.includes('how') || q.includes('como') || q.includes(' passo ')) {
          isHowTo = true;
        }
        if (q.includes('error') || q.includes('problema') || q.includes('falha') ||
            q.includes('troubleshoot') || q.includes('solucionar')) {
          isTroubleshooting = true;
        }
        break;
      case 'CallToAction':
        if (entity.type === 'CallToAction') {
          const ctaIntent = (entity as any).intent;
          if (ctaIntent === 'buy' || ctaIntent === 'subscribe') {
            hasBuyIntent = true;
          }
        }
        break;
    }
  }

  return {
    hasPrice,
    hasBuyIntent,
    isComparison,
    isHowTo,
    isTroubleshooting,
    isProductPage,
  };
}

export function determineIntent(signals: IntentClassification['signals']): {
  primary: IntentClassification['primary'];
  secondary?: IntentClassification['secondary'];
} {
  if (signals.hasBuyIntent && signals.hasPrice) {
    return { primary: 'transactional', secondary: ['comparative', 'informational'] };
  }

  if (signals.isComparison) {
    return { primary: 'comparative', secondary: ['informational'] };
  }

  if (signals.isHowTo || signals.isTroubleshooting) {
    return { primary: 'informational' };
  }

  if (signals.hasPrice && !signals.hasBuyIntent) {
    return { primary: 'transactional' };
  }

  return { primary: 'informational' };
}

export function calculateIntentConfidence(
  signals: IntentClassification['signals'],
  primary: IntentClassification['primary']
): number {
  let score = 0;
  let count = 0;

  for (const [signal, active] of Object.entries(signals)) {
    if (active) {
      score += INTENT_WEIGHTS[signal as IntentSignal] || 0.5;
      count++;
    }
  }

  if (count === 0) {
    return 0.3;
  }

  const baseScore = score / count;

  if (primary === 'transactional') {
    return Math.min(0.95, baseScore + 0.1);
  }

  if (primary === 'comparative') {
    return Math.min(0.9, baseScore + 0.05);
  }

  return baseScore;
}

export function inferPageType(
  signals: IntentClassification['signals'],
  entities: Entity[]
): IntentClassification['pageType'] {
  if (signals.hasPrice && signals.isProductPage) {
    return 'product';
  }

  if (signals.hasPrice && !signals.isProductPage) {
    return 'pricing';
  }

  if (signals.isComparison) {
    return 'comparison';
  }

  const reviewCount = entities.filter(e => e.type === 'Review').length;
  if (reviewCount >= 2) {
    return 'review';
  }

  const questionCount = entities.filter(e => e.type === 'Question').length;
  if (questionCount >= 3) {
    return 'faq';
  }

  const howToCount = entities.filter(e =>
    e.type === 'Question' && e.content.toLowerCase().includes('how')
  ).length;
  if (howToCount >= 2) {
    return 'blog';
  }

  if (signals.isProductPage) {
    return 'landing';
  }

  return 'landing';
}

export function mergeIntentClassification(
  ...intents: IntentClassification[]
): IntentClassification {
  if (intents.length === 0) {
    return {
      primary: 'informational',
      confidence: 0.5,
      signals: {
        hasPrice: false,
        hasBuyIntent: false,
        isComparison: false,
        isHowTo: false,
        isTroubleshooting: false,
        isProductPage: false,
      },
      pageType: 'landing',
    };
  }

  if (intents.length === 1) {
    return intents[0];
  }

  const mergedSignals: IntentClassification['signals'] = {
    hasPrice: intents.some(i => i.signals.hasPrice),
    hasBuyIntent: intents.some(i => i.signals.hasBuyIntent),
    isComparison: intents.some(i => i.signals.isComparison),
    isHowTo: intents.some(i => i.signals.isHowTo),
    isTroubleshooting: intents.some(i => i.signals.isTroubleshooting),
    isProductPage: intents.some(i => i.signals.isProductPage),
  };

  const avgConfidence = intents.reduce((sum, i) => sum + i.confidence, 0) / intents.length;

  const intentCounts: Record<string, number> = {};
  for (const intent of intents) {
    intentCounts[intent.primary] = (intentCounts[intent.primary] || 0) + 1;
  }

  const primary = (Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'informational') as IntentClassification['primary'];

  return {
    primary,
    confidence: avgConfidence,
    signals: mergedSignals,
    pageType: intents[0]?.pageType || 'landing',
  };
}