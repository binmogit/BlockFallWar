import { MockTickService } from '../src/tickService';

describe('MockTickService.setInterval normalization', () => {
  test('setInterval(0) is normalized to 1ms', () => {
    const tick = new MockTickService();
    const calls: number[] = [];
    tick.setInterval(() => calls.push(1), 0);

    const d1 = tick.advanceToNext();
    // first scheduled interval should be 1ms (not 0)
    expect(d1).toBe(1);
    expect(calls).toEqual([1]);

    // next occurrence should also be 1ms later
    const d2 = tick.advanceToNext();
    expect(d2).toBe(1);
    expect(calls.length).toBe(2);
  });

  test('negative interval is normalized to 1ms', () => {
    const tick = new MockTickService();
    const calls: number[] = [];
    tick.setInterval(() => calls.push(1), -100);

    const d = tick.advanceToNext();
    expect(d).toBe(1);
    expect(calls).toEqual([1]);
  });
});
