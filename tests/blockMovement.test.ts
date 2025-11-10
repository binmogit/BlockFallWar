jest.mock('konva', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('color', () => ({
  __esModule: true,
  default: () => ({ darken: (amount: number) => ({ hex: () => '#000' }) }),
}));
import { Block } from '../src/block';
import { GAME_BOARD_DEFAULTS } from '../src/gameBoardConfig';

describe('Block movement', () => {
let mockHex = '#000';
const setMockHex = (hex: string) => { mockHex = hex; };
jest.mock('color', () => ({
  __esModule: true,
  default: () => ({ darken: (amount: number) => ({ hex: () => mockHex }) }),
}));
  it('does not move left out of bounds', () => {
    const block = new Block(5, 0);
    block.moveLeft();
    expect(block.col).toBe(0);
  });

  it('does not move right out of bounds', () => {
    const block = new Block(5, GAME_BOARD_DEFAULTS.cols - 1);
    block.moveRight();
    expect(block.col).toBe(GAME_BOARD_DEFAULTS.cols - 1);
  });

  it('does not move down out of bounds', () => {
    const block = new Block(GAME_BOARD_DEFAULTS.rows - 1, 5);
    block.moveDown();
    expect(block.row).toBe(GAME_BOARD_DEFAULTS.rows - 1);
  });
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
