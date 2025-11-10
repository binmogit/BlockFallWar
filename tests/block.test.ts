jest.mock('konva', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('color', () => ({
  __esModule: true,
  default: () => ({ darken: (amount: number) => ({ hex: () => '#000' }) }),
}));
import { Block } from '../src/block';
import { Player } from '../src/player';

describe('Block', () => {
  it('spawns at top row using spawnAtTop', () => {
    const player = Player.create('player');
    const block = Block.spawnAtTop(3, player);
    expect(block.row).toBe(0);
    expect(block.col).toBe(3);
    expect(block.color).toBe(player.color);
  });
});
