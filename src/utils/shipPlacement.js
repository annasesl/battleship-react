export const generateRandomBoard = () => {
  const board = Array.from({ length: 10 }, () => Array(10).fill(''));
  const ships = [
    { size: 4, count: 1 },  // Battleship (4 cells)
    { size: 3, count: 2 },  // Cruisers (3 cells each)
    { size: 2, count: 3 },  // Destroyers (2 cells each)
    { size: 1, count: 4 },  // Torpedo Boats (1 cell each)
  ];

  const isValid = (r, c, size, horizontal) => {
    for (let i = 0; i < size; i++) {
      const row = r + (horizontal ? 0 : i);
      const col = c + (horizontal ? i : 0);
      if (row >= 10 || col >= 10 || board[row][col] === 'S') return false;

      // Check for touching ships (even diagonally)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] === 'S') {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placeShip = (size) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * 10);
      const c = Math.floor(Math.random() * 10);
      if (isValid(r, c, size, horizontal)) {
        for (let i = 0; i < size; i++) {
          const row = r + (horizontal ? 0 : i);
          const col = c + (horizontal ? i : 0);
          board[row][col] = 'S';  // Place ship
        }
        placed = true;
      }
    }
  };

  ships.forEach(ship => {
    for (let i = 0; i < ship.count; i++) {
      placeShip(ship.size);
    }
  });

  return board;
};
