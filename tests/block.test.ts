import { Block } from '../src/block';

describe('Block', () => {
  it('initializes with correct position', () => {
    const block = new Block(0, 5);
    expect(block.row).toBe(0);
    expect(block.col).toBe(5);
  });
});
