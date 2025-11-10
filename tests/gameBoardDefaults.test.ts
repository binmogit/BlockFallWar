jest.mock('konva', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('color', () => ({
  __esModule: true,
  default: () => ({ darken: () => ({ hex: () => '#000' }) }),
}));
import { GameBoardConfig } from '../src/gameBoard';
import { GAME_BOARD_DEFAULTS } from '../src/gameBoardConfig';

describe('GameBoardConfig', () => {
  it('loads default config values without DOM', () => {
    const config = new GameBoardConfig();
    expect(config.fallInterval).toBe(GAME_BOARD_DEFAULTS.fallInterval);
    expect(config.moveInterval).toBe(GAME_BOARD_DEFAULTS.moveInterval);
    expect(config.rows).toBe(GAME_BOARD_DEFAULTS.rows);
    expect(config.cols).toBe(GAME_BOARD_DEFAULTS.cols);
  });

  it('overrides config values', () => {
    const config = new GameBoardConfig({ fallInterval: 123, moveInterval: 456, rows: 7, cols: 8 });
    expect(config.fallInterval).toBe(123);
    expect(config.moveInterval).toBe(456);
    expect(config.rows).toBe(7);
    expect(config.cols).toBe(8);
  });
});
