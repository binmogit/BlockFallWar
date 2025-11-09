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
});