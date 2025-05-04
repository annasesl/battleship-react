// src/components/Game.js
import React, { useState } from 'react';
import Board from './Board';

const generateBoard = () => {
  const board = [];
  for (let i = 0; i < 10; i++) {
    const row = [];
    for (let j = 0; j < 10; j++) {
      row.push({ status: '' }); // Status: '', 'hit', or 'miss'
    }
    board.push(row);
  }
  return board;
};

const Game = () => {
  const [board, setBoard] = useState(generateBoard());
  const [gameOver, setGameOver] = useState(false);

  const onCellClick = (rowIndex, colIndex) => {
    if (board[rowIndex][colIndex].status !== '') return; // If already hit or miss, do nothing

    // Here, you can add more logic for checking if a ship is there
    const isHit = Math.random() < 0.2; // 20% chance for a hit, for testing purposes

    const newBoard = [...board];
    if (isHit) {
      newBoard[rowIndex][colIndex].status = 'hit';
    } else {
      newBoard[rowIndex][colIndex].status = 'miss';
    }

    setBoard(newBoard);

    // Check if game is over (all hits)
    const isGameOver = newBoard.every(row =>
      row.every(cell => cell.status === 'hit' || cell.status === 'miss')
    );
    if (isGameOver) {
      setGameOver(true);
      alert('Game Over!');
    }
  };

  return (
    <div className="App">
      <h1>Морской Бой (Sea Battle)</h1>
      <Board onCellClick={onCellClick} board={board} />
      {gameOver && <button onClick={() => window.location.reload()}>Restart Game</button>}
    </div>
  );
};

export default Game;
