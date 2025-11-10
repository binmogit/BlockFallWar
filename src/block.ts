import Konva from 'konva';
import Color from 'color';
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
  layer: Konva.Layer,
  block: Block,
  cellSize: number,
  moveProgress: number = 0, // 0 = just landed, 1 = about to move
) {
  // Clamp progress between 0 and 1
  moveProgress = Math.max(0, Math.min(1, moveProgress));
  const color = block.color;
  const darkColor = Color(color).darken(0.3).hex();
  // Gradient stops: top is block color, bottom is darkColor, with the dark region growing as moveProgress increases
  const gradientStops = [0, color, moveProgress, color, moveProgress, darkColor, 1, darkColor];
  const rect = new Konva.Rect({
    x: block.col * cellSize,
    y: block.row * cellSize,
    width: cellSize,
    height: cellSize,
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: 0, y: cellSize },
    fillLinearGradientColorStops: gradientStops,
    stroke: '#1f2937',
    strokeWidth: 1,
  });
  layer.add(rect);
}