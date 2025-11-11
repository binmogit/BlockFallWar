// src/controls.ts
// Handles player and bot controls for moving blocks

export type ControlType = 'player' | 'bot';

export interface ControlEvent {
  direction: 'left' | 'right';
}

export class Controls {
  type: ControlType;
  onMove: (event: ControlEvent) => void | Promise<void>;
  private keydownHandler?: EventListener;
  // Use the standard DOM EventTarget so we can accept `window` directly without casts.
  private eventTarget: EventTarget | null;

  /**
   * Controls constructor.
   * @param type - 'player' | 'bot'
   * @param onMove - callback invoked when a move happens
   * @param eventTarget - optional event target to attach key listeners to (defaults to global window)
   */
  constructor(
    type: ControlType,
    onMove: (event: ControlEvent) => void | Promise<void>,
    eventTarget?: EventTarget | null,
  ) {
    this.type = type;
    this.onMove = onMove;
    // Allow injection of a custom event target (useful for tests). If not
    // provided, fall back to the global `window` when available, otherwise
    // null and no listeners will be attached.
    this.eventTarget = eventTarget ?? (typeof window !== 'undefined' ? window : null);

    if (
      type === 'player' &&
      this.eventTarget &&
      typeof this.eventTarget.addEventListener === 'function'
    ) {
      this.setupPlayerListeners();
    }
    // Bot controls will be triggered programmatically
  }

  private setupPlayerListeners() {
    this.keydownHandler = (evt: Event) => {
      const e = evt as KeyboardEvent;
      if (e.repeat) return; // Ignore key repeat events
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        this.onMove({ direction: 'left' });
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        this.onMove({ direction: 'right' });
      }
    };
    // Defensive attach: ensure an event target with addEventListener exists.
    const target = this.eventTarget;
    if (!target || typeof (target as any).addEventListener !== 'function') {
      // No target available; do not attach listeners. This keeps behavior safe in
      // environments without a global window or when a test intentionally omits
      // an event target.
      return;
    }
    target.addEventListener('keydown', this.keydownHandler as EventListener);
  }

  /**
   * Removes event listeners to prevent memory leaks.
   * Call this when the game ends, the Controls instance is no longer needed, or the component is unmounted.
   */
  public dispose() {
    if (
      this.keydownHandler &&
      this.eventTarget &&
      typeof this.eventTarget.removeEventListener === 'function'
    ) {
      this.eventTarget.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = undefined;
    }
  }

  // For bot, call this method to move
  async botMove(direction: 'left' | 'right') {
    if (this.type !== 'bot') {
      throw new Error('botMove can only be called on bot controls');
    }
    await this.onMove({ direction });
  }
}
