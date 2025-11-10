// src/controls.ts
// Handles player and bot controls for moving blocks

export type ControlType = 'player' | 'bot';

export interface ControlEvent {
  direction: 'left' | 'right';
}

export class Controls {
  type: ControlType;
  onMove: (event: ControlEvent) => void | Promise<void>;
  private keydownHandler?: (e: KeyboardEvent) => void;

  constructor(type: ControlType, onMove: (event: ControlEvent) => void | Promise<void>) {
    this.type = type;
    this.onMove = onMove;
    if (type === 'player') {
      this.setupPlayerListeners();
    }
    // Bot controls will be triggered programmatically
  }

  private setupPlayerListeners() {
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore key repeat events
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        this.onMove({ direction: 'left' });
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        this.onMove({ direction: 'right' });
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Removes event listeners to prevent memory leaks.
   * Call this when the game ends, the Controls instance is no longer needed, or the component is unmounted.
   */
  public dispose() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
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
