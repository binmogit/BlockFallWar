import { Block } from '../src/block';
import { GAME_BOARD_DEFAULTS } from '../src/gameBoardConfig';

describe('Block movement', () => {
  it('moves down by incrementing row after interval', async () => {
    const block = new Block(0, 5);
    const interval = GAME_BOARD_DEFAULTS.fallInterval;
    await block.moveDownWithInterval(interval);
    expect(block.row).toBe(1);
    expect(block.col).toBe(5);
  });

  it('moves down multiple times with interval', async () => {
    const block = new Block(0, 5);
    const interval = GAME_BOARD_DEFAULTS.fallInterval;
    for (let i = 0; i < 3; i++) {
      await block.moveDownWithInterval(interval);
    }
    expect(block.row).toBe(3);
  });
});
