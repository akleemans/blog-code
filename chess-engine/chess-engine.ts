/// <reference path="global.d.ts" />

/* ---------- Constants ---------- */

import ChessColor = ChessJSTypes.ChessColor;

const pieceValue: { [key: string]: number } = {
  'q': 9.35,
  'r': 4.85,
  'b': 3.25,
  'n': 2.85,
  'p': 1,
  'k': 1,
}

const colorBonusMap = {'w': -1, 'b': 1};
const colorPenaltyMap = {'w': 1, 'b': -1};

// Evaluation factors
const mobilityWeighting = 0.05;
const pawnWeighting = 0.5;
const centerWeighting = 0.25;

const extendedCenterSquares = [];
['c', 'd', 'e', 'f'].forEach(a => [3, 4, 5, 6].forEach(b => extendedCenterSquares.push(a + b)));

/* ---------- Board helpers ---------- */

const getPieces = (game: Chess): ChessPiece[] => {
  const pieces = [];

  for (let row of game.board()) {
    for (let piece of row) {
      if (piece !== null) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
}

const swapTurn = (game: Chess): void => {
  let tokens = game.fen().split(' ');
  tokens[1] = game.turn() === 'b' ? 'w' : 'b';
  tokens[3] = '-';
  game.load(tokens.join(' '));
}

/* ---------- Helpers ---------- */

const sum = (a: number, b: number): number => a + b;

const round = (n: number): number => {
  return Math.round(n * 1000) / 1000;
}

const transpose = (m: ChessPiece[][]): ChessPiece[][] => m[0].map((x, i) => m.map(x => x[i]))

class TreeNode {
  public children: TreeNode[] = [];
  public score?: number;

  constructor(
    public level: number,
    public moves: string[],
    public parent: TreeNode,
  ) {
  }
}

/* ---------- Evaluation methods ---------- */

const evaluateMaterial = (allPieces: ChessPiece[]): number => {
  let score = 0;
  score += allPieces.filter(p => p.color === 'b').map(p => pieceValue[p.type]).reduce(sum, 0);
  score -= allPieces.filter(p => p.color === 'w').map(p => pieceValue[p.type]).reduce(sum, 0);
  return score;
};

const evaluateMobility = (game: Chess, multiplier: number): number => {
  let score = 0;
  score += multiplier * mobilityWeighting * game.moves().length;
  const fen = game.fen();
  swapTurn(game);
  score -= multiplier * mobilityWeighting * game.moves().length;
  game.load(fen);
  return score;
};

const hasPawns = (colNr: number, color: ChessColor, cols: ChessPiece[][]): boolean => {
  if (colNr < 0 || colNr > 7) {
    return false;
  } else {
    return cols[colNr].filter(p => p && p.type === 'p' && p.color === color).length > 0;
  }
}

const evaluatePawns = (game: Chess): number => {
  const cols = transpose(game.board());

  let pawnScore = 0;

  // Doubled pawns
  for (let col of cols) {
    const pawns = col.filter(p => p && p.type === 'p');
    pawnScore += (pawns.filter(p => p.color === 'w').length >= 2 ? 1 : 0);
    pawnScore -= (pawns.filter(p => p.color === 'b').length >= 2 ? 1 : 0);
  }

  // Isolated pawns
  for (let i = 0; i < cols.length; i++) {
    pawnScore += (hasPawns(i, 'w', cols) && !hasPawns(i - 1, 'w', cols) &&
      !hasPawns(i + 1, 'w', cols)) ? 1 : 0;
    pawnScore -= (hasPawns(i, 'b', cols) && !hasPawns(i - 1, 'b', cols) &&
      !hasPawns(i + 1, 'b', cols)) ? 1 : 0;
  }

  return pawnScore * pawnWeighting;
};

// Check occupancy of extended center
const evaluateCenter = (game: Chess, allPieces: ChessPiece[]): number => {
  // const centerSquares = ['d5', 'e5', 'd4', 'e4'];
  // Center control is more important in early and mid-game
  const openingWeighting = Math.max((allPieces.length - 8) / 24, 0);
  // console.log('centerWeighting with', allPieces.length, 'is:', centerWeighting);

  // Calculate control with per square reciprocal piece value of attacker
  let score = 0;
  for (let a of ['c', 'd', 'e', 'f']) {
    for (let b of [3, 4, 5, 6]) {
      const square = a + b;
      let piece = game.get(square);
      if (piece !== null) {
        score += (1 / pieceValue[piece.type]) * colorBonusMap[piece.color];
      }
    }
  }

  return score * openingWeighting * centerWeighting;
}

// Check possible moves in center
const evaluateCenterC = (game: Chess, allPieces: ChessPiece[]): number => {
  // Center control is more important in early and mid-game
  const openingWeighting = Math.max((allPieces.length - 8) / 24, 0);

  const score = game.moves({verbose: true}).filter(
    (m: Move) => extendedCenterSquares.indexOf(m.to) !== -1).map(
    (m: Move) => (1 / pieceValue[m.piece]) * colorBonusMap[m.color]).reduce(sum, 0);

  return score * openingWeighting * centerWeighting;
}

// Check control via
const evaluateCenterB = (game: Chess, allPieces: ChessPiece[]): number => {
  const centerSquares = ['d5', 'e5', 'd4', 'e4'];
  let score = 0;
  // Center control is more important in early and mid-game
  const openingWeighting = Math.max((allPieces.length - 8) / 24, 0);
  const fen = game.fen();
  const movesToCenter = game.moves({verbose: true}).filter(
    (m: Move) => centerSquares.indexOf(m.to) !== -1);
  swapTurn(game);
  movesToCenter.push(...game.moves({verbose: true}).filter(
    (m: Move) => centerSquares.indexOf(m.to) !== -1));
  game.load(fen);

  for (let square of centerSquares) {
    let squareScore = 0;
    const attackerScore = movesToCenter.filter((m: Move) => m.to === square).map(
      (m: Move) => (1 / pieceValue[m.piece]) * colorBonusMap[m.color]).reduce(sum, 0);
    squareScore = attackerScore;
    /*
    // Other way: Count by squares
    if (Math.abs(attackerScore) < 0.01) {
      squareScore = 0;
    } else {
      squareScore = (attackerScore > 0 ? 1 : -1);
    }*/
    score += squareScore;
  }

  return score * openingWeighting * centerWeighting;
}

const evaluateBoard = (game: Chess, print: boolean = false): number => {
  const multiplier = (game.turn() === 'b' ? 1.0 : -1.0);
  const allPieces = getPieces(game);

  // 1. Game state
  if (game.game_over()) {
    if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
      return 0;
    }
    if (game.in_checkmate()) {
      return -multiplier * 200;
    }
  }
  let scores = {
    // 2. Material
    material: round(evaluateMaterial(allPieces)),
    // 3. Mobility (number of legal moves available)
    mobility: round(evaluateMobility(game, multiplier)),
    // 4. Pawn structure: doubled and isolated pawns
    pawns: round(evaluatePawns(game)),
    // 5. Center control, weighted by amount of pieces
    center: round(evaluateCenter(game, allPieces)),
  };
  // TODO 6. King safety
  // const blackKing = allPieces.filter(p => p.type === 'k');
  // const whiteKing = allPieces.filter(p => p.type === 'w');

  const totalScore = round(Object.keys(scores).map(
    (k, i) => scores[k]).reduce(sum, 0));
  if (print) {
    console.log('Scores:', scores)
  }

  return totalScore;
}

const log = (message: string): void => {
  console.log(message);
  document.getElementById('state').innerText = message;
}

const makeMove = (): void => {
  console.log('Board before move:', game.fen(), 'score:', evaluateBoard(game, true));

  if (game.game_over()) {
    log('Game over!');
    return;
  }

  log('Board evaluation score before: ' + round(evaluateBoard(game)));

  const searchDepth = 3;
  const maxQueueSize = 500000;
  const rootNode = new TreeNode(0, [], null);
  const queue = [rootNode];
  const fen = game.fen();

  // Node Generation
  let start = Date.now();
  let idx = 0;
  while (idx < queue.length && queue.length <= maxQueueSize) {
    let currentNode = queue[idx++];

    // Update current board to generate correct following moves
    game.load(fen);
    for (let m of currentNode.moves) {
      game.move(m);
    }

    if (currentNode.level < searchDepth) {
      const newNodes = game.moves().map((m: string) =>
        new TreeNode(currentNode.level + 1, [...currentNode.moves, m], currentNode));
      currentNode.children.push(...newNodes);
      queue.push(...newNodes);
    }
  }
  console.log('Finished generating nodes in ', (Date.now() - start) / 1000, ', queue size:', queue.length);

  start = Date.now();
  // Tree walking
  idx = queue.length - 1;
  while (idx >= 0) {
    let currentNode = queue[idx--];
    // Only update score if leaf node
    if (currentNode.score === undefined) {
      game.load(fen);
      for (let m of currentNode.moves) {
        game.move(m);
      }
      currentNode.score = evaluateBoard(game);
    }
    if (currentNode.parent === null) {
      continue;
    }
    // Set score of parent
    if (currentNode.parent.score === undefined ||
      currentNode.level % 2 === 1 && (currentNode.parent.score < currentNode.score) ||
      currentNode.level % 2 === 0 && (currentNode.parent.score > currentNode.score)) {
      currentNode.parent.score = currentNode.score;
    }
  }
  console.log('Walked tree in ', (Date.now() - start) / 1000, ', root node:', rootNode);

  const bestMove = rootNode.children.reduce((n0, n1) => {
    if (n0.score === n1.score) {
      return Math.random() > 0.5 ? n0 : n1;
    }
    return n0.score > n1.score ? n0 : n1
  }).moves[0];
  // console.log('Finished walking tree, best move:', bestMove, 'in', (Date.now() - start) / 1000, 's');
  game.load(fen);
  game.move(bestMove);
  console.log('Board after', bestMove, ':', game.fen());
  log('Board score after ' + bestMove + ' : ' + round(evaluateBoard(game, true)));

  board.position(game.fen());
}

/* ---------- Game setup ---------- */

const game: Chess = new Chess();
console.log('board:', game.fen());

const onDragStart = (source, piece, position, orientation) => {
  // do not pick up pieces if the game is over
  if (game.game_over()) {
    return false;
  }

  // Only pick up pieces for White
  if (piece.search(/^b/) !== -1) {
    return false;
  }
}

const onDrop = (source, target) => {
  // see if the move is legal
  let move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to queen
  });

  // illegal move
  if (move === null) {
    return 'snapback';
  }

  // make random legal move for black
  window.setTimeout(makeMove, 250);
}

// Update the board position after the piece snap
// for castling, en passant, pawn promotion
const onSnapEnd = (): void => {
  board.position(game.fen())
}

const config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

const boardElement = document.getElementById('myBoard');
let board;

// Don't initialize Chessboard UI for tests
if (boardElement) {
  // @ts-ignore
  board = Chessboard('myBoard', config);
  board.position(game.fen());
} else {
  console.log('Board element not found in DOM, quitting.');
}

