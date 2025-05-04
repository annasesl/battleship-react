// src/components/Board.js
import React, { useState } from 'react';

const Board = ({ onCellClick, board }) => {
  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`board-cell ${cell.status}`}
            onClick={() => onCellClick(rowIndex, colIndex)}
          >
            {cell.status === 'hit' ? 'X' : cell.status === 'miss' ? 'O' : ''}
          </div>
        ))
      )}
    </div>
  );
};

export default Board;
