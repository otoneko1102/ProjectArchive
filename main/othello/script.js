const modes = {
  easy: {
    name: '易しい',
    map: [
      [  1,   1,   1,   1,   1,   1,   1,   1],
      [  1,   1,   1,   1,   1,   1,   1,   1],
      [  1,   1,   1,   1,   1,   1,   1,   1],
      [  1,   1,   1,   1,   1,   1,   1,   1],
      [  1,   1,   1,   1,   1,   1,   1,   1],
      [  1,   1,   1,   1,   1,   1,   1,   1],
      [  1,   1,   1,   1,   1,   1,   1,   1],
      [  1,   1,   1,   1,   1,   1,   1,   1]
    ]
  },
  normal: {
    name: '普通',
    map: [
      [100,  20,  10,   5,   5,  10,  20, 100],
      [ 20,  10,   5,   1,   1,   5,  10,  20],
      [ 10,   5,   1,   1,   1,   1,   5,  10],
      [  5,   1,   1,   1,   1,   1,   1,   5],
      [  5,   1,   1,   1,   1,   1,   1,   5],
      [ 10,   5,   1,   1,   1,   1,   5,  10],
      [ 20,  10,   5,   1,   1,   5,  10,  20],
      [100,  20,  10,   5,   5,  10,  20, 100]
    ]
  },
  hard: {
    name: '難しい',
    map: [
      [100,   1,  10,   5,   5,  10,   1, 100],
      [  1,   1,  10,   1,   1,  10,   1,   1],
      [ 10,  10,  10,   1,   1,  10,  10,  10],
      [  5,   1,   1,   1,   1,   1,   1,   5],
      [  5,   1,   1,   1,   1,   1,   1,   5],
      [ 10,  10,  10,   1,   1,  10,  10,  10],
      [  1,   1,  10,   1,   1,  10,   1,   1],
      [100,   1,  10,   5,   5,  10,   1, 100]
    ]
  }
};

let nowMode = 'normal';
let strengthMap = modes[nowMode].map;

const resetButton = document.getElementById('reset-button');
console.log(resetButton);

function modeChange(mode) {
  nowMode = mode;
  strengthMap = modes[mode].map;
  document.getElementById('mode').textContent = modes[mode].name;
  console.log(`Mode change: ${mode}`, strengthMap);
  for (const m of Object.keys(modes)) {
    if (m !== mode) {
      document.getElementById(m).disabled = false;
    } else {
      document.getElementById(m).disabled = true;
    }
  }
  popup(`モードを「${modes[mode].name}」に変更しました！`)
}

const board = new Array(8).fill(null).map(() => new Array(8).fill(null));
const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");

let currentPlayer = '⚫';

function createCell(row, col) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.addEventListener("click", () => onCellClick(row, col));
  return cell;
}

function initializeBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = createCell(row, col);
      boardElement.appendChild(cell);
    }
  }

  placeDisk(3, 3, '⚫');
  placeDisk(4, 4, '⚫');
  placeDisk(3, 4, '⚪');
  placeDisk(4, 3, '⚪');
  highlightValidMoves(currentPlayer);
}

function placeDisk(row, col, player) {
  const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  board[row][col] = player;
  cell.textContent = player;
}

function onCellClick(row, col) {
  if (board[row][col] || !isValidMove(row, col, currentPlayer)) {
    return;
  }

  resetButton.disabled = true;
  for (const m of Object.keys(modes)) {
    document.getElementById(m).disabled = true;
  }

  placeDisk(row, col, currentPlayer);
  flipDisks(row, col, currentPlayer);

  if (currentPlayer === '⚫') {
    currentPlayer = '⚪';
    statusElement.textContent = "⚪ COMの番";
    setTimeout(() =>{
      makeComputerMove();
      resetButton.disabled = false;
    }, 1000);
  } else {
    currentPlayer = '⚫';
    statusElement.textContent = "⚫ あなたの番";
  }

  if (!findValidMoves(currentPlayer).length) {
    switchTurn();
  }

  highlightValidMoves(currentPlayer);

  updateScores();

  if (isGameOver()) {
    const winner = getWinner();
    setTimeout(() => {
      if (winner === 'Draw') {
        statusElement.textContent = "引き分け！";
        popup("引き分け！");
      } else {
        statusElement.textContent = `${winner} の勝ち！`;
        popup(`${winner} の勝ち！`);
      }
    }, 3000);
  }
}

function isValidMove(row, col, player) {
  if (board[row][col]) {
    return false;
  }

  const directions = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
  ];

  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    let hasOpponentDiskBetween = false;

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const cell = board[r][c];

      if (cell === null) {
        break;
      } else if (cell === player) {
        if (hasOpponentDiskBetween) {
          return true;
        } else {
          break;
        }
      } else {
        hasOpponentDiskBetween = true;
      }

      r += dx;
      c += dy;
    }
  }

  return false;
}

