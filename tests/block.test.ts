jest.mock('konva', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('color', () => ({
  __esModule: true,
  default: (input: any) => ({ darken: (amount: number) => ({ hex: () => '#000' }) }),
}));
import { Block } from '../src/block';
import { Player } from '../src/player';

describe('Block', () => {
  describe('spawnAtTop', () => {
    const playerTypes = ['player', 'bot', 'fakeplayer'] as const;
    playerTypes.forEach((type) => {
      it(`spawns at top row for player type '${type}'`, () => {
        const player = Player.create(type);
        const block = Block.spawnAtTop(4, player);
        expect(block.row).toBe(0);
        expect(block.col).toBe(4);
        expect(block.color).toBe(player.color);
      });
    });

    it('spawns at col 0 and maxColumn', () => {
      const player = Player.create('player');
      const block0 = Block.spawnAtTop(0, player);
      expect(block0.col).toBe(0);
      const blockMax = Block.spawnAtTop(9, player);
      expect(blockMax.col).toBe(9);
    });

    it('does not clamp col out of range (caller responsibility)', () => {
      const player = Player.create('player');
      const blockNeg = Block.spawnAtTop(-1, player);
      expect(blockNeg.col).toBe(-1);
      const blockOver = Block.spawnAtTop(100, player);
      expect(blockOver.col).toBe(100);
    });
  });

  describe('movement', () => {
    it('moveDown increments row and respects boundary', () => {
      const block = new Block(0, 5);
      expect(block.moveDown(20)).toBe(true);
      expect(block.row).toBe(1);
      block.row = 19;
      expect(block.moveDown(20)).toBe(false);
      expect(block.row).toBe(19);
    });

    it('moveLeft decrements col and respects boundary', () => {
      const block = new Block(5, 1);
      expect(block.moveLeft(0)).toBe(true);
      expect(block.col).toBe(0);
      expect(block.moveLeft(0)).toBe(false);
      expect(block.col).toBe(0);
    });

    it('moveRight increments col and respects boundary', () => {
      const block = new Block(5, 8);
      expect(block.moveRight(10)).toBe(true);
      expect(block.col).toBe(9);
      expect(block.moveRight(10)).toBe(false);
      expect(block.col).toBe(9);
    });

    it('moveDown does not move with invalid maxRows', () => {
      const block = new Block(0, 5);
      expect(block.moveDown(-1)).toBe(false);
      expect(block.row).toBe(0);
      expect(block.moveDown(0)).toBe(false);
      expect(block.row).toBe(0);
    });

    it('moveLeft does not move with invalid minCol', () => {
      const block = new Block(5, 0);
      expect(block.moveLeft(-1)).toBe(false);
      expect(block.col).toBe(0);
    });

    it('moveRight does not move with invalid maxCols', () => {
      const block = new Block(5, 9);
      expect(block.moveRight(-1)).toBe(false);
      expect(block.col).toBe(9);
      expect(block.moveRight(0)).toBe(false);
      expect(block.col).toBe(9);
    });
  });
});
