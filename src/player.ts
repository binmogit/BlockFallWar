// src/player.ts
// Represents a player or bot with a color

export type PlayerType = 'player' | 'bot' | 'fakeplayer';

export class Player {
  type: PlayerType;
  name?: string;

  constructor(type: PlayerType, name?: string) {
    this.type = type;
    this.name = name;
  }

  static create(type: PlayerType, name?: string): Player {
    // Use the centralized block default color so player and block defaults stay in sync.
    return new Player(type, name);
  }
}
