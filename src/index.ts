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
	renderGameBoards();
});

// Render empty boards for both players
function renderGameBoards() {
	const rows = 20;
	const cols = 10;

	function createBoardGrid(): HTMLElement {
		const grid = document.createElement('div');
		grid.className = 'grid grid-cols-10 gap-[2px]';
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cell = document.createElement('div');
				cell.className = 'w-6 h-6 bg-gray-700 border border-gray-800';
				grid.appendChild(cell);
			}
		}
		return grid;
	}

	const board1 = document.querySelector('#board-player1 .board');
	const board2 = document.querySelector('#board-player2 .board');

	if (board1) {
		board1.innerHTML = '';
		board1.appendChild(createBoardGrid());
	}
	if (board2) {
		board2.innerHTML = '';
		board2.appendChild(createBoardGrid());
	}
}