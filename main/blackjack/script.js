const startButton = document.getElementById('start-button');
const deleteButton = document.getElementById('delete-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const playerHand = document.getElementById('player-hand');
const dealerHand = document.getElementById('dealer-hand');
const playerScore = document.getElementById('player-score');
const dealerScore = document.getElementById('dealer-score');
const playerIsHalf = document.getElementById('player-ishalf');

const docs = document.getElementById('docs');
if (docs) {
  (async () => {
    const text = await fetchText('/main/blackjack/docs.txt');
    docs.innerHTML = text;
  })();
}

let count = JSON.parse(localStorage.getItem('count')) || {
  win: 0,
  lose: 0,
  tie: 0,
  blackjack: 0,
  reach21: 0
};
updateScoreboard(
  count.win + count.lose + count.tie,
  count.win,
  count.lose,
  count.tie,
  count.blackjack,
  count.reach21
);

let deck = [];
let playerCards = [];
let dealerCards = [];
let gameInProgress = false;

const suitEmojis = {
  'Hearts': '<div class="red">♥',
  'Diamonds': '<div class="red">♦',
  'Clubs': '<div class="black">♣',
  'Spades': '<div class="black">♠'
};

// Save data
function saveData() {
  localStorage.setItem('count', JSON.stringify(count));
}
// Delete data
function deleteData() {
  count = { win: 0, lose: 0, tie: 0, blackjack: 0, reach21: 0 };
  localStorage.removeItem('count');
  updateScoreboard(0, 0, 0, 0, 0, 0);
  showMessage('スコアボードを初期化しました！')
}

// Toggle docs
function toggleDocs() {
  const docsboard = document.getElementById('docsboard');
  if (docsboard.style.display === 'none') {
    docsboard.style.display = 'block';
  } else {
    docsboard.style.display = 'none';
  }
}

// Toggle scoreboard
function toggleScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  if (scoreboard.style.display === 'none') {
    scoreboard.style.display = 'block';
  } else {
    scoreboard.style.display = 'none';
  }
}

// Update scoreboard
function updateScoreboard(totalPlays, wins, losses, draws, blackjacks, twentyOne) {
  document.getElementById('total').textContent = `${totalPlays.toLocaleString()}`;
  document.getElementById('win').textContent = `${wins.toLocaleString()}`;
  document.getElementById('lose').textContent = `${losses.toLocaleString()}`;
  document.getElementById('tie').textContent = `${draws.toLocaleString()}`;
  document.getElementById('blackjack').textContent = `${blackjacks.toLocaleString()}`;
  document.getElementById('twenty-one').textContent = `${twentyOne.toLocaleString()}`;
}

// Start
startButton.addEventListener('click', startGame);

function startGame() {
  if (gameInProgress) return;
  gameInProgress = true;

  deck = createDeck();
  playerCards = [drawCard(), drawCard()];
  dealerCards = [drawCard()];

  updateUI();
  playSound("/snd/start.mp3");
  startButton.disabled = true;
  deleteButton.disabled = true;
  standButton.disabled = false;
}

// Draw
function drawCard() {
  const randomIndex = Math.floor(Math.random() * deck.length);
  const card = deck.splice(randomIndex, 1)[0];
  return card;
}

// Create
function createDeck() {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push(`${value} of ${suit}`);
    }
  }

  return deck;
}

// Update UI
function updateUI() {
  hitButton.disabled = true;
  standButton.disabled = true;
  playerHand.innerHTML = playerCards.map(card => formatCard(card)).join(', ');
  dealerHand.innerHTML = dealerCards.map(card => formatCard(card)).join(', '); 
  playerScore.textContent = calculateScore(playerCards);
  dealerScore.textContent = calculateScore(dealerCards);
  playerIsHalf.textContent = isHalf(playerCards) ? '(half)' : null;
  if (calculateScore(playerCards) === 21) {
    hitButton.disabled = true;
  } else {
    hitButton.disabled = false;
  }
  standButton.disabled = false;
}

