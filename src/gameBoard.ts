// src/gameBoard.ts
import { Block, drawBlock } from './block';
import { GAME_BOARD_DEFAULTS } from './gameBoardConfig';
import { Controls, ControlType } from './controls';

/**
 * GameBoardConfig holds the configuration for the GameBoard, including grid size and interval timings.
 *
 * @class GameBoardConfig
 * @property {number} rows - Number of grid rows.
 * @property {number} cols - Number of grid columns.
 * @property {number} fallInterval - Interval time in ms for block falling.
 * @property {number} moveInterval - Interval time in ms for lateral block movement.
 */
export class GameBoardConfig {
  rows: number;
  cols: number;
  fallInterval: number;
  moveInterval: number;
  constructor(config?: Partial<GameBoardConfig>) {
    this.rows = config?.rows ?? GAME_BOARD_DEFAULTS.rows;
    this.cols = config?.cols ?? GAME_BOARD_DEFAULTS.cols;
    this.fallInterval = config?.fallInterval ?? GAME_BOARD_DEFAULTS.fallInterval;
    this.moveInterval = config?.moveInterval ?? GAME_BOARD_DEFAULTS.moveInterval;
  }
}

/**
 * GameBoard manages the grid, block, controls, and rendering for a single player or bot.
 *
 * @class GameBoard
 * @param {string} parentId - The DOM id of the board container.
 * @param {ControlType} controlType - 'player' or 'bot' for controls.
 * @param {number} [interval=250] - Interval time in ms for block falling.
 * @param {Partial<GameBoardConfig>} [config] - Optional config overrides.
 *
 * @property {number} rows - Number of grid rows.
 * @property {number} cols - Number of grid columns.
 * @property {Block} block - The current falling block.
 * @property {HTMLElement} parent - The board container element.
 * @property {HTMLElement} boardDiv - The board's inner div for canvas.
 * @property {Controls} controls - Controls handler for player/bot.
 * @property {number} cellSize - Size of each cell in px.
 * @property {boolean} isSliding - True if block is animating.
 * @property {number} interval - Block falling interval in ms.
 * @property {HTMLElement} intervalDisplay - DOM element for interval display.
 */
export class GameBoard {
  rows: number;
  cols: number;
  block: Block;
  parent: HTMLElement;
  boardDiv: HTMLElement;
  controls: Controls;
  cellSize: number = 0;
  isSliding: boolean = false;
  currentRow: number = 0;
  pixelOffsetY: number = 0;
  pixelOffsetX: number = 0;
  fallInterval: number;
  fallIntervalDisplay: HTMLElement;
  moveInterval: number;
  moveIntervalDisplay: HTMLElement;
  canMove: boolean = false;
  config: GameBoardConfig;

  /**
   * Create a new GameBoard instance.
   * @param parentId - The DOM id of the board container.
   * @param controlType - 'player' or 'bot' for controls.
   * @param interval - Interval time in ms for block falling.
   * @param config - Optional config overrides.
   */
  constructor(parentId: string, controlType: ControlType, interval: number = 250, config?: Partial<GameBoardConfig>) {
    this.config = new GameBoardConfig(config);
    this.rows = this.config.rows;
    this.cols = this.config.cols;
    this.fallInterval = interval ?? this.config.fallInterval;
    this.moveInterval = this.config.moveInterval;
    // ...existing DOM logic...
    this.parent = document.getElementById(parentId)!;
    this.boardDiv = this.parent.querySelector('.board')!;
    this.block = new Block(0, Math.floor(this.cols / 2));
    this.fallIntervalDisplay = this.parent.querySelector('[id^=interval-]')!;
    this.moveIntervalDisplay = document.createElement('div');
    this.moveIntervalDisplay.className = 'absolute left-1/2 -translate-x-1/2 top-[60%] bg-gray-900 text-white px-2 py-1 rounded shadow text-xs';
    this.moveIntervalDisplay.textContent = `${this.moveInterval}ms move window`;
    this.fallIntervalDisplay.insertAdjacentElement('afterend', this.moveIntervalDisplay);
    this.controls = new Controls(controlType, (event) => this.handleMove(event.direction));
    window.addEventListener('resize', () => this.render());
    this.render();
    this.startFalling();
    this.updateFallIntervalDisplay();
    this.updateMoveIntervalDisplay();
  }

