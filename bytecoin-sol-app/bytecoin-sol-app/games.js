// games.js - Games page with playable draughts (checkers)

// Game state
let gameState = {
  board: [],
  currentPlayer: 'red',
  selectedPiece: null,
  possibleMoves: [],
  captureJumps: [],
  gameOver: false,
  winner: null,
  wagerAmount: 0,
  wagerToken: 'S-BYTE',
  gameStarted: false,
  opponentType: 'ai', // 'ai' or 'player'
  difficulty: 'medium', // 'easy', 'medium', 'hard'
  aiThinking: false
};

// Board constants
const BOARD_SIZE = 8;
const EMPTY = 0;
const RED = 1;
const RED_KING = 2;
const BLACK = 3;
const BLACK_KING = 4;

// Initialize games page
function initGamesPage() {
  // Check if wallet is connected
  if (!window.walletFunctions || !publicKey) {
    showGamesConnectPrompt();
    return;
  }
  
  // Render games page
  renderGamesPage();
  
  // Initialize draughts game
  initDraughtsGame();
  
  // Add event listeners
  addGamesEventListeners();
}

// Render games page
function renderGamesPage() {
  const gamesSection = document.getElementById('games-section');
  
  if (!gamesSection) {
    console.error('Games section not found');
    return;
  }
  
  // Clear games section
  gamesSection.innerHTML = '';
  
  // Create games content
  const gamesContent = document.createElement('div');
  gamesContent.className = 'games-content';
  
  gamesContent.innerHTML = `
    <div class="games-header">
      <h2>ByteCoin Games</h2>
      <p>Play games and win S-BYTE tokens</p>
    </div>
    
    <div class="game-selection">
      <div class="game-card active">
        <div class="game-icon draughts-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="15.5" r="1.5"></circle>
            <circle cx="8.5" cy="15.5" r="1.5"></circle>
          </svg>
        </div>
        <h3>Draughts</h3>
        <p>Classic board game with a crypto twist</p>
      </div>
      <div class="game-card coming-soon">
        <div class="game-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
        </div>
        <h3>Tic Tac Toe</h3>
        <p>Coming soon</p>
        <div class="coming-soon-badge">Coming Soon</div>
      </div>
      <div class="game-card coming-soon">
        <div class="game-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
        <h3>Connect Four</h3>
        <p>Coming soon</p>
        <div class="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
    
    <div class="game-container">
      <div class="game-sidebar">
        <div class="game-info">
          <h3>Draughts</h3>
          <p>Play against the AI or another player and win S-BYTE tokens.</p>
          
          <div class="game-options">
            <div class="option-group">
              <label>Opponent</label>
              <div class="option-buttons">
                <button class="option-btn active" data-opponent="ai">AI</button>
                <button class="option-btn" data-opponent="player">Player</button>
              </div>
            </div>
            
            <div class="option-group" id="difficulty-group">
              <label>Difficulty</label>
              <div class="option-buttons">
                <button class="option-btn" data-difficulty="easy">Easy</button>
                <button class="option-btn active" data-difficulty="medium">Medium</button>
                <button class="option-btn" data-difficulty="hard">Hard</button>
              </div>
            </div>
            
            <div class="option-group">
              <label>Wager Amount</label>
              <div class="wager-input">
                <input type="number" id="wager-amount" min="0" step="1" value="${gameState.wagerAmount}">
                <select id="wager-token">
                  <option value="S-BYTE" selected>S-BYTE</option>
                </select>
              </div>
            </div>
          </div>
          
          <button id="start-game-btn" class="start-game-btn">Start Game</button>
          
          <div class="game-status">
            <div class="status-item">
              <span class="status-label">Current Player:</span>
              <span class="status-value" id="current-player">Red</span>
            </div>
            <div class="status-item">
              <span class="status-label">Game Status:</span>
              <span class="status-value" id="game-status">Not Started</span>
            </div>
          </div>
          
          <div class="game-controls">
            <button id="reset-game-btn" class="game-control-btn">Reset Game</button>
            <button id="undo-move-btn" class="game-control-btn" disabled>Undo Move</button>
          </div>
        </div>
        
        <div class="game-rules">
          <h4>Rules</h4>
          <ul>
            <li>Red moves first</li>
            <li>Pieces move diagonally forward</li>
            <li>Kings can move diagonally in any direction</li>
            <li>Captures are mandatory</li>
            <li>Multiple captures in one turn are allowed</li>
            <li>Win by capturing all opponent pieces</li>
          </ul>
        </div>
      </div>
      
      <div class="game-board-container">
        <div id="game-board" class="game-board"></div>
        
        <div id="game-over-overlay" class="game-over-overlay">
          <div class="game-over-content">
            <h3 id="game-over-title">Game Over</h3>
            <p id="game-over-message"></p>
            <div class="game-over-buttons">
              <button id="play-again-btn" class="play-again-btn">Play Again</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  gamesSection.appendChild(gamesContent);
}

// Initialize draughts game
function initDraughtsGame() {
  // Initialize game board
  initializeBoard();
  
  // Render game board
  renderBoard();
  
  // Update game status
  updateGameStatus();
}

// Initialize game board
function initializeBoard() {
  // Create empty board
  gameState.board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
  
  // Place pieces
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Only place pieces on dark squares
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          // Black pieces at the top
          gameState.board[row][col] = BLACK;
        } else if (row > 4) {
          // Red pieces at the bottom
          gameState.board[row][col] = RED;
        }
      }
    }
  }
  
  // Reset game state
  gameState.currentPlayer = 'red';
  gameState.selectedPiece = null;
  gameState.possibleMoves = [];
  gameState.captureJumps = [];
  gameState.gameOver = false;
  gameState.winner = null;
  gameState.gameStarted = false;
  gameState.aiThinking = false;
}

// Render game board
function renderBoard() {
  const gameBoard = document.getElementById('game-board');
  
  if (!gameBoard) {
    console.error('Game board not found');
    return;
  }
  
  // Clear game board
  gameBoard.innerHTML = '';
  
  // Create board squares
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = document.createElement('div');
      square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      square.dataset.row = row;
      square.dataset.col = col;
      
      // Add piece if needed
      const piece = gameState.board[row][col];
      if (piece !== EMPTY) {
        const pieceElement = document.createElement('div');
        
        if (piece === RED || piece === RED_KING) {
          pieceElement.className = `piece red ${piece === RED_KING ? 'king' : ''}`;
        } else if (piece === BLACK || piece === BLACK_KING) {
          pieceElement.className = `piece black ${piece === BLACK_KING ? 'king' : ''}`;
        }
        
        // Add king symbol if king
        if (piece === RED_KING || piece === BLACK_KING) {
          pieceElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3 5h5l-4 4 2 5-6-3-6 3 2-5-4-4h5z"></path>
            </svg>
          `;
        }
        
        square.appendChild(pieceElement);
      }
      
      // Highlight selected piece
      if (gameState.selectedPiece && gameState.selectedPiece.row === row && gameState.selectedPiece.col === col) {
        square.classList.add('selected');
      }
      
      // Highlight possible moves
      if (gameState.possibleMoves.some(move => move.row === row && move.col === col)) {
        square.classList.add('possible-move');
        
        // Add move indicator
        const moveIndicator = document.createElement('div');
        moveIndicator.className = 'move-indicator';
        square.appendChild(moveIndicator);
      }
      
      // Add click event
      square.addEventListener('click', () => handleSquareClick(row, col));
      
      gameBoard.appendChild(square);
    }
  }
  
  // Update game over overlay
  const gameOverOverlay = document.getElementById('game-over-overlay');
  if (gameOverOverlay) {
    if (gameState.gameOver) {
      gameOverOverlay.classList.add('show');
      
      // Update game over message
      const gameOverTitle = document.getElementById('game-over-title');
      const gameOverMessage = document.getElementById('game-over-message');
      
      if (gameOverTitle && gameOverMessage) {
        if (gameState.winner) {
          gameOverTitle.textContent = `${gameState.winner.toUpperCase()} WINS!`;
          
          if (gameState.wagerAmount > 0) {
            if (gameState.winner === 'red') {
              gameOverMessage.textContent = `Congratulations! You won ${gameState.wagerAmount} ${gameState.wagerToken}!`;
            } else {
              gameOverMessage.textContent = `You lost ${gameState.wagerAmount} ${gameState.wagerToken}. Better luck next time!`;
            }
          } else {
            gameOverMessage.textContent = `Game over. ${gameState.winner.toUpperCase()} has won the game.`;
          }
        } else {
          gameOverTitle.textContent = 'DRAW!';
          gameOverMessage.textContent = 'The game ended in a draw.';
        }
      }
    } else {
      gameOverOverlay.classList.remove('show');
    }
  }
}

