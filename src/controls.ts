// src/controls.ts
// Handles player and bot controls for moving blocks

export type ControlType = 'player' | 'bot';

export interface ControlEvent {
  direction: 'left' | 'right';
}

export class Controls {
  type: ControlType;
  onMove: (event: ControlEvent) => void | Promise<void>;

  constructor(type: ControlType, onMove: (event: ControlEvent) => void | Promise<void>) {
    this.type = type;
    this.onMove = onMove;
    if (type === 'player') {
      this.setupPlayerListeners();
    }
    // Bot controls will be triggered programmatically
  }

  private setupPlayerListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        this.onMove({ direction: 'left' });
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        this.onMove({ direction: 'right' });
      }
    });
  }

  // For bot, call this method to move
  async botMove(direction: 'left' | 'right') {
    if (this.type === 'bot') {
      await this.onMove({ direction });
    }
  }
}
