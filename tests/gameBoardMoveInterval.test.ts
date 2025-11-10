
jest.useFakeTimers();

class MockGameBoard {
  isSliding = false;
  canMove = false;
  moveInterval = 100;
  lastMoveTime = 0;

  handleMove(direction: 'left' | 'right') {
    if (this.isSliding || !this.canMove) return false;
    this.isSliding = true;
    this.lastMoveTime = Date.now();
    setTimeout(() => {
      this.isSliding = false;
      this.canMove = true;
    }, this.moveInterval);
    return true;
  }
}

describe('GameBoard move interval logic', () => {
  let board: MockGameBoard;
  beforeEach(() => {
    board = new MockGameBoard();
  });

  it('should not allow move during move interval', () => {
    board.canMove = false;
    expect(board.handleMove('left')).toBe(false);
    board.isSliding = true;
    expect(board.handleMove('right')).toBe(false);
  });

  it('should allow move after move interval', () => {
    board.canMove = true;
    board.isSliding = false;
    expect(board.handleMove('left')).toBe(true);
    jest.advanceTimersByTime(board.moveInterval);
    expect(board.isSliding).toBe(false);
    board.canMove = true;
    expect(board.handleMove('right')).toBe(true);
  });

  it('should allow immediate move after landing in cell', () => {
    board.canMove = true;
    board.isSliding = false;
    expect(board.handleMove('left')).toBe(true);
  });
});
