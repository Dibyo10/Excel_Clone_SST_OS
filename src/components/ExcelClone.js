import React, { useState, useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ text, position }) => {
  return (
    <div className={`tooltip ${position}`}>
      {text}
    </div>
  );
};

const ExcelClone = () => {
  const ROWS = 20;
  const COLS = 26; // Columns A to Z
  const [data, setData] = useState(Array(ROWS).fill().map(() => Array(COLS).fill('')));
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [error, setError] = useState(null);
  const [invalidCells, setInvalidCells] = useState(new Set());
  const [tooltipText, setTooltipText] = useState('');

  const getColumnLabel = (index) => String.fromCharCode(65 + index);

  const handleCellSelect = (rowIndex, colIndex) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setFormulaBarValue(data[rowIndex][colIndex]);
    setError(null);
  };

  const isValidInput = (value) => {
    return /^[0-9]*$/.test(value) && value.length <= 10;
  };

  const markCellAsInvalid = (row, col, invalid) => {
    const cellKey = `${row}-${col}`;
    setInvalidCells((prev) => {
      const updated = new Set(prev);
      if (invalid) updated.add(cellKey);
      else updated.delete(cellKey);
      return updated;
    });
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    if (!isValidInput(value)) {
      setError('Invalid input: Only numbers are allowed (max 10 characters)');
      markCellAsInvalid(rowIndex, colIndex, true);
      return;
    }
    setError(null);
    markCellAsInvalid(rowIndex, colIndex, false);

    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
    setFormulaBarValue(value);
  };

  const handleKeyDown = (e) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;

    if (e.key === 'ArrowUp') newRow = Math.max(row - 1, 0);
    if (e.key === 'ArrowDown') newRow = Math.min(row + 1, ROWS - 1);
    if (e.key === 'ArrowLeft') newCol = Math.max(col - 1, 0);
    if (e.key === 'ArrowRight') newCol = Math.min(col + 1, COLS - 1);

    if (newRow !== row || newCol !== col) handleCellSelect(newRow, newCol);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell]);

  const handleDoubleClick = (rowIndex, colIndex) => {
    handleCellSelect(rowIndex, colIndex);
    const cellInput = document.getElementById(`cell-${rowIndex}-${colIndex}`);
    if (cellInput) cellInput.select();
  };

  const Cell = ({ value, rowIndex, colIndex }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const isInvalid = invalidCells.has(`${rowIndex}-${colIndex}`);

    return (
      <td
        className={`border border-gray-300 p-0 relative ${
          selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'bg-blue-50' : ''
        }`}
      >
        <div
          className="cell"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <input
            id={`cell-${rowIndex}-${colIndex}`}
            type="text"
            className={`w-full h-full px-2 py-1 border-none outline-none bg-transparent ${
              isInvalid ? 'bg-red-50' : ''
            }`}
            value={value}
            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
            onClick={() => handleCellSelect(rowIndex, colIndex)}
            onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)}
          />
          {showTooltip && <Tooltip text={tooltipText} position="bottom" />}
        </div>
      </td>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center p-2 bg-gray-100">
        <div className="flex space-x-2 items-center">
          <div className="font-mono bg-white px-2 py-1 border border-gray-300">
            {selectedCell ? `${getColumnLabel(selectedCell.col)}${selectedCell.row + 1}` : ''}
          </div>
          <input
            type="text"
            className="w-96 px-2 py-1 border border-gray-300"
            value={formulaBarValue}
            onChange={(e) => {
              const value = e.target.value;
              if (selectedCell) handleCellChange(selectedCell.row, selectedCell.col, value);
              setFormulaBarValue(value);
            }}
          />
        </div>
        {error && <span className="text-red-500 text-sm ml-4">{error}</span>}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="w-12 bg-gradient-to-b from-slate-900 to-slate-800 text-white font-semibold border border-slate-700"></th>
              {Array(COLS).fill().map((_, i) => (
                <th key={i} className="w-24 bg-slate-900 text-white border">{getColumnLabel(i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(ROWS).fill().map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="bg-slate-900 text-white">{rowIndex + 1}</td>
                {Array(COLS).fill().map((_, colIndex) => (
                  <Cell key={colIndex} value={data[rowIndex][colIndex]} rowIndex={rowIndex} colIndex={colIndex} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelClone;
