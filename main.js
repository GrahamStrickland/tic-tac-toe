// DOM manipulation variables
const board = document.querySelector('.board');
let messageBox = document.querySelector('.messageBox');
const resetBtn = document.querySelector('.reset-button');
const gameCounter = document.querySelector('.game-count');
const diffSelect = document.querySelector('#difficulty');
const numSquares = 9;
let userCount = document.querySelector('#userWin');
let compCount = document.querySelector('#compWin');

// Game variables
let userWin = 0, compWin = 0, gameCount = 0;
let gameStart, diff, xBtn, oBtn, xClone, oClone, userChoice, userMark,
  computerChoice, compMark, player, currState;

// Setup first game
diffSelect.addEventListener('input', () => {
  diff = diffSelect.value;
});
diffSelect.disabled = false;
resetBtn.addEventListener('click', setup);
gameCounter.style.visibility = 'hidden';
setup();

// Setup function
function setup() {
  gameStart = false;
  resetBtn.style.visibility = 'hidden';
  board.style.opacity = '0';
  messageBox.style.opacity = 0;
  messageBox.style.transition = 'opacity 250ms';
  currState = [];
  if (gameCount % 2 === 0) {
    player = 'user';
  } else {
    player = 'computer';
  }

  for (let i = 0; i < numSquares; i++) {
    document.querySelector(`.square${i}`).innerHTML = '';
  }

  setTimeout(() => {
    messageBox.textContent = 'Choose ';
    xBtn = document.createElement('i');
    oBtn = document.createElement('i');
    xBtn.id = 'X';
    xBtn.className = 'fas fa-times fa-lg selector';
    oBtn.id = 'O';
    oBtn.className = 'far fa-circle selector';
    let divider = document.createElement('span');
    divider.textContent = ' | ';
    messageBox.appendChild(xBtn);
    messageBox.appendChild(divider);
    messageBox.appendChild(oBtn);
    messageBox.style.opacity = 1;

    xClone = xBtn.cloneNode(true);
    oClone = oBtn.cloneNode(true);

    // Player select mechanics
    xBtn.addEventListener('click', initialise.bind(xBtn));
    oBtn.addEventListener('click', initialise.bind(oBtn));
  }, 350);
}

// Initialise game function
function initialise() {
  if (diff === undefined) {
    messageBox.textContent = 'Please select a difficulty option!';
    setTimeout(() => {
      setup();
    }, 1000);
  } else {
    revealBoard();
    diffSelect.disabled = true;
    gameStart = true;

    // Define user choice
    userChoice = this.cloneNode(true);
    if (this.id === 'X') {
      userMark = 'X';
      compMark = 'O';
      computerChoice = oBtn.cloneNode(true);
    } else {
      userMark = 'O';
      compMark = 'X';
      computerChoice = xBtn.cloneNode(true);
    }

    selectPlayer(userChoice);
  }
}

// Set board opacity, append squares and reveal
function revealBoard() {
  board.style.opacity = '1';
  board.style.transition = 'opacity 500ms';

  for (let i = 0; i < numSquares; i++) {
    let square = document.querySelector(`.square${i}`);
    let squareClass = square.className.toString();
    if (squareClass.includes('selected')) {
      let newClass = squareClass.replace('selected', '');
      square.className = newClass;
    }
    square.addEventListener('click', activateSquare);

    currState.push(i);
  }
}

// Select player symbol function
function selectPlayer(choice) {
  setTimeout(() => {
    messageBox.textContent = 'You chose ';
    messageBox.appendChild(choice);
    messageBox.style.opacity = 1;
  }, 350);
  messageBox.style.opacity = 0;

  userChoice.id = '';
  let userClass = userChoice.className.replace(' selector', '');
  userChoice.className = userClass;
  let computerClass = computerChoice.className.replace(' selector', '');
  computerChoice.className = computerClass;

  if (player === 'computer') {
    compActivate();
  }
}

// Function for click event
function activateSquare() {
  if (this.className.indexOf('selected') === -1) {
    let pos = currState.indexOf(Number(this.id));
    let newChoice;
    this.className += ' selected';

    // Determine user's move and check winning conditions
    if (player === 'user') {
      newChoice = userChoice.cloneNode(true);

      currState.splice(pos, 1, userMark);

      const freeSquares = calcEmpty(currState);
      if (checkWinConditions(currState, userMark)) {
        endGame(player);
      } else if (freeSquares.length === 0) {
        endGame('');
      } else {
        player = 'computer';
        compActivate();
      }
      // Determine computer's move and check winning conditions
    } else {
      newChoice = computerChoice.cloneNode(true);

      currState.splice(pos, 1, compMark);

      const freeSquares = calcEmpty(currState);
      if (checkWinConditions(currState, compMark)) {
        endGame(player);
      } else if (freeSquares.length === 0) {
        endGame('');
      } else {
        player = 'user';
      }
    }

    newChoice.style.fontSize = '4rem';
    newChoice.id = '';
    this.appendChild(newChoice);
    removeSelect(this);
  }
}

