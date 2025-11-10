import { GameBoard } from './gameBoard';
import { BLOCK_DEFAULTS } from './blockConfig';
import './style.css';

// Only setup control buttons for now
function setupControls() {
  document.getElementById('start-pvp')?.addEventListener('click', () => {
    alert('Player vs Player mode coming soon!');
  });
  document.getElementById('start-bot')?.addEventListener('click', () => {
    alert('Player vs Bot mode coming soon!');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupControls();
  // Create game boards for player and bot
  new GameBoard('board-player1', 'player');
  new GameBoard('board-player2', 'bot');
});
