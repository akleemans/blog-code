/// <reference path="global.d.ts" />

/* Constants */

const pieceValue: { [key: string]: number } = {
  'q': 9.35,
  'r': 4.85,
  'b': 3.25,
  'n': 2.85,
  'p': 1,
  'k': 0,
}

// Evaluation factors
const mobilityWeighting = 0.1;
const pawnWeighting = 0.5;

// @ts-ignore
let game = new Chess('rnb1kbnr/pppp1ppp/1q6/4P3/4P3/6P1/PPPP3P/RNBQKBNR w KQkq - 0 5');
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

const getPieces = (game): { color: string, type: string }[] => {
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

/* Evaluation methods */

const sum = (a, b) => a + b;

const round = (n: number): number => {
  return Math.round(n * 1000) / 1000;
}

const transpose = (m: ChessPiece[][]): ChessPiece[][] => m[0].map((x, i) => m.map(x => x[i]))

/* Evaluation methods */

const evaluateMaterial = (allPieces): number => {
  let score = 0;
  score += allPieces.filter(p => p.color === 'b').map(p => pieceValue[p.type]).reduce(sum, 0);
  score -= allPieces.filter(p => p.color === 'w').map(p => pieceValue[p.type]).reduce(sum, 0);
  return score;
};

const evaluateMobility = (game, multiplier): number => {
  let score = 0;
  score += multiplier * mobilityWeighting * game.moves().length;
  const fen = game.fen();
  swapTurn(game);
  score -= multiplier * mobilityWeighting * game.moves().length;
  game.load(fen);
  return score;
};

const hasPawns = (colNr: number, color: 'b' | 'w', cols: ChessPiece[][]): boolean => {
  if (colNr < 0 || colNr > 7) {
    return false;
  } else {
    return cols[colNr].filter(p => p && p.type === 'p' && p.color === color).length > 0;
  }
}

const evaluatePawns = (game): number => {
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

const evaluateCenter = (game: Chess): number => {
  // TODO
  // get center square
  // calculate control for each square (attack w/ recipr. piece value, occupancy)

  return 0;
}

const evaluateBoard = (game): number => {
  const multiplier = (game.turn() === 'b' ? 1.0 : -1.0);
  const allPieces = getPieces(game);
  let score = 0;

  // 1. Game state
  if (game.game_over()) {
    if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
      return 0;
    }
    if (game.in_checkmate()) {
      return -multiplier * 200;
    }
  }

  // 2. Material
  score += evaluateMaterial(allPieces);

  // 3. Mobility (number of legal moves available)
  score += evaluateMobility(game, multiplier);

  // 4. Pawn structure: doubled and isolated pawns
  score += evaluatePawns(game);

  // 5. Center control, weighted by amount of pieces
  score += evaluateCenter(game);

  // TODO 6. King safety
  // const blackKing = allPieces.filter(p => p.type === 'k');
  // const whiteKing = allPieces.filter(p => p.type === 'w');

  return round(score);
}

const swapTurn = (game) => {
  let tokens = game.fen().split(' ');
  tokens[1] = game.turn() === 'b' ? 'w' : 'b';
  tokens[3] = '-';
  game.load(tokens.join(' '));
}

class TreeNode {
  public children: TreeNode[] = [];
  public score?: number;

  constructor(
    public level: number,
    public moves: { from: string, to: string }[],
    public parent: TreeNode,
  ) {
  }
}

const log = (message: string): void => {
  console.log(message);
  document.getElementById('state').innerText = message;
}

const makeMove = () => {
  console.log('Board before move:', game.fen(), 'score:', evaluateBoard(game));

  if (game.game_over()) {
    log('Game over!');
    return;
  }

  log('Board evaluation score: ' + round(evaluateBoard(game)));

  const start = Date.now();
  const searchDepth = 2;
  const maxQueueSize = 5000;
  const rootNode = new TreeNode(0, [], null);
  const queue = [rootNode];
  const fen = game.fen();

  let idx = 0;
  // Generation
  while (idx < queue.length && queue.length <= maxQueueSize) {
    let currentNode = queue[idx++];

    // Update current board to generate correct following moves
    for (let m of currentNode.moves) {
      game.move(m);
    }

    if (currentNode.level < searchDepth) {
      const newNodes = game.moves().map(m =>
        new TreeNode(currentNode.level + 1, [...currentNode.moves, m], currentNode));
      currentNode.children.push(...newNodes);
      queue.push(...newNodes);
    } else if (currentNode.level === searchDepth) {
      currentNode.score = evaluateBoard(game);
    }
    game.load(fen);
  }
  console.log('Finished generating nodes, queue size:', queue.length);

  // Tree walking
  idx = queue.length - 1;
  while (idx > 0) {
    let currentNode = queue[idx--];
    // Calculate score of current node if not set yet
    /*
    if (currentNode.score === undefined) {
      for (let m of currentNode.moves) {
        game.move(m);
      }
      currentNode.score = evaluateBoard(game);
      game.load(fen);
    }*/
    // Set score of parent
    if (currentNode.parent.score === undefined ||
      currentNode.level % 2 === 1 && (currentNode.parent.score < currentNode.score) ||
      currentNode.level % 2 === 0 && (currentNode.parent.score > currentNode.score)) {
      currentNode.parent.score = currentNode.score;
    }
  }
  console.log('Tree:', rootNode);

  const bestMove = rootNode.children.reduce((n0, n1) => {
    if (n0.score === n1.score) {
      return Math.random() > 0.5 ? n0 : n1;
    }
    return n0.score > n1.score ? n0 : n1
  }).moves[0];
  console.log('Finished walking tree, best move:', bestMove, 'in', (Date.now() - start) / 1000, 's');
  game.move(bestMove);
  console.log('Board after', bestMove, ':', game.fen(), 'score:', evaluateBoard(game));

  board.position(game.fen());
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

// update the board position after the piece snap
// for castling, en passant, pawn promotion
const onSnapEnd = () => {
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

if (boardElement) {
  // @ts-ignore
  board = Chessboard('myBoard', config);
  board.position(game.fen());
} else {
  console.log('Board element not found in DOM, quitting.');
}