function flipDisks(row, col, player) {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
  ];

  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    let shouldFlip = false;

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const cell = board[r][c];

      if (cell === null) {
        break;
      } else if (cell === player) {
        if (shouldFlip) {
          r -= dx;
          c -= dy;
          while (board[r][c] !== player) {
            placeDisk(r, c, player);
            r -= dx;
            c -= dy;
          }
        }
        break;
      } else {
        shouldFlip = true;
      }

      r += dx;
      c += dy;
    }
  }
}

function evaluateMove(row, col, player) {
  const strength = strengthMap[row][col];

  if (isValidMove(row, col, player)) {
    const flippedDisks = countFlippedDisks(row, col, player);
    return strength + flippedDisks;
  }
  
  return 0;
}

function countFlippedDisks(row, col, player) {
  let flippedDisks = 0;
  const directions = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
  ];

  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    let shouldFlip = false;

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const cell = board[r][c];

      if (cell === null) {
        break;
      } else if (cell === player) {
        if (shouldFlip) {
          flippedDisks++;
        }
        break;
      } else {
        shouldFlip = true;
      }

      r += dx;
      c += dy;
    }
  }
  return flippedDisks;
}

function makeComputerMove() {
  console.log(`COM: ${currentPlayer}`)
  if (currentPlayer === '⚫') {
    highlightValidMoves(currentPlayer);
    return;
  }
  const validMoves = findValidMoves(currentPlayer);
  let bestMoves = [];
  let bestScore = -1;

  validMoves.forEach(({ row, col }) => {
    const moveScore = evaluateMove(row, col, currentPlayer);
    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMoves = [{ row, col }];
    } else if (moveScore === bestScore) {
      bestMoves.push({ row, col });
    }
  });

  if (bestMoves.length > 0) {
    const randomMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    const { row, col } = randomMove;
    onCellClick(row, col);
  } else {
    switchTurn();
  }
}

function findValidMoves(player) {
  const validMoves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (!board[row][col] && isValidMove(row, col, player)) {
        validMoves.push({ row, col });
      }
    }
  }

  console.log(validMoves);
  return validMoves;
}

function highlightValidMoves(player) {
  console.log(`Searching: ${player}`);
  const xCells = document.querySelectorAll(`.cell[id="valid-x"]`);
  xCells.forEach(cell => cell.id = "valid");
  const oCells = document.querySelectorAll(`.cell[id="valid-o"]`);
  oCells.forEach(cell => cell.id = "valid");

  const validMoves = findValidMoves(player).map(m => [m.row, m.col]);

  validMoves.forEach(([row, col]) => {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.id = `valid-${player === '⚫' ? 'o' : 'x'}`;
    }
  });
}

function isGameOver() {
  return isBoardFull() || !findValidMoves('⚫').length && !findValidMoves('⚪').length;
}

function getWinner() {
  const playerDisks = board.flat().filter(cell => cell === '⚫' || cell === '⚪');
  const xCount = playerDisks.filter(cell => cell === '⚫').length;
  const oCount = playerDisks.filter(cell => cell === '⚪').length;

  if (xCount > oCount) {
    return '⚫';
  } else if (oCount > xCount) {
    return '⚪';
  } else {
    return 'Draw';
  }
}

function isBoardFull() {
  return board.flat().every(cell => cell !== null);
}

const playerXScoreElement = document.getElementById("playerXScore");
const playerOScoreElement = document.getElementById("playerOScore");

let playerXScore = 2;
let playerOScore = 2;

function updateScores() {
  const playerXDisks = board.flat().filter(cell => cell === '⚫');
  const playerODisks = board.flat().filter(cell => cell === '⚪');

  playerXScore = playerXDisks.length;
  playerOScore = playerODisks.length;

  playerXScoreElement.textContent = playerXScore;
  playerOScoreElement.textContent = playerOScore;
}

function switchTurn() {
  if (currentPlayer === '⚫') {
    currentPlayer = '⚪';
    statusElement.textContent = "⚪ COMの番";
    setTimeout(makeComputerMove, 3000);
  } else {
    currentPlayer = '⚫';
    statusElement.textContent = "⚫ あなたの番";
  }

  highlightValidMoves(currentPlayer);
}

function resetBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      board[row][col] = null;
    }
  }

  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }

  initializeBoard();

  playerXScore = 2;
  playerOScore = 2;
  updateScores();

  currentPlayer = '⚫';
  statusElement.textContent = "⚫ あなたの番";

  for (const m of Object.keys(modes)) {
    if (m !== nowMode) {
      document.getElementById(m).disabled = false;
    } else {
      document.getElementById(m).disabled = true;
    }
  }

  popup('盤面を初期化しました！')
}

initializeBoard();
updateScores();
