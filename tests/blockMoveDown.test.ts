jest.mock('konva', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('color', () => ({
  __esModule: true,
  default: () => ({ darken: () => ({ hex: () => '#000' }) }),
}));
import { Block } from '../src/block';
import { GAME_BOARD_DEFAULTS } from '../src/gameBoardConfig';

describe('Block movement', () => {
  it('moves down by incrementing row', () => {
    const block = new Block(0, 5);
    block.moveDown();
    expect(block.row).toBe(1);
    expect(block.col).toBe(5);
  });

  it('moves left by decrementing col', () => {
    const block = new Block(5, 5);
    block.moveLeft();
    expect(block.row).toBe(5);
    expect(block.col).toBe(4);
  });

  it('moves right by incrementing col', () => {
    const block = new Block(5, 5);
    block.moveRight();
    expect(block.row).toBe(5);
    expect(block.col).toBe(6);
  });
});
