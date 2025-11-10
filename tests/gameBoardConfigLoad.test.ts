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
});