  /**
   * Update the fall interval time display on the board.
   */
  updateFallIntervalDisplay() {
    if (this.fallIntervalDisplay) {
      this.fallIntervalDisplay.textContent = `${this.fallInterval}ms`;
    }
  }

  /**
   * Update the move interval time display on the board.
   */
  updateMoveIntervalDisplay(): void {
    if (this.moveIntervalDisplay) {
      this.moveIntervalDisplay.textContent = `${this.moveInterval}ms move window`;
    }
  }

  /**
   * Render the board and block, with optional pixel offsets for animation.
   * @param pixelOffsetY - Vertical offset in px for block animation.
   * @param pixelOffsetX - Horizontal offset in px for block animation.
   */
  render(pixelOffsetY: number = 0, pixelOffsetX: number = 0) {
    const rect = this.parent.getBoundingClientRect();
    const cellWidth = Math.floor(rect.width / this.cols);
    const cellHeight = Math.floor(rect.height / this.rows);
    this.cellSize = Math.min(cellWidth, cellHeight);
    const canvasWidth = this.cellSize * this.cols;
    const canvasHeight = this.cellSize * this.rows;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    canvas.className = 'block';
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#374151';
      ctx.strokeStyle = '#1f2937';
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
          ctx.strokeRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
        }
      }
      ctx.save();
      ctx.translate(pixelOffsetX, pixelOffsetY);
      drawBlock(ctx, this.block, this.cellSize, pixelOffsetY > 0 || pixelOffsetX !== 0);
      ctx.restore();
    }
    this.boardDiv.innerHTML = '';
    this.boardDiv.appendChild(canvas);
  }

  /**
   * Handle left/right movement from controls, animating the block.
   * @param direction - 'left' or 'right'
   */
  handleMove(direction: 'left' | 'right') {
    if (this.isSliding || !this.canMove) return;
    let targetCol = this.block.col + (direction === 'left' ? -1 : 1);
    if (targetCol < 0 || targetCol > this.cols - 1) return;
    this.isSliding = true;
    let pixelOffsetX = 0;
    const animate = async () => {
      pixelOffsetX += 4;
      this.render(0, direction === 'left' ? -pixelOffsetX : pixelOffsetX);
      if (pixelOffsetX < this.cellSize) {
        requestAnimationFrame(animate);
      } else {
        if (direction === 'left') {
          await this.block.moveLeftWithInterval(this.moveInterval);
        } else {
          await this.block.moveRightWithInterval(this.moveInterval);
        }
        this.render();
        this.isSliding = false;
      }
    };
    animate();
  }

  /**
   * Start the block falling loop with animation.
   */
  startFalling() {
    const fall = () => {
      if (this.block.row < this.rows - 1) {
        this.slideBlockDown(() => {
          // After sliding down, open move window for moveInterval ms
          this.canMove = true;
          this.moveIntervalDisplay.classList.add('bg-blue-900');
          setTimeout(() => {
            this.canMove = false;
            this.moveIntervalDisplay.classList.remove('bg-blue-900');
          }, this.moveInterval);
          setTimeout(fall, this.fallInterval);
        });
      }
    };
    setTimeout(fall, this.fallInterval);
  }

  /**
   * Animate the block sliding down one row.
   */
  /**
   * Animate the block sliding down one row, then call callback when done.
   * @param callback - Called after block lands in new cell.
   */
  slideBlockDown(callback?: () => void) {
    if (this.isSliding) return;
    this.isSliding = true;
    let pixelOffsetY = 0;
    const animate = () => {
      pixelOffsetY += 4;
      this.render(pixelOffsetY, 0);
      if (pixelOffsetY < this.cellSize) {
        requestAnimationFrame(animate);
      } else {
        this.block.moveDown();
        this.render();
        this.isSliding = false;
        if (callback) callback();
      }
    };
    animate();
  }
}