// Activate function for computer to play square 
function compActivate() {
  for (let i = 0; i < numSquares; i++) {
    if (typeof currState[i] === 'number') {
      removeSelect(document.querySelector(`.square${i}`));
    }
  }

  // Random decision-making for difficulty
  const free = calcEmpty(currState);
  let rand, best;
  if (diff === 'easy') {
    rand = randomNum(1, 2);
  } else if (diff === 'medium') {
    rand = randomNum(1, 4);
  } else {
    rand = randomNum(1, 8);
  }

  if (rand !== 1) {
    best = miniMax(currState, compMark);
  } else {
    best = { index: free[randomNum(0, free.length - 1)], score: 1 };
  }

  if (currState.includes(best.index)) {
    setTimeout(() => {
      for (let i = 0; i < numSquares; i++) {
        if (typeof currState[i] === 'number') {
          document.querySelector(`.square${i}`).addEventListener('click', activateSquare);
        }
      }
      let compSquare = document.querySelector(`.square${best.index}`);
      compSquare.click();
    }, 500);
  }
}

// Remove click listeners for squares
function removeSelect(square) {
  square.removeEventListener('click', activateSquare);
}

// Calculate empty cells
function calcEmpty(boardState) {
  return boardState.filter(i => i !== 'X' && i !== 'O');
}

// Random number function
function randomNum(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

// Minimax algorithm
function miniMax(curr, mark) {
  const freeSquares = calcEmpty(curr);

  // Determine win, lose or draw
  if (checkWinConditions(curr, userMark)) {
    return { score: -1 };
  } else if (checkWinConditions(curr, compMark)) {
    return { score: 1 };
  } else if (freeSquares.length === 0) {
    return { score: 0 };
  }

  // Create aray to test possible outcomes
  const allOutcomes = [];

  for (let i = 0; i < freeSquares.length; i++) {
    const currOutcome = {};
    currOutcome.index = curr[freeSquares[i]];
    curr[freeSquares[i]] = mark;

    // Test current player's mark on empty cell
    if (mark === compMark) {
      const result = miniMax(curr, userMark);
      currOutcome.score = result.score;
    } else {
      const result = miniMax(curr, compMark);
      currOutcome.score = result.score;
    }

    // Reset current state array
    curr[freeSquares[i]] = currOutcome.index;

    // Save result to all outcomes array
    allOutcomes.push(currOutcome);
  }

  let bestTest = null;

  // Calculate computer's best move
  if (mark === compMark) {
    let bestScore = -Infinity;
    for (let i = 0; i < allOutcomes.length; i++) {
      if (allOutcomes[i].score > bestScore) {
        bestScore = allOutcomes[i].score;
        bestTest = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < allOutcomes.length; i++) {
      if (allOutcomes[i].score < bestScore) {
        bestScore = allOutcomes[i].score;
        bestTest = i;
      }
    }
  }

  // Output calculation of minimax algorithm
  return allOutcomes[bestTest];
}

// Win conditions
function checkWinConditions(curr, mark) {
  return (curr[0] === mark && curr[1] === mark && curr[2] === mark) ||
    (curr[3] === mark && curr[4] === mark && curr[5] === mark) ||
    (curr[6] === mark && curr[7] === mark && curr[8] === mark) ||
    (curr[0] === mark && curr[3] === mark && curr[6] === mark) ||
    (curr[1] === mark && curr[4] === mark && curr[7] === mark) ||
    (curr[2] === mark && curr[5] === mark && curr[8] === mark) ||
    (curr[0] === mark && curr[4] === mark && curr[8] === mark) ||
    (curr[2] === mark && curr[4] === mark && curr[6] === mark);
}

// End game function
function endGame(winner) {
  if (gameStart) {
    gameCount++;
    messageBox.style.opacity = 0;
    if (winner === 'user') {
      userWin++;
      setTimeout(() => {
        messageBox.textContent = 'You won!';
        messageBox.style.opacity = 1;
      }, 350);
    } else if (winner === 'computer') {
      compWin++;
      setTimeout(() => {
        messageBox.textContent = 'The computer won!';
        messageBox.style.opacity = 1;
      }, 350);
    } else {
      setTimeout(() => {
        messageBox.textContent = 'Draw!';
        messageBox.style.opacity = 1;
      }, 350);
    }

    // Remove click listener for each square
    for (let i = 0; i < numSquares; i++) {
      removeSelect(document.querySelector(`.square${i}`));
    }
  }

  resetBtn.style.visibility = '';
  userCount.textContent = userWin;
  compCount.textContent = compWin;
  gameCounter.style.visibility = '';
  diffSelect.disabled = false;
}
