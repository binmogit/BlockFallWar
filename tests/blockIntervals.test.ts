jest.mock('konva', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('color', () => ({
  __esModule: true,
  default: (input: any) => ({ darken: (amount: number) => ({ hex: () => '#000' }) }),
}));
import { Block } from '../src/block';
import { BLOCK_DEFAULTS } from '../src/blockConfig';

describe('Block interval validation', () => {
  it('falls back to defaults for negative or zero intervals', () => {
    const b1 = new Block(0, 0, '#fff', -100, -100);
    expect(b1.fallInterval).toBe(BLOCK_DEFAULTS.fallInterval);
    expect(b1.moveInterval).toBe(BLOCK_DEFAULTS.moveInterval);
    expect(b1.fallInterval).toBeGreaterThanOrEqual(16);
    expect(b1.moveInterval).toBeGreaterThanOrEqual(16);

    const b2 = new Block(0, 0, '#fff', 0, 0);
    expect(b2.fallInterval).toBe(BLOCK_DEFAULTS.fallInterval);
    expect(b2.moveInterval).toBe(BLOCK_DEFAULTS.moveInterval);
  });

  it('falls back to defaults for extremely large intervals', () => {
    const huge = 1_000_000_000;
    const b = new Block(0, 0, '#fff', huge, huge);
    expect(b.fallInterval).toBe(BLOCK_DEFAULTS.fallInterval);
    expect(b.moveInterval).toBe(BLOCK_DEFAULTS.moveInterval);
  });

  it('accepts and normalizes reasonable intervals', () => {
    const b = new Block(0, 0, '#fff', 123.4, 99.6);
    expect(b.fallInterval).toBe(123);
    expect(b.moveInterval).toBe(100);
  });

  it('accepts integer intervals without modification', () => {
    const b = new Block(0, 0, '#fff', 100, 200);
    expect(b.fallInterval).toBe(100);
    expect(b.moveInterval).toBe(200);
  });
});
