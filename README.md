# BlockFallWar

BlockFallWar is a browser-based block fall game built with TypeScript, TailwindCSS, and Webpack. The project is designed for rapid prototyping and UI iteration, with all game logic running in the browser.

## Features
- Two-player block fall battle
- Modular game logic in TypeScript
- Responsive UI styled with TailwindCSS
- Hot reload for fast development

## Getting Started
1. **Install dependencies:**
   ```powershell
   npm install
   ```
2. **Start dev server (opens the game in your browser with hot reload):**
   ```powershell
   npm start
   ```
3. **Run tests (runs Jest unit tests):**
   ```powershell
   npm test
   ```

## Customization Examples
- **Add new block types/behaviors:**
  - Update `src/block.ts` and `src/gameBoard.ts`
- **Style new components:**
  - Add Tailwind classes in HTML or custom rules in `src/style.css`

## Conventions
- TypeScript only (no frameworks)
- UI uses Tailwind utility classes
- Minimal shared state between game boards
- All logic is currently client-side

## License
MIT