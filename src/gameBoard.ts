// src/gameBoard.ts
import { Block, drawBlock } from './block';
import { Player, PlayerType } from './player';
// Konva is only needed for rendering, not for logic/config tests
import Konva from 'konva';
import { GAME_BOARD_DEFAULTS } from './gameBoardConfig';
import { Controls, ControlType } from './controls';
import { TickService, createRealTickService } from './tickService';

/**
 * GameBoardConfig holds the configuration for the GameBoard (grid size)
 *
 * @class GameBoardConfig
 * @property {number} rows - Number of grid rows.
 * @property {number} cols - Number of grid columns.
 */
export class GameBoardConfig {
  rows: number;
  cols: number;
  constructor(config?: Partial<GameBoardConfig>) {
    this.rows = config?.rows ?? GAME_BOARD_DEFAULTS.rows;
    this.cols = config?.cols ?? GAME_BOARD_DEFAULTS.cols;
  }
}

export type DocumentLike = { getElementById: (id: string) => any | null };

// Use the standard EventTarget interface for injected event targets so that
// consumers like `Controls` can accept the same type without casts.
export type WindowLike = EventTarget;

export interface GameBoardOptions {
  tickService?: TickService;
  // Event target used for keyboard/input listeners (e.g. window or a fake target)
  eventTarget?: EventTarget | null;
  /** Optional window-like target specifically for resize events (separate from eventTarget used for keyboard/input) */
  windowTarget?: EventTarget | null;
  dom?: {
    document?: DocumentLike;
    window?: EventTarget;
    performance?: { now: () => number };
  } | null;
}

/**
 * GameBoard manages the grid, block, controls, and rendering for a single player or bot.
 *
 * @class GameBoard
 * @param {string} parentId - The DOM id of the board container.
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
 * @property {HTMLElement} intervalDisplay - DOM element for interval display.
 */
export class GameBoard {
  private lastFallDisplayUpdate: number = 0;
  private lastFallTime: number = 0;
  private running: boolean = false;
  rows: number;
  cols: number;
  block: Block;
  player: Player;
  parent: HTMLElement;
  boardDiv: HTMLElement;
  controls: Controls;
  tick: TickService;
  cellSize: number = 0;
  isSliding: boolean = false;
  currentRow: number = 0;
  pixelOffsetY: number = 0;
  pixelOffsetX: number = 0;
  fallIntervalDisplay: HTMLElement;
  config: GameBoardConfig;
  private stage: Konva.Stage | null = null;
  private gridLayer: Konva.Layer | null = null;
  private blockLayer: Konva.Layer | null = null;
  private pendingMoveDirection: 'left' | 'right' | null = null;

  /**
   * Create a new GameBoard instance.
   * @param parentId - The DOM id of the board container.
   * @param controlType - 'player' or 'bot' for controls.
   * @param config - Optional config overrides.
   */
  constructor(
    parentId: string,
    controlType: ControlType,
    config?: Partial<GameBoardConfig>,
    options?: GameBoardOptions,
  ) {
    this.config = new GameBoardConfig(config);
    this.rows = this.config.rows;
    this.cols = this.config.cols;
    // ...existing DOM logic...
    // Allow tests or alternate hosts to inject a `document`/`window`/`performance` bundle.
    const tickService = options?.tickService;
    const eventTarget = options?.eventTarget;
    const windowTarget = options?.windowTarget;
    const dom = options?.dom;

    const doc = dom?.document ?? (typeof document !== 'undefined' ? document : null);
    const win = dom?.window ?? (typeof window !== 'undefined' ? window : null);

    const parentElement = doc?.getElementById(parentId);
    if (!parentElement) {
      throw new Error(`Parent element with id "${parentId}" not found`);
    }
    this.parent = parentElement;
    this.boardDiv = this.parent.querySelector('.board')!;
    // Create player for this board
    this.player = Player.create(controlType as PlayerType);
    this.block = Block.spawnAtTop(Math.floor(this.cols / 2));
    this.fallIntervalDisplay = this.parent.querySelector('[id^=interval-]')!;
    // Pass the optional eventTarget into Controls so tests can inject a fake
    // event target and avoid global key listeners.
    this.controls = new Controls(
      controlType,
      (event) => this.handleMove(event.direction),
      (eventTarget ?? undefined) as EventTarget | undefined,
    );
    // Use provided tick service or default to real browser timers
    this.tick = tickService ?? createRealTickService();
    // Attach resize listener to injected windowTarget if available, otherwise
    // prefer the injected dom.window and finally the global window.
    const resizeTarget = (windowTarget ??
      win ??
      (typeof window !== 'undefined' ? window : null)) as EventTarget | null;
    resizeTarget?.addEventListener?.('resize', () => this.render());
    this.render();
    this.startTick();
  }

  /**
   * Update the fall interval time display on the board.
   */
  updateFallIntervalDisplay() {
    if (this.fallIntervalDisplay) {
      const now = this.tick.now();
      const elapsed = now - this.lastFallTime;
      const remaining = Math.max(0, this.block.fallInterval - elapsed);
      // Throttle updates to at most ~60fps (every 16ms) so the progress bar
      // animates smoothly. Still bypass throttle when remaining === 0 so the
      // final state is shown immediately.
      if (remaining !== 0 && now - this.lastFallDisplayUpdate < 16) {
        return;
      }
      this.lastFallDisplayUpdate = now;
      const seconds = (remaining / 1000).toFixed(2);
      // Update label
      const labelSpan = this.fallIntervalDisplay.querySelector('.interval-label');
      if (labelSpan) {
        labelSpan.textContent = `Next fall in: ${seconds}s`;
      } else {
        this.fallIntervalDisplay.textContent = `Next fall in: ${seconds}s`;
      }
      // Update progress bar
      const bar = this.fallIntervalDisplay.querySelector('.interval-bar') as HTMLElement;
      if (bar) {
        // Compute progress safely. Avoid division by zero if fallInterval is invalid
        // (non-finite or <= 0). In that case, show full progress only when remaining === 0,
        // otherwise show 0. Otherwise compute 1 - remaining / fallInterval.
        let progress: number;
        const fallInterval = this.block?.fallInterval;
        if (!Number.isFinite(fallInterval) || fallInterval <= 0) {
          progress = remaining === 0 ? 1 : 0;
        } else {
          progress = 1 - remaining / fallInterval;
        }
        // Clamp to [0,1] to avoid CSS surprises
        progress = Math.max(0, Math.min(1, progress));
        bar.style.width = `${progress * 100}%`;
      }
    }
  }
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
      // Draw grey arrows by default in both directions
      ['left', 'right'].forEach((dir) => {
        const arrowCol = this.block.col + (dir === 'right' ? 1 : -1);
        const arrowRow = this.block.row;
        if (arrowCol >= 0 && arrowCol < this.cols) {
          const arrowPoints =
            dir === 'right'
              ? [
                  arrowCol * this.cellSize + this.cellSize * 0.75,
                  arrowRow * this.cellSize + this.cellSize * 0.5,
                  arrowCol * this.cellSize + this.cellSize * 0.25,
                  arrowRow * this.cellSize + this.cellSize * 0.25,
                  arrowCol * this.cellSize + this.cellSize * 0.25,
                  arrowRow * this.cellSize + this.cellSize * 0.75,
                ]
              : [
                  arrowCol * this.cellSize + this.cellSize * 0.25,
                  arrowRow * this.cellSize + this.cellSize * 0.5,
                  arrowCol * this.cellSize + this.cellSize * 0.75,
                  arrowRow * this.cellSize + this.cellSize * 0.25,
                  arrowCol * this.cellSize + this.cellSize * 0.75,
                  arrowRow * this.cellSize + this.cellSize * 0.75,
                ];
          const arrow = new Konva.Line({
            points: arrowPoints,
            fill: '#6b7280', // Tailwind gray-500
            stroke: '#6b7280',
            closed: true,
            strokeWidth: 2,
          });
          if (this.blockLayer) {
            this.blockLayer.add(arrow);
          }
        }
      });
      // Draw green arrow if a move is pending
      if (this.pendingMoveDirection) {
        const dir = this.pendingMoveDirection;
        const arrowCol = this.block.col + (dir === 'right' ? 1 : -1);
        const arrowRow = this.block.row;
        if (arrowCol >= 0 && arrowCol < this.cols) {
          const arrowPoints =
            dir === 'right'
              ? [
                  arrowCol * this.cellSize + this.cellSize * 0.75,
                  arrowRow * this.cellSize + this.cellSize * 0.5,
                  arrowCol * this.cellSize + this.cellSize * 0.25,
                  arrowRow * this.cellSize + this.cellSize * 0.25,
                  arrowCol * this.cellSize + this.cellSize * 0.25,
                  arrowRow * this.cellSize + this.cellSize * 0.75,
                ]
              : [
                  arrowCol * this.cellSize + this.cellSize * 0.25,
                  arrowRow * this.cellSize + this.cellSize * 0.5,
                  arrowCol * this.cellSize + this.cellSize * 0.75,
                  arrowRow * this.cellSize + this.cellSize * 0.25,
                  arrowCol * this.cellSize + this.cellSize * 0.75,
                  arrowRow * this.cellSize + this.cellSize * 0.75,
                ];
          const arrow = new Konva.Line({
            points: arrowPoints,
            fill: 'green',
            stroke: 'green',
            closed: true,
            strokeWidth: 2,
          });
          this.blockLayer.add(arrow);
        }
      }
      this.blockLayer.batchDraw();
    }
  }

  /**
   * Handle left/right movement from controls, animating the block.
   * @param direction - 'left' or 'right'
   */
  handleMove(direction: 'left' | 'right') {
    if (this.isSliding) return;
    let targetCol = this.block.col + (direction === 'left' ? -1 : 1);
    if (targetCol < 0 || targetCol > this.cols - 1) return;
    this.pendingMoveDirection = direction;
    if (direction === 'left') {
      this.block.moveLeft(0);
    } else {
      this.block.moveRight(this.cols);
    }
    this.render();
    // Use a short timeout to allow the green arrow to be visible for a frame
    this.tick.setTimeout(() => {
      this.pendingMoveDirection = null;
      this.render();
    }, 50);
  }

  /**
   * Start the game tick loop.
   */
  startTick() {
    // Use the injected TickService to drive the game loop so tests can
    // deterministically advance virtual time with MockTickService.
    if (this.running) return;
    this.running = true;
    this.lastFallTime = this.tick.now();
    // Poll at a frame rate (~60fps) to update display and check fall timing.
    // Using setInterval makes this deterministic when using MockTickService.
    this.tick.setInterval(() => {
      if (!this.running) return;
      const now = this.tick.now();
      // Only move block down if enough time has passed
      if (this.block.row < this.rows - 1 && now - this.lastFallTime >= this.block.fallInterval) {
        this.slideBlockDown();
        this.lastFallTime = now;
      }
      this.updateFallIntervalDisplay();
    }, 16);
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
    this.block.moveDown(this.rows);
    this.render();
    if (callback) callback();
  }
}