// Handle square click
function handleSquareClick(row, col) {
  // Ignore clicks if game is not started or game is over
  if (!gameState.gameStarted || gameState.gameOver || gameState.aiThinking) {
    return;
  }
  
  // Ignore clicks if it's AI's turn
  if (gameState.opponentType === 'ai' && gameState.currentPlayer === 'black') {
    return;
  }
  
  const piece = gameState.board[row][col];
  
  // Check if clicking on a piece of the current player
  if ((gameState.currentPlayer === 'red' && (piece === RED || piece === RED_KING)) ||
      (gameState.currentPlayer === 'black' && (piece === BLACK || piece === BLACK_KING))) {
    
    // Select the piece
    gameState.selectedPiece = { row, col };
    
    // Find possible moves
    gameState.possibleMoves = findPossibleMoves(row, col);
    
    // Check for capture jumps
    gameState.captureJumps = findCaptureJumps(row, col);
    
    // If there are capture jumps, only allow those moves
    if (gameState.captureJumps.length > 0) {
      gameState.possibleMoves = gameState.captureJumps;
    }
    
    // Re-render the board
    renderBoard();
    
  } else if (gameState.selectedPiece) {
    // Check if clicking on a possible move
    const moveIndex = gameState.possibleMoves.findIndex(move => move.row === row && move.col === col);
    
    if (moveIndex !== -1) {
      // Make the move
      const move = gameState.possibleMoves[moveIndex];
      makeMove(gameState.selectedPiece.row, gameState.selectedPiece.col, move.row, move.col);
      
      // Check if this was a capture move
      if (Math.abs(move.row - gameState.selectedPiece.row) === 2) {
        // This was a capture move
        
        // Check if there are more captures available from the new position
        const moreCaptures = findCaptureJumps(move.row, move.col);
        
        if (moreCaptures.length > 0) {
          // More captures available, don't switch turns yet
          gameState.selectedPiece = { row: move.row, col: move.col };
          gameState.possibleMoves = moreCaptures;
          gameState.captureJumps = moreCaptures;
          
          // Re-render the board
          renderBoard();
          return;
        }
      }
      
      // Switch turns
      gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
      gameState.selectedPiece = null;
      gameState.possibleMoves = [];
      gameState.captureJumps = [];
      
      // Check for game over
      checkGameOver();
      
      // Update game status
      updateGameStatus();
      
      // Re-render the board
      renderBoard();
      
      // If it's AI's turn, make AI move
      if (gameState.opponentType === 'ai' && gameState.currentPlayer === 'black' && !gameState.gameOver) {
        makeAIMove();
      }
    }
  }
}

