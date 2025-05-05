import React, { useState, useCallback, memo, useEffect } from 'react';
import './GameBoard.css';

// Constants
const GRID_SIZE = 10;
const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SHIP_TYPES = [
  { size: 4 }, { size: 3 }, { size: 3 },
  { size: 2 }, { size: 2 }, { size: 2 },
  { size: 1 }, { size: 1 }, { size: 1 }, { size: 1 }
];

// Cell component with touch and click handlers
const Cell = memo(({ row, col, onClick, onLongPress, backgroundColor }) => {
  // Long press timer for mobile (alternative to double-click)
  const [pressing, setPressing] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Handle touch start (for long press detection)
  const handleTouchStart = useCallback(() => {
    setPressing(true);
    const timer = setTimeout(() => {
      if (pressing) {
        onLongPress(row, col);
      }
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  }, [onLongPress, pressing, row, col]);
  
  // Clear timer on touch end
  const handleTouchEnd = useCallback(() => {
    if (pressing && longPressTimer) {
      clearTimeout(longPressTimer);
      onClick(row, col);
    }
    setPressing(false);
  }, [onClick, longPressTimer, pressing, row, col]);
  
  // Clear timer if touch is moved away
  const handleTouchMove = useCallback(() => {
    if (pressing && longPressTimer) {
      clearTimeout(longPressTimer);
      setPressing(false);
    }
  }, [longPressTimer, pressing]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <td
      className="cell"
      onClick={() => onClick(row, col)}
      onDoubleClick={() => onLongPress(row, col)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress(row, col);
      }}
      style={{ backgroundColor }}
    />
  );
});

// Utility functions
const createEmptyBoard = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const isValidPlacement = (board, r, c, size, horizontal) => {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  
  for (let i = 0; i < size; i++) {
    const rr = horizontal ? r : r + i;
    const cc = horizontal ? c + i : c;
    
    if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE || board[rr][cc] === 'ship') {
      return false;
    }
    
    for (const [dx, dy] of dirs) {
      const ar = rr + dx;
      const ac = cc + dy;
      if (ar >= 0 && ar < GRID_SIZE && ac >= 0 && ac < GRID_SIZE && board[ar][ac] === 'ship') {
        return false;
      }
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
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      
      if (isValidPlacement(board, r, c, size, horizontal)) {
        placeShip(board, r, c, size, horizontal);
        placed = true;
      }
      attempts++;
    }
    
    // Fallback if placement fails
    if (!placed) {
      console.warn(`Failed to place ship of size ${size} after ${maxAttempts} attempts`);
    }
  });
  
  return board;
};

// Main component
const GameBoard = () => {
  // State
  const [playerBoard, setPlayerBoard] = useState(generateRandomBoard);
  const [opponentBoard] = useState(createEmptyBoard);
  const [selection, setSelection] = useState('miss');
  const [playerHits, setPlayerHits] = useState([]);
  const [opponentHits, setOpponentHits] = useState([]);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [gameMessage, setGameMessage] = useState('Tap on opponent\'s board to mark hits/misses');
  
  // Handle orientation changes
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Event handlers
  const handlePlayerClick = useCallback((r, c) => {
    if (!opponentHits.some(h => h.r === r && h.c === c)) {
      const res = playerBoard[r][c] === 'ship' ? 'hit' : 'miss';
      setOpponentHits(prev => [...prev, { r, c, res }]);
      setGameMessage(res === 'hit' ? 'Enemy hit your ship!' : 'Enemy missed!');
    }
  }, [opponentHits, playerBoard]);

  const handlePlayerLongPress = useCallback((r, c) => {
    setOpponentHits(prev => {
      const exists = prev.some(h => h.r === r && h.c === c);
      if (exists) {
        setGameMessage('Removed enemy marker');
        return prev.filter(h => !(h.r === r && h.c === c));
      }
      return prev;
    });
  }, []);

  const handleOpponentClick = useCallback((r, c) => {
    if (!playerHits.some(h => h.r === r && h.c === c)) {
      setPlayerHits(prev => [...prev, { r, c, res: selection }]);
      setGameMessage(`You marked a ${selection} on the enemy board`);
    }
  }, [playerHits, selection]);

  const handleOpponentLongPress = useCallback((r, c) => {
    setPlayerHits(prev => {
      const exists = prev.some(h => h.r === r && h.c === c);
      if (exists) {
        setGameMessage('Removed your marker');
        return prev.filter(h => !(h.r === r && h.c === c));
      }
      return prev;
    });
  }, []);

  // Game controls
  const randomize = useCallback(() => {
    setPlayerBoard(generateRandomBoard());
    setGameMessage('Ships randomly placed');
  }, []);

  const newGame = useCallback(() => {
    setSelection('miss');
    setOpponentHits([]);
    setPlayerHits([]);
    setPlayerBoard(generateRandomBoard());
    setGameMessage('New game started! Tap on opponent\'s board to mark hits/misses');
  }, []);

  // Render a board with optimized cells
  const renderBoard = (board, hits, onClick, onLongPress, showShips) => (
    <table>
      <thead>
        <tr>
          <th></th>
          {LETTERS.map((letter, idx) => <th key={idx}>{letter}</th>)}
        </tr>
      </thead>
      <tbody>
        {NUMBERS.map((number, r) => (
          <tr key={r}>
            <td>{number}</td>
            {board[r].map((cell, c) => {
              const hit = hits.find(h => h.r === r && h.c === c);
              const bg = hit 
                ? (hit.res === 'hit' ? 'red' : 'gray') 
                : (showShips && cell === 'ship' ? 'lightblue' : '');
              
              return (
                <Cell
                  key={c}
                  row={r}
                  col={c}
                  onClick={onClick}
                  onLongPress={onLongPress}
                  backgroundColor={bg}
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
      {/* Game message/status */}
      <div className="game-status">{gameMessage}</div>
      
      {/* Top controls */}
      <div className="top-controls">
        <button onClick={newGame}>New Game</button>
        <button onClick={randomize}>Random Ships</button>
      </div>

      <div className="boards-row">
        <div className="board-container">
          <h2>Your Board</h2>
          <div className="board-help">(Enemy taps shown here)</div>
          {renderBoard(playerBoard, opponentHits, handlePlayerClick, handlePlayerLongPress, true)}
        </div>
        <div className="board-container">
          <h2>Enemy Board</h2>
          <div className="board-help">(Tap to mark hits/misses)</div>
          {renderBoard(opponentBoard, playerHits, handleOpponentClick, handleOpponentLongPress, false)}
        </div>
      </div>
      
      <div className="controls">
        <button 
          onClick={() => {
            setSelection('hit');
            setGameMessage('Selected: HIT');
          }} 
          className={selection === 'hit' ? 'hit-selected' : ''}
        >
          Hit
        </button>
        <button 
          onClick={() => {
            setSelection('miss');
            setGameMessage('Selected: MISS');
          }} 
          className={selection === 'miss' ? 'miss-selected' : ''}
        >
          Miss
        </button>
      </div>
      
      {/* Help text */}
      <div className="game-help">
        <p>Tap once to mark. Long press to remove marking.</p>
      </div>
    </div>
  );
};

export default GameBoard;
