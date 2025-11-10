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
  it('moves left from col 1 to col 0', () => {
    const block = new Block(5, 1);
    block.moveLeft(0);
    expect(block.col).toBe(0);
  });

  it('moves right from col 8 to col 9', () => {
    const block = new Block(5, 8);
    block.moveRight(10);
    expect(block.col).toBe(9);
  });

  it('multiple sequential moves persist state', () => {
    const block = new Block(0, 0);
    block.moveRight(10);
    block.moveRight(10);
    block.moveDown(20);
    block.moveDown(20);
    block.moveLeft(0);
    expect(block.col).toBe(1);
    expect(block.row).toBe(2);
  });

  it('does not move left with negative minCol', () => {
    const block = new Block(5, 0);
    block.moveLeft(-5);
    expect(block.col).toBe(0);
  });

  it('does not move right with oversized maxCols', () => {
    const block = new Block(5, 9);
    block.moveRight(100);
    expect(block.col).toBe(10);
    // Should not exceed maxCols - 1, so next move should not increment
    block.moveRight(10);
    expect(block.col).toBe(9);
  });

  it('does not move down with oversized maxRows', () => {
    const block = new Block(19, 5);
    block.moveDown(100);
    expect(block.row).toBe(20);
    // Should not exceed maxRows - 1, so next move should not increment
    block.moveDown(20);
    expect(block.row).toBe(19);
  });
  it('does not move left out of bounds', () => {
    const block = new Block(5, 0);
    block.moveLeft(0);
    expect(block.col).toBe(0);
  });

  it('does not move right out of bounds', () => {
    const block = new Block(5, GAME_BOARD_DEFAULTS.cols - 1);
    block.moveRight(GAME_BOARD_DEFAULTS.cols);
    expect(block.col).toBe(GAME_BOARD_DEFAULTS.cols - 1);
  });

  it('does not move down out of bounds', () => {
    const block = new Block(GAME_BOARD_DEFAULTS.rows - 1, 5);
    block.moveDown(GAME_BOARD_DEFAULTS.rows);
    expect(block.row).toBe(GAME_BOARD_DEFAULTS.rows - 1);
  });
  it('moves down by incrementing row', () => {
    const block = new Block(0, 5);
    block.moveDown(GAME_BOARD_DEFAULTS.rows);
    expect(block.row).toBe(1);
    expect(block.col).toBe(5);
  });

  it('moves left by decrementing col', () => {
    const block = new Block(5, 5);
    block.moveLeft(0);
    expect(block.row).toBe(5);
    expect(block.col).toBe(4);
  });

  it('moves right by incrementing col', () => {
    const block = new Block(5, 5);
    block.moveRight(GAME_BOARD_DEFAULTS.cols);
    expect(block.row).toBe(5);
    expect(block.col).toBe(6);
  });
});
