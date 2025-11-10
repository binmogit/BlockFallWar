// src/gameBoard.ts
import { Block, drawBlock } from './block';
import Konva from 'konva';
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
  private stage: Konva.Stage | null = null;
  private gridLayer: Konva.Layer | null = null;
  private blockLayer: Konva.Layer | null = null;

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
    const stageWidth = this.cellSize * this.cols;
    const stageHeight = this.cellSize * this.rows;

    // Create Konva stage and layers only once
    if (!this.stage) {
      this.boardDiv.innerHTML = '';
      this.stage = new Konva.Stage({
        container: this.boardDiv as HTMLDivElement,
        width: stageWidth,
        height: stageHeight,
      });
      this.gridLayer = new Konva.Layer();
      this.blockLayer = new Konva.Layer();
      this.stage.add(this.gridLayer);
      this.stage.add(this.blockLayer);
      // Draw grid once during initialization
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const gridRect = new Konva.Rect({
            x: c * this.cellSize,
            y: r * this.cellSize,
            width: this.cellSize,
            height: this.cellSize,
            fill: '#374151',
            stroke: '#1f2937',
            strokeWidth: 1,
          });
          this.gridLayer.add(gridRect);
        }
      }
      this.gridLayer.batchDraw();
    } else {
      this.stage.width(stageWidth);
      this.stage.height(stageHeight);
    }

    if (this.blockLayer) {
      this.blockLayer.destroyChildren();
      // Calculate move progress for shading
      let moveProgress = 0;
      if (pixelOffsetY > 0) {
        moveProgress = Math.min(1, pixelOffsetY / this.cellSize);
      }
      drawBlock(this.blockLayer, this.block, this.cellSize, moveProgress);
      this.blockLayer.batchDraw();
    }
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
          await this.block.moveLeftWithInterval(this.fallInterval);
        } else {
          await this.block.moveRightWithInterval(this.fallInterval);
        }
        this.render();
        this.isSliding = false;
        // Restart falling after horizontal move
        this.canMove = false;
        this.startFalling();
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
        // Only allow left/right movement during moveInterval after landing
        this.canMove = true;
        this.moveIntervalDisplay.classList.add('bg-blue-900');
        setTimeout(() => {
          this.canMove = false;
          this.moveIntervalDisplay.classList.remove('bg-blue-900');
          if (callback) callback();
        }, this.moveInterval);
      }
    };
    animate();
  }
}
