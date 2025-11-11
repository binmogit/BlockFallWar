jest.mock('konva', () => ({
  __esModule: true,
  default: {
    Stage: class {
      constructor(_opts: any) {}
      add() {}
      width(_w?: number) {
        return _w ?? 0;
      }
      height(_h?: number) {
        return _h ?? 0;
      }
    },
    Layer: class {
      add() {}
      batchDraw() {}
      destroyChildren() {}
    },
    Rect: class {},
    Line: class {},
  },
}));

import { resetMockHex } from './utils/colorMock';
import { MockTickService } from '../src/tickService';
import { GameBoard } from '../src/gameBoard';

// Use a named constant for the expected fall interval used in tests so the
// intent is explicit and easy to adjust.
const FALL_INTERVAL_MS = 300;

describe('GameBoard integration with MockTickService', () => {
  // Keep previous globals so tests do not leak into each other
  let _prevWindow: any;
  let _prevPerformance: any;
  let _prevDocument: any;

  beforeEach(() => {
    _prevWindow = (global as any).window;
    _prevPerformance = (global as any).performance;
    _prevDocument = (global as any).document;
    // Minimal DOM-like fixture (node doesn't have jsdom). We provide minimal
    // `window` and `document` objects with the APIs `GameBoard` expects.
    const boardDiv: any = { innerHTML: '', className: 'board' };
    const intervalDiv: any = {
      id: 'interval-1',
      // parameter intentionally unused; prefix with _ to satisfy lint rules
      querySelector: (_sel: string) => null,
      textContent: '',
    };
    const parent: any = {
      querySelector: (sel: string) => (sel === '.board' ? boardDiv : intervalDiv),
      getBoundingClientRect: () => ({ width: 320, height: 640 }),
    };
    // Minimal globals
    (global as any).window = {
      addEventListener: (_: string, __: any) => {},
      removeEventListener: (_: string, __: any) => {},
    };
    (global as any).performance = { now: () => Date.now() };
    (global as any).document = { getElementById: (_id: string) => parent };
    resetMockHex();
  });

  afterEach(() => {
    if (typeof _prevWindow === 'undefined') {
      delete (global as any).window;
    } else {
      (global as any).window = _prevWindow;
    }
    if (typeof _prevPerformance === 'undefined') {
      delete (global as any).performance;
    } else {
      (global as any).performance = _prevPerformance;
    }
    if (typeof _prevDocument === 'undefined') {
      delete (global as any).document;
    } else {
      (global as any).document = _prevDocument;
    }
  });

  test('advancing MockTickService moves the block down', () => {
    const tick = new MockTickService();
    const board = new GameBoard('root', 'bot', undefined, { tickService: tick });
    // initial row should be 0
    expect(board.block.row).toBe(0);
    // Advance by slightly more than one fall interval so an interval callback
    // that occurs after the interval boundary runs (intervals are scheduled
    // at ~16ms granularity).
    tick.advance(FALL_INTERVAL_MS);
    expect(board.block.row).toBe(1);
    // Advance another interval -> should move again
    tick.advance(FALL_INTERVAL_MS);
    expect(board.block.row).toBe(2);
  });
});