// Format card
function formatCard(card) {
  const [value, suit] = card.split(' of ');
  return `${suitEmojis[suit]} ${value}</div>`;
}

// Score
function calculateScore(cards) {
  let score = 0;
  let hasAce = false;
  let aceCount = 0;

  for (const card of cards) {
    const value = card.split(' ')[0];
    if (value === 'A') {
      hasAce = true;
      aceCount++;
      score += 11;
    } else if (value === 'K' || value === 'Q' || value === 'J') {
      score += 10;
    } else {
      score += parseInt(value);
    }
  }

  while (hasAce && score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
};

// Is Half
function isHalf(cards) {
  let score = 0;
  let hasAce = false;
  let aceCount = 0;

  for (const card of cards) {
    const value = card.split(' ')[0];
    if (value === 'A') {
      hasAce = true;
      aceCount++;
      score += 11;
    } else if (value === 'K' || value === 'Q' || value === 'J') {
      score += 10;
    } else {
      score += parseInt(value);
    }
  }

  while (hasAce && score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return aceCount > 0;
};

// Hit
hitButton.addEventListener('click', () => {
  playerCards.push(drawCard());
  updateUI();

  if (calculateScore(playerCards) > 21) {
    endGame(false);
  } else {
    playSound("/snd/hit.mp3");
  }
});

// Stand
standButton.addEventListener('click', () => {
  while (calculateScore(dealerCards) < 17) {
    dealerCards.push(drawCard());
  }

  updateUI();
  endGame();
});

// Blackjack?
function hasBlackjack(cards) {
  return (
    (cards.length === 2 && calculateScore(cards) === 21)
  );
}

// End
async function endGame() {
  gameInProgress = false;
  hitButton.disabled = true;
  standButton.disabled = true;

  const playerScoreValue = calculateScore(playerCards);
  const dealerScoreValue = calculateScore(dealerCards);

  await sleep(300);

  let message = "";
  let soundPath = "/snd/";

  if (hasBlackjack(playerCards) && hasBlackjack(dealerCards)) {
    message = "ブラックジャック！引き分け！";
    soundPath += "tie.mp3";
    count.tie++;
    count.blackjack++;
  } else if (hasBlackjack(playerCards)) {
    message = "ブラックジャック！あなたの勝ち！";
    soundPath += "bj.mp3";
    count.win++;
    count.blackjack++;
  } else if (hasBlackjack(dealerCards)) {
    message = "ディーラーのブラックジャック！あなたの負け！";
    soundPath += "lose.mp3";
    count.lose++;
  } else if (playerScoreValue > 21) {
    message = "バースト！あなたの負け！";
    soundPath += "burst.mp3";
    count.lose++;
  } else if (dealerScoreValue > 21) {
    message = "ディーラーのバースト！あなたの勝ち！";
    soundPath += "win.mp3";
    count.win++;
  } else if (playerScoreValue > dealerScoreValue) {
    message = "あなたの勝ち！";
    soundPath += "win.mp3";
    count.win++;
  } else if (playerScoreValue < dealerScoreValue) {
    message = "あなたの負け！";
    soundPath += "lose.mp3";
    count.lose++;
  } else {
    message = "引き分け！";
    soundPath += "tie.mp3";
    count.tie++;
  }

  if (!hasBlackjack(playerCards) && playerScoreValue == 21) {
    message += "<br>あなたの手札は21！";
    count.reach21++;
  }
  
  updateScoreboard(
    count.win + count.lose + count.tie,
    count.win,
    count.lose,
    count.tie,
    count.blackjack,
    count.reach21
  );
  saveData();
  playSound(soundPath);

  await sleep(300);

  showMessage(message);
}

// Pop up
function showMessage(message) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `<p>${message}</p>`;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    overlay.remove();
    startButton.disabled = false;
    deleteButton.disabled = false;
  });

  setTimeout(() => {
    overlay.remove();
    startButton.disabled = false;
    deleteButton.disabled = false;
  }, 1000);
}


function playSound(path) {
  const sound = new Audio(path);
  sound.play();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Reset
hitButton.disabled = true;
standButton.disabled = true;
