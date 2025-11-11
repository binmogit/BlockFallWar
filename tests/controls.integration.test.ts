import { Controls } from '../src/controls';

describe('Controls (injectable event target)', () => {
  test('player controls attach to provided event target and trigger onMove', () => {
    const calls: Array<'left' | 'right'> = [];
    const onMove = ({ direction }: { direction: 'left' | 'right' }) => {
      calls.push(direction);
    };

    // Fake event target that records listeners and can trigger them
    const listeners: Record<string, Function[]> = {};
    const fakeTarget = {
      addEventListener: (evt: string, fn: Function) => {
        listeners[evt] = listeners[evt] || [];
        listeners[evt].push(fn);
      },
      removeEventListener: (evt: string, fn: Function) => {
        listeners[evt] = (listeners[evt] || []).filter((f) => f !== fn);
      },
    };

    const controls = new Controls('player', onMove, fakeTarget as any);

    // Simulate keydown events
    const keydown = (key: string) => {
      const e = { key, repeat: false } as KeyboardEvent;
      (listeners['keydown'] || []).forEach((fn) => fn(e));
    };

    keydown('ArrowLeft');
    keydown('a');
    keydown('d');
    keydown('ArrowRight');

    expect(calls).toEqual(['left', 'left', 'right', 'right']);

    // Dispose should remove listeners
    controls.dispose();
    keydown('ArrowLeft');
    expect(calls).toEqual(['left', 'left', 'right', 'right']);
  });

  test('botMove throws on player controls and works on bot controls', async () => {
    const onMove = jest.fn();
    const playerControls = new Controls('player', onMove, null);
    await expect(playerControls.botMove('left' as any)).rejects.toThrow();

    const botControls = new Controls('bot', onMove, null);
    await botControls.botMove('right');
    expect(onMove).toHaveBeenCalledWith({ direction: 'right' });
  });
});
