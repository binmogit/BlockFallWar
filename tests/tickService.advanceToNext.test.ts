import { MockTickService } from '../src/tickService';

describe('MockTickService.advanceToNext', () => {
  test('returns null when no scheduled events', () => {
    const tick = new MockTickService();
    expect(tick.advanceToNext()).toBeNull();
  });

  test('advances to next timeout and returns delta', () => {
    const tick = new MockTickService();
    let called = false;
    tick.setTimeout(() => {
      called = true;
    }, 100);
    const delta = tick.advanceToNext();
    expect(delta).toBe(100);
    expect(called).toBe(true);
    expect(tick.now()).toBe(100);
  });

  test('advances to earliest among many and handles intervals', () => {
    const tick = new MockTickService();
    const calls: number[] = [];
    tick.setTimeout(() => calls.push(1), 200);
    tick.setTimeout(() => calls.push(2), 50);
    const id = tick.setInterval(() => calls.push(3), 80);

    const d1 = tick.advanceToNext();
    expect(d1).toBe(50);
    expect(calls).toEqual([2]);

    const d2 = tick.advanceToNext();
    // next scheduled event should be the interval at 80 (from 50 -> 80 = 30)
    expect(d2).toBe(30);
    expect(calls).toEqual([2, 3]);

    // clear the interval so the next event is the timeout at 200
    tick.clearInterval(id);
    const d3 = tick.advanceToNext();
    // from 80 to 200 = 120
    expect(d3).toBe(120);
    expect(calls).toEqual([2, 3, 1]);
  });

  test('handles simultaneous events scheduled for the same time', () => {
    const tick = new MockTickService();
    const calls: number[] = [];
    tick.setTimeout(() => calls.push(1), 100);
    tick.setTimeout(() => calls.push(2), 100);
    tick.setTimeout(() => calls.push(3), 200);

    const d = tick.advanceToNext();
    // both timeouts at 100 should fire together
    expect(d).toBe(100);
    expect(calls.sort()).toEqual([1, 2].sort());
    // next should be the 200 timeout
    const d2 = tick.advanceToNext();
    expect(d2).toBe(100);
    expect(calls).toEqual([1, 2, 3]);
  });

  test('clearTimeout prevents a scheduled timeout from firing', () => {
    const tick = new MockTickService();
    const calls: number[] = [];
    const a = tick.setTimeout(() => calls.push(1), 50);
    tick.setTimeout(() => calls.push(2), 100);
    // cancel the first timeout
    tick.clearTimeout(a);

    const d = tick.advanceToNext();
    // earliest remaining is 100
    expect(d).toBe(100);
    expect(calls).toEqual([2]);
  });

  test('handles zero and very short delays correctly', () => {
    const tick = new MockTickService();
    const calls: number[] = [];
    tick.setTimeout(() => calls.push(1), 0);
    tick.setTimeout(() => calls.push(2), 1);

    const d0 = tick.advanceToNext();
    // immediate timeout should result in zero delta
    expect(d0).toBe(0);
    expect(calls).toEqual([1]);

    const d1 = tick.advanceToNext();
    expect(d1).toBe(1);
    expect(calls).toEqual([1, 2]);
  });

  test('advanceToNext is idempotent after all events run (returns null)', () => {
    const tick = new MockTickService();
    let called = false;
    tick.setTimeout(() => (called = true), 10);
    const d = tick.advanceToNext();
    expect(d).toBe(10);
    expect(called).toBe(true);
    // no more events: advanceToNext should return null and be safe to call repeatedly
    expect(tick.advanceToNext()).toBeNull();
    expect(tick.advanceToNext()).toBeNull();
  });
});
