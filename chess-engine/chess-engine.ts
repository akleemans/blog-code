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

// Evaluation factors
const mobilityWeighting = 0.05;
const pawnWeighting = 0.5;
const centerWeighting = 0.2;

const center = [51, 53, 67, 68];
const extendedCenter = [34, 35, 36, 37, 50, 51, 52, 53, 66, 67, 68, 69, 82, 83, 84, 85];

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

const swapTurn = (game: Chess): Chess => {
  let tokens = game.fen().split(' ');
  tokens[1] = game.turn() === 'b' ? 'w' : 'b';
  tokens[3] = '-';
  return new Chess(tokens.join(' '));
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
  return allPieces.filter(p => p).map(p => pieceValue[p.type] * colorBonusMap[p.color]).reduce(sum);
};

// Evaluate
const evaluateMobility = (moves: RawMove[], enemyMoves: RawMove[], multiplier: number): number => {
  return multiplier * mobilityWeighting * moves.length - multiplier * mobilityWeighting * enemyMoves.length;
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

const calculateCenterScore = (moves: RawMove[]): number => {
  let score = 0;
  for (const move of moves) {
    let multiplier = 0;
    if (center.indexOf(move.to) !== -1) {
      multiplier = 2;
    } else if (extendedCenter.indexOf(move.to) !== -1) {
      multiplier = 1;
    }
    // console.log('move: ', move, 'multiplier:', multiplier, 'pieceValue[move.piece]:', pieceValue[move.piece], 'colorBonusMap[move.color]', colorBonusMap[move.color]);
    score += multiplier * (1 / pieceValue[move.piece]) * colorBonusMap[move.color];
  }
  return score;
};

const evaluateCenter = (moves: RawMove[], enemyMoves: RawMove[], nrOfPieces: number): number => {
  // Center control is more important in early and mid-game
  const openingWeighting = Math.max((nrOfPieces - 8) / 24, 0);

  // Calculate control with per square reciprocal piece value of attacker
  let score = calculateCenterScore(moves) + calculateCenterScore(enemyMoves);

  return score * openingWeighting * centerWeighting;
}

const evaluateBoard = (game: Chess, print: boolean = false): number => {
  const multiplier = colorBonusMap[game.turn()];
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
  const moves = game.moves();
  const enemyMoves = swapTurn(game).moves();

  let scores = {
    // 2. Material
    material: round(evaluateMaterial(allPieces)),
    // 3. Mobility (number of legal moves available)
    mobility: round(evaluateMobility(moves, enemyMoves, multiplier)),
    // 4. Pawn structure: doubled and isolated pawns
    pawns: round(evaluatePawns(game)),
    // 5. Center control, weighted by amount of pieces
    center: round(evaluateCenter(moves, enemyMoves, allPieces.length)),
  };

  const totalScore = round(Object.keys(scores).map(
    (k, i) => scores[k]).reduce(sum, 0));
  if (print) {
    console.log('Scores:', scores)
  }

  return totalScore;
}

const log = (...message: string[]): void => {
  console.log(message);
  document.getElementById('state').innerHTML = message.reduce((a, b) => a + '<br>' + b);
}

const getSortedMoves = (game: Chess): RawMove[] => {
  // Sort to really make use of minmax
  return game.moves().sort((a: RawMove, b: RawMove) => {
    return a.flags - b.flags;
  });
}

let bestMove;
const searchDepth = 3;
let positionsEvaluated;

const max = (game: Chess, depth: number, alpha: number, beta: number): number => {
  const moves = getSortedMoves(game);
  if (depth == 0 || moves.length === 0) {
    return evaluateBoard(game);
  }

  let maxValue = alpha;
  for (const move of game.moves()) {
    positionsEvaluated++;
    game.move(move)
    const score = min(game, depth - 1, maxValue, beta);
    game.undo();
    if (score > maxValue) {
      maxValue = score;
      if (depth === searchDepth) {
        bestMove = move;
      }
      if (maxValue >= beta) {
        break;
      }
    }
  }
  return maxValue;
}

const min = (game: Chess, depth: number, alpha: number, beta: number): number => {
  const moves = getSortedMoves(game);
  if (depth == 0 || moves.length === 0) {
    return evaluateBoard(game);

  }
  let minValue = beta;
  for (const move of game.moves()) {
    positionsEvaluated++;
    game.move(move)
    const score = max(game, depth - 1, alpha, minValue);
    game.undo();
    if (score < minValue) {
      minValue = score;
      if (minValue <= alpha)
        break;
    }
  }
  return minValue;
}

const makeMove = (): void => {
  // console.log('Board before move:', game.fen());
  if (game.game_over()) {
    log('Game over!');
    return;
  }

  const start = Date.now();
  positionsEvaluated = 0;
  bestMove = undefined;
  max(game, searchDepth, -Infinity, +Infinity);
  const t = (Date.now() - start) / 1000;
  log('Visited nodes in ' + t + 's', 'Positions evaluated: ' + positionsEvaluated,
    'Nodes per second: ' + Math.round(positionsEvaluated / t),
    'Current board score: ' + round(evaluateBoard(game, true)));

  if (bestMove == undefined) {
    throw new Error('Didnt find any move!');
  }

  game.move(bestMove);
  // log('Board after '+  bestMove + ': ' + game.fen(), 'Score: ' + round(evaluateBoard(game, true)));

  board.position(game.fen());
}

/* ---------- Game setup ---------- */

const game: Chess = new Chess();
log('Engine loaded.');

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
  let move = game.move({
    from: source,
    to: target,
    promotion: 'q' // always promote to queen
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

