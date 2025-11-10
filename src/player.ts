// src/player.ts
// Represents a player or bot with a color

export type PlayerType = 'player' | 'bot' | 'fakeplayer';

export class Player {
  type: PlayerType;
  color: string;
  name?: string;

  constructor(type: PlayerType, color: string, name?: string) {
    this.type = type;
    this.color = color;
    this.name = name;
  }

  static defaultColor(type: PlayerType): string {
    switch (type) {
      case 'player':
        return '#f59e42';
      case 'bot':
        return '#3b82f6';
      case 'fakeplayer':
        return '#10b981';
    }
    // Exhaustiveness check: if we reach here, type is not handled
    // This will cause a compile error if a new PlayerType is added and not handled above
    const _exhaustiveCheck: never = type;
    throw new Error(`Unhandled PlayerType: ${type}`);
  }

  static create(type: PlayerType, name?: string): Player {
    return new Player(type, Player.defaultColor(type), name);
  }
}
