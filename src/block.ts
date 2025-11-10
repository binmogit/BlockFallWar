import type { Layer } from 'konva/lib/Layer';

// src/block.ts
// Konva and Color are imported for rendering; both are mocked in unit tests for isolation and compatibility.
// Represents a single block on the grid

import { Player } from './player';
import Konva from 'konva';
import Color from 'color';

export class Block {
  /**
   * Clamp the block's row and col to valid board bounds.
   * @param maxRows - maximum number of rows (required)
   * @param maxCols - maximum number of columns (required)
   */
  clampToBounds(maxRows: number, maxCols: number): boolean {
    let clamped = false;
    if (typeof maxRows === 'number' && maxRows > 0) {
      const newRow = Math.max(0, Math.min(this.row, maxRows - 1));
      if (newRow !== this.row) clamped = true;
      this.row = newRow;
    }
    if (typeof maxCols === 'number' && maxCols > 0) {
      const newCol = Math.max(0, Math.min(this.col, maxCols - 1));
      if (newCol !== this.col) clamped = true;
      this.col = newCol;
    }
    return clamped;
  }
  /**
   * Spawn a block at the top row (row 0) with given column and optional color.
   */
  static spawnAtTop(col: number, player: Player) {
    return new Block(0, col, player.color);
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
   * Move the block down by incrementing its row, with boundary check.
   * @param maxRows - maximum number of rows (required)
   * @returns true if moved, false if at boundary
   */
  moveDown(maxRows: number): boolean {
    // Guard: maxRows must be positive and at least 1
    if (typeof maxRows !== 'number' || maxRows <= 0) return false;
    const maxRowIdx = maxRows - 1;
    if (this.row < maxRowIdx) {
      this.row += 1;
      return true;
    }
    // Do not mutate this.row on failure
    return false;
  }

  /**
   * Move the block left by decrementing its col, with boundary check.
   * @param minCol - minimum column index (required)
   * @returns true if moved, false if at boundary
   */
  moveLeft(minCol: number): boolean {
    // Guard: minCol must be >= 0
    if (typeof minCol !== 'number' || minCol < 0) return false;
    if (this.col > minCol) {
      this.col -= 1;
      return true;
    }
    // Always clamp to minCol if out of bounds
    this.col = Math.max(this.col, minCol);
    return false;
  }

  /**
   * Move the block right by incrementing its col, with boundary check.
   * @param maxCols - maximum number of columns (required)
   * @returns true if moved, false if at boundary
   */
  moveRight(maxCols: number): boolean {
    // Guard: maxCols must be positive and at least 1
    if (typeof maxCols !== 'number' || maxCols <= 0) return false;
    const maxColIdx = maxCols - 1;
    if (this.col < maxColIdx) {
      this.col += 1;
      return true;
    }
    // Do not mutate this.col on failure
    return false;
  }
}

export function drawBlock(
  layer: Layer,
  block: Block,
  cellSize: number,
  moveProgress: number = 0, // 0 = just landed, 1 = about to move
) {
  // Konva and Color are imported at the top of the file
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
