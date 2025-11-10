import { Block } from '../src/block';
import { GAME_BOARD_DEFAULTS } from '../src/gameBoardConfig';

describe('Block movement', () => {
  it('moves down by incrementing row', () => {
    const block = new Block(0, 5);
    block.moveDown();
    expect(block.row).toBe(1);
    expect(block.col).toBe(5);
  });

  it('moves down multiple times', () => {
    const block = new Block(0, 5);
    for (let i = 0; i < 3; i++) {
      block.moveDown();
    }
    expect(block.row).toBe(3);
  });
});
