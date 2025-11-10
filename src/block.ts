// Konva and Color are only needed for rendering, not for logic/unit tests
// src/block.ts
// Represents a single block on the grid

export class Block {
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
  layer: any,
  block: Block,
  cellSize: number,
  moveProgress: number = 0, // 0 = just landed, 1 = about to move
) {
  // Only import rendering modules when needed
  const Konva = require('konva').default;
  const Color = require('color').default;
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
