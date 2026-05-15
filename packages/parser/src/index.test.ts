import { describe, it, expect } from 'vitest';
import { createParser } from '../src/index';

describe('Semanticraft Parser', () => {
  const parser = createParser();

  it('should parse basic markdown with product', async () => {
    const result = await parser.parse(`
# iPhone 15 Pro Max

**Preço:** R$ 9.499

- Tela: 6.7" Super Retina XDR
- Câmera: 48MP

## FAQ

**P: Tem 5G?** R: Sim, compatível com 5G.
    `);

    expect(result.llmseo_version).toBe('1.0');
    expect(result.metadata.title).toBe('iPhone 15 Pro Max');
    expect(result.metadata.language).toBe('pt-BR');
    expect(result.entities.length).toBeGreaterThan(0);
    expect(result.entities.some(e => e.type === 'Product')).toBe(true);
    expect(result.entities.some(e => e.type === 'Offer')).toBe(true);
  });

  it('should extract price correctly', async () => {
    const result = await parser.parse(`
# MacBook Pro M3

**Preço:** R$ 12.499
    `);

    const offer = result.entities.find(e => e.type === 'Offer');
    expect(offer).toBeDefined();
    expect(offer?.price).toBe(12499);
    expect(offer?.priceCurrency).toBe('BRL');
  });

  it('should validate markdown', () => {
    const result = parser.validate(`
# Title

- Item 1
- Item 2
    `);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should detect deep nesting warnings', () => {
    const result = parser.validate(`
# Title

- Level 1
    - Level 2
        - Level 3
            - Level 4
                - Level 5
                    - Level 6
    `);

    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should classify intent as transactional for product with price', async () => {
    const result = await parser.parse(`
# Product Name

**Preço:** R$ 100
    `);

    expect(result.intent.primary).toBe('transactional');
    expect(result.intent.signals.hasPrice).toBe(true);
    expect(result.intent.signals.isProductPage).toBe(true);
  });

  it('should calculate confidence correctly', async () => {
    const result = await parser.parse(`
# Test Product

**Preço:** R$ 50
    `);

    expect(result.confidence.overall).toBeGreaterThan(0.5);
    expect(result.confidence.factors).toBeDefined();
  });
});