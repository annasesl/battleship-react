import React, { useState, useRef } from 'react';
import './GameBoard.css';

const GRID_SIZE = 10;
const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
const NUMBERS = [1,2,3,4,5,6,7,8,9,10];

const createEmptyBoard = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const SHIP_TYPES = [
  { size: 4 }, { size: 3 }, { size: 3 },
  { size: 2 }, { size: 2 }, { size: 2 },
  { size: 1 }, { size: 1 }, { size: 1 }, { size: 1 }
];

const isValidPlacement = (board, r, c, size, horizontal) => {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
  for (let i = 0; i < size; i++) {
    const rr = horizontal ? r : r + i;
    const cc = horizontal ? c + i : c;
    if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE || board[rr][cc] === 'ship') return false;
    for (const [dx, dy] of dirs) {
      const ar = rr + dx;
      const ac = cc + dy;
      if (ar >= 0 && ar < GRID_SIZE && ac >= 0 && ac < GRID_SIZE && board[ar][ac] === 'ship') return false;
    }
  }
  return true;
};

const placeShip = (board, r, c, size, horizontal) => {
  for (let i = 0; i < size; i++) {
    const rr = horizontal ? r : r + i;
    const cc = horizontal ? c + i : c;
    board[rr][cc] = 'ship';
  }
};

const generateRandomBoard = () => {
  const board = createEmptyBoard();
  SHIP_TYPES.forEach(({ size }) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (isValidPlacement(board, r, c, size, horizontal)) {
        placeShip(board, r, c, size, horizontal);
        placed = true;
      }
    }
  });
  return board;
};

const GameBoard = () => {
  const [playerBoard, setPlayerBoard] = useState(generateRandomBoard());
  const [opponentBoard] = useState(createEmptyBoard());
  const [selection, setSelection] = useState('miss');
  const [playerHits, setPlayerHits] = useState([]);
  const [opponentHits, setOpponentHits] = useState([]);

  const longPressTimeout = useRef(null);

  const handlePlayerClick = (r, c) => {
    if (!opponentHits.find(h => h.r === r && h.c === c)) {
      const res = playerBoard[r][c] === 'ship' ? 'hit' : 'miss';
      setOpponentHits([...opponentHits, { r, c, res }]);
    }
  };

  const handlePlayerDouble = (r, c) => {
    setOpponentHits(opponentHits.filter(h => !(h.r === r && h.c === c)));
  };

  const handleOpponentClick = (r, c) => {
    if (!playerHits.find(h => h.r === r && h.c === c)) {
      setPlayerHits([...playerHits, { r, c, res: selection }]);
    }
  };

  const handleOpponentDouble = (r, c) => {
    setPlayerHits(playerHits.filter(h => !(h.r === r && h.c === c)));
  };

  const handleLongPress = (callback) => (r, c) => {
    longPressTimeout.current = setTimeout(() => {
      callback(r, c);
    }, 100);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimeout.current);
  };

  const randomize = () => setPlayerBoard(generateRandomBoard());

  const newGame = () => {
    setSelection('miss');
    setOpponentHits([]);
    setPlayerHits([]);
    setPlayerBoard(generateRandomBoard());
  };

  const renderBoard = (board, hits, onClick, onDoubleClick, showShips) => (
    <table>
      <thead>
        <tr>
          <th></th>
          {LETTERS.map((l, i) => <th key={i}>{l}</th>)}
        </tr>
      </thead>
      <tbody>
        {NUMBERS.map((n, r) => (
          <tr key={r}>
            <td>{n}</td>
            {board[r].map((cell, c) => {
              const hit = hits.find(h => h.r === r && h.c === c);
              const bg = hit ? (hit.res === 'hit' ? 'red' : 'gray') : (showShips && cell === 'ship' ? 'lightblue' : '');
              return (
                <td
                  key={c}
                  className="cell"
                  onClick={() => onClick(r, c)}
                  onDoubleClick={() => onDoubleClick(r, c)}
                  onTouchStart={() => handleLongPress(onDoubleClick)(r, c)}
                  onTouchEnd={cancelLongPress}
                  style={{ backgroundColor: bg }}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="game-board">
      <div className="top-controls">
        <button onClick={newGame}>Start New Game</button>
        <button onClick={randomize}>Randomly Place Ships</button>
      </div>

      <div className="boards-row">
        <div className="board-container">
          <h2>Player's Board</h2>
          {renderBoard(playerBoard, opponentHits, handlePlayerClick, handlePlayerDouble, true)}
          <p className="hint">💡 Double-click or long-press to undo (mobile/desktop)</p>
        </div>
        <div className="board-container">
          <h2>Opponent's Board</h2>
          {renderBoard(opponentBoard, playerHits, handleOpponentClick, handleOpponentDouble, false)}
          <p className="hint">💡 Double-click or long-press to undo (mobile/desktop)</p>
        </div>
      </div>

      <div className="controls">
        <button onClick={() => setSelection('hit')} style={{ backgroundColor: selection === 'hit' ? 'green' : '' }}>
          Hit
        </button>
        <button onClick={() => setSelection('miss')} style={{ backgroundColor: selection === 'miss' ? 'gray' : '' }}>
          Miss
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
