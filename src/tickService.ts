export type TickId = number;

export interface TickService {
  setTimeout(cb: () => void, ms: number): TickId;
  clearTimeout(id: TickId): void;
  setInterval(cb: () => void, ms: number): TickId;
  clearInterval(id: TickId): void;
  /**
   * Current time according to this TickService (ms). For real service this maps to performance.now().
   */
  now(): number;
}

export function createRealTickService(): TickService {
  return {
    setTimeout: (cb, ms) => {
      return (global as any).setTimeout(cb, ms) as unknown as TickId;
    },
    clearTimeout: (id) => {
      (global as any).clearTimeout(id as unknown as number);
    },
    setInterval: (cb, ms) => {
      return (global as any).setInterval(cb, ms) as unknown as TickId;
    },
    clearInterval: (id) => {
      (global as any).clearInterval(id as unknown as number);
    },
    now: () => {
      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        return performance.now();
      }
      // Fallback: track relative time with Date.now()
      if (!(globalThis as any).__tickServiceStartTime) {
        (globalThis as any).__tickServiceStartTime = Date.now();
      }
      return Date.now() - (globalThis as any).__tickServiceStartTime;
    },
  };
}

/**
 * MockTickService: virtual time, deterministic.
 * - Use advance(ms) to move the clock and fire due callbacks.
 * - now() returns the virtual time in ms.
 */
export class MockTickService implements TickService {
  private nextId = 1;
  private nowMs = 0;
  // schedule entries: id -> {time, cb, type, interval}
  private schedule = new Map<
    TickId,
    { time: number; cb: () => void; type: 'timeout' | 'interval'; interval?: number }
  >();

  now() {
    return this.nowMs;
  }

  setTimeout(cb: () => void, ms: number): TickId {
    const id = this.nextId++;
    const time = this.nowMs + Math.max(0, Math.floor(ms));
    this.schedule.set(id, { time, cb, type: 'timeout' });
    return id;
  }

  clearTimeout(id: TickId) {
    this.schedule.delete(id);
  }

  setInterval(cb: () => void, ms: number): TickId {
    const id = this.nextId++;
    const interval = Math.max(0, Math.floor(ms));
    const time = this.nowMs + interval;
    this.schedule.set(id, { time, cb, type: 'interval', interval });
    return id;
  }

  clearInterval(id: TickId) {
    this.schedule.delete(id);
  }

  /**
   * Advance virtual time by ms, firing all due callbacks in chronological order.
   * Callbacks that schedule new timers are considered and may run within the same advance if due.
   */
  advance(ms: number) {
    if (ms < 0) throw new Error('advance(ms) requires non-negative ms');
    const target = this.nowMs + Math.floor(ms);
    // Process events until no scheduled events <= target
    while (true) {
      // find next due event <= target
      let nextId: TickId | null = null;
      let nextTime = Infinity;
      for (const [id, entry] of this.schedule.entries()) {
        if (entry.time <= target && entry.time < nextTime) {
          nextTime = entry.time;
          nextId = id;
        }
      }
      if (nextId === null) break;
      // advance to that event time
      this.nowMs = nextTime;
      const entry = this.schedule.get(nextId)!;
      // Execute callback; guard in case cb clears or reschedules
      entry.cb();
      // After callback: if interval and still present, reschedule
      const post = this.schedule.get(nextId);
      if (entry.type === 'interval') {
        // If still present (not cleared by callback), schedule next
        if (post) {
          // schedule next occurrence relative to previous scheduled time + interval
          const nextOccurrence = entry.time + entry.interval!;
          this.schedule.set(nextId, {
            time: nextOccurrence,
            cb: entry.cb,
            type: 'interval',
            interval: entry.interval,
          });
        }
      } else {
        // timeout: remove if still present
        this.schedule.delete(nextId);
      }
      // loop to process next due within target
    }
    // finally advance now to target
    this.nowMs = target;
  }

  /**
   * Convenience: run until there are no scheduled callbacks remaining.
   * Danger: if an interval keeps re-scheduling, this will loop forever.
   */
  runToIdle(maxSteps = 10000) {
    let steps = 0;
    while (this.schedule.size > 0) {
      if (++steps > maxSteps)
        throw new Error('runToIdle exceeded maxSteps — possible infinite interval');
      // find earliest scheduled event
      let nextId: TickId | null = null;
      let nextTime = Infinity;
      for (const [id, entry] of this.schedule.entries()) {
        if (entry.time < nextTime) {
          nextTime = entry.time;
          nextId = id;
        }
      }
      if (nextId === null) break;
      this.advance(nextTime - this.nowMs);
    }
  }

  /**
   * Advance virtual time to the next scheduled event and run it.
   * Returns the milliseconds advanced, or null if there were no scheduled events.
   */
  advanceToNext(): number | null {
    if (this.schedule.size === 0) return null;
    let nextTime = Infinity;
    for (const [, entry] of this.schedule.entries()) {
      if (entry.time < nextTime) nextTime = entry.time;
    }
    const delta = Math.max(0, nextTime - this.nowMs);
    this.advance(delta);
    return delta;
  }
}
