// src/block.ts
// Represents a single block on the grid

export class Block {
  /**
   * Move the block down after a given interval (ms).
   * @param interval - Time in ms to wait before moving down.
   * @returns Promise that resolves after movement.
   */
  async moveDownWithInterval(interval: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, interval));
    this.moveDown();
  }

  /**
   * Move the block left after a given interval (ms).
   * @param interval - Time in ms to wait before moving left.
   * @returns Promise that resolves after movement.
   */
  async moveLeftWithInterval(interval: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, interval));
    this.moveLeft();
  }

  /**
   * Move the block right after a given interval (ms).
   * @param interval - Time in ms to wait before moving right.
   * @returns Promise that resolves after movement.
   */
  async moveRightWithInterval(interval: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, interval));
    this.moveRight();
  }
  row: number;
  col: number;
  color: string;

  constructor(row: number, col: number, color: string = '#f59e42') {
    this.row = row;
    this.col = col;
    this.color = color;
  }

  /**
   * Move the block down by incrementing its row.
   */
  moveDown() {
    this.row += 1;
  }

  /**
   * Move the block left by decrementing its col.
   */
  moveLeft() {
    this.col -= 1;
  }

  /**
   * Move the block right by incrementing its col.
   */
  moveRight() {
    this.col += 1;
  }
}

export function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  cellSize: number,
  darken: boolean = false,
) {
  let color = block.color;
  if (darken) {
    // Simple darken: apply a filter or use a darker color
    color = shadeColor(color, -10);
  }
  ctx.fillStyle = color;
  ctx.fillRect(block.col * cellSize, block.row * cellSize, cellSize, cellSize);
  ctx.strokeStyle = '#1f2937';
  ctx.strokeRect(block.col * cellSize, block.row * cellSize, cellSize, cellSize);
}

// Utility to darken a hex color
function shadeColor(color: string, percent: number): string {
  // Only supports hex colors like #f59e42
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.max(0, Math.min(255, R + Math.floor(255 * (percent / 100))));
  G = Math.max(0, Math.min(255, G + Math.floor(255 * (percent / 100))));
  B = Math.max(0, Math.min(255, B + Math.floor(255 * (percent / 100))));
  return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
}