// Make a move
function makeMove(fromRow, fromCol, toRow, toCol) {
  const piece = gameState.board[fromRow][fromCol];
  
  // Move the piece
  gameState.board[toRow][toCol] = piece;
  gameState.board[fromRow][fromCol] = EMPTY;
  
  // Check if this was a capture move
  if (Math.abs(toRow - fromRow) === 2) {
    // Calculate the position of the captured piece
    const capturedRow = fromRow + (toRow - fromRow) / 2;
    const capturedCol = fromCol + (toCol - fromCol) / 2;
    
    // Remove the captured piece
    gameState.board[capturedRow][capturedCol] = EMPTY;
  }
  
  // Check if the piece should be promoted to king
  if (piece === RED && toRow === 0) {
    gameState.board[toRow][toCol] = RED_KING;
  } else if (piece === BLACK && toRow === BOARD_SIZE - 1) {
    gameState.board[toRow][toCol] = BLACK_KING;
  }
}

// Find possible moves for a piece
function findPossibleMoves(row, col) {
  const piece = gameState.board[row][col];
  const moves = [];
  
  // Check if the piece exists
  if (piece === EMPTY) {
    return moves;
  }
  
  // Determine move directions based on piece type
  let directions = [];
  
  if (piece === RED) {
    // Red pieces move up
    directions = [
      { rowDiff: -1, colDiff: -1 }, // Up-left
      { rowDiff: -1, colDiff: 1 }   // Up-right
    ];
  } else if (piece === BLACK) {
    // Black pieces move down
    directions = [
      { rowDiff: 1, colDiff: -1 },  // Down-left
      { rowDiff: 1, colDiff: 1 }    // Down-right
    ];
  } else if (piece === RED_KING || piece === BLACK_KING) {
    // Kings can move in all diagonal directions
    directions = [
      { rowDiff: -1, colDiff: -1 }, // Up-left
      { rowDiff: -1, colDiff: 1 },  // Up-right
      { rowDiff: 1, colDiff: -1 },  // Down-left
      { rowDiff: 1, colDiff: 1 }    // Down-right
    ];
  }
  
  // Check for regular moves
  for (const dir of directions) {
    const newRow = row + dir.rowDiff;
    const newCol = col + dir.colDiff;
    
    // Check if the 
(Content truncated due to size limit. Use line ranges to read in chunks)