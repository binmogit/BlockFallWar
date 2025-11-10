jest.mock('konva', () => ({
  __esModule: true,
  default: {},
}));
let mockHex = '#000';
export const setMockHex = (hex: string) => {
  mockHex = hex;
};
jest.mock('color', () => ({
  __esModule: true,
  // The 'amount' parameter to darken is intentionally ignored in these tests
  default: () => ({ darken: (_amount: number) => ({ hex: () => mockHex }) }),
}));

beforeEach(() => {
  mockHex = '#000';
});
import { GameBoardConfig } from '../src/gameBoard';
import { GAME_BOARD_DEFAULTS } from '../src/gameBoardConfig';

describe('GameBoardConfig', () => {
  it('loads default config values without DOM', () => {
    const config = new GameBoardConfig();
    expect(config.rows).toBe(GAME_BOARD_DEFAULTS.rows);
    expect(config.cols).toBe(GAME_BOARD_DEFAULTS.cols);
  });

  it('overrides config values', () => {
    const config = new GameBoardConfig({ rows: 7, cols: 8 });
    expect(config.rows).toBe(7);
    expect(config.cols).toBe(8);
  });
});
