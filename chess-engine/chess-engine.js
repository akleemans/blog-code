/// <reference path="global.d.ts" />
/* Constants */
var pieceValue = {
    'q': 9.35,
    'r': 4.85,
    'b': 3.25,
    'n': 2.85,
    'p': 1,
    'k': 0
};
// Evaluation factors
var mobilityWeighting = 0.1;
var pawnWeighting = 0.5;
// @ts-ignore
var game = new Chess('rnb1kbnr/pppp1ppp/1q6/4P3/4P3/6P1/PPPP3P/RNBQKBNR w KQkq - 0 5');
console.log('board:', game.fen());
var onDragStart = function (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) {
        return false;
    }
    // Only pick up pieces for White
    if (piece.search(/^b/) !== -1) {
        return false;
    }
};
var getPieces = function (game) {
    var pieces = [];
    for (var _i = 0, _a = game.board(); _i < _a.length; _i++) {
        var row = _a[_i];
        for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
            var piece = row_1[_b];
            if (piece !== null) {
                pieces.push(piece);
            }
        }
    }
    return pieces;
};
/* Evaluation methods */
var sum = function (a, b) { return a + b; };
var round = function (n) {
    return Math.round(n * 1000) / 1000;
};
var transpose = function (m) { return m[0].map(function (x, i) { return m.map(function (x) { return x[i]; }); }); };
/* Evaluation methods */
var evaluateMaterial = function (allPieces) {
    var score = 0;
    score += allPieces.filter(function (p) { return p.color === 'b'; }).map(function (p) { return pieceValue[p.type]; }).reduce(sum, 0);
    score -= allPieces.filter(function (p) { return p.color === 'w'; }).map(function (p) { return pieceValue[p.type]; }).reduce(sum, 0);
    return score;
};
var evaluateMobility = function (game, multiplier) {
    var score = 0;
    score += multiplier * mobilityWeighting * game.moves().length;
    var fen = game.fen();
    swapTurn(game);
    score -= multiplier * mobilityWeighting * game.moves().length;
    game.load(fen);
    return score;
};
var hasPawns = function (colNr, color, cols) {
    if (colNr < 0 || colNr > 7) {
        return false;
    }
    else {
        return cols[colNr].filter(function (p) { return p && p.type === 'p' && p.color === color; }).length > 0;
    }
};
var evaluatePawns = function (game) {
    var cols = transpose(game.board());
    var pawnScore = 0;
    // Doubled pawns
    for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
        var col = cols_1[_i];
        var pawns = col.filter(function (p) { return p && p.type === 'p'; });
        pawnScore += (pawns.filter(function (p) { return p.color === 'w'; }).length >= 2 ? 1 : 0);
        pawnScore -= (pawns.filter(function (p) { return p.color === 'b'; }).length >= 2 ? 1 : 0);
    }
    // Isolated pawns
    for (var i = 0; i < cols.length; i++) {
        pawnScore += (hasPawns(i, 'w', cols) && !hasPawns(i - 1, 'w', cols) &&
            !hasPawns(i + 1, 'w', cols)) ? 1 : 0;
        pawnScore -= (hasPawns(i, 'b', cols) && !hasPawns(i - 1, 'b', cols) &&
            !hasPawns(i + 1, 'b', cols)) ? 1 : 0;
    }
    return pawnScore * pawnWeighting;
};
var evaluateBoard = function (game) {
    var multiplier = (game.turn() === 'b' ? 1.0 : -1.0);
    var allPieces = getPieces(game);
    var score = 0;
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
    var scoreBefore = score;
    score += evaluateMobility(game, multiplier);
    /*
    if (Math.random() < 0.01) {
      console.log('Mobility score:', score - scoreBefore);
    }*/
    // 4. Pawn structure: doubled and isolated pawns
    score += evaluatePawns(game);
    // TODO 5. Center control, weighted by amount of pieces
    // TODO 6. King safety
    // const blackKing = allPieces.filter(p => p.type === 'k');
    // const whiteKing = allPieces.filter(p => p.type === 'w');
    return round(score);
};
var swapTurn = function (game) {
    var tokens = game.fen().split(' ');
    tokens[1] = game.turn() === 'b' ? 'w' : 'b';
    tokens[3] = '-';
    game.load(tokens.join(' '));
};
var TreeNode = /** @class */ (function () {
    function TreeNode(level, moves, parent) {
        this.level = level;
        this.moves = moves;
        this.parent = parent;
        this.children = [];
    }
    return TreeNode;
}());
var log = function (message) {
    console.log(message);
    document.getElementById('state').innerText = message;
};
var makeMove = function () {
    console.log('Board before move:', game.fen(), 'score:', evaluateBoard(game));
    if (game.game_over()) {
        log('Game over!');
        return;
    }
    log('Board evaluation score: ' + round(evaluateBoard(game)));
    var start = Date.now();
    var searchDepth = 2;
    var maxQueueSize = 5000;
    var rootNode = new TreeNode(0, [], null);
    var queue = [rootNode];
    var fen = game.fen();
    var idx = 0;
    var _loop_1 = function () {
        var _a;
        var currentNode = queue[idx++];
        // Update current board to generate correct following moves
        for (var _i = 0, _b = currentNode.moves; _i < _b.length; _i++) {
            var m = _b[_i];
            game.move(m);
        }
        if (currentNode.level < searchDepth) {
            var newNodes = game.moves().map(function (m) {
                return new TreeNode(currentNode.level + 1, currentNode.moves.concat([m]), currentNode);
            });
            (_a = currentNode.children).push.apply(_a, newNodes);
            queue.push.apply(queue, newNodes);
        }
        else if (currentNode.level === searchDepth) {
            currentNode.score = evaluateBoard(game);
        }
        game.load(fen);
    };
    // Generation
    while (idx < queue.length && queue.length <= maxQueueSize) {
        _loop_1();
    }
    console.log('Finished generating nodes, queue size:', queue.length);
    // Tree walking
    idx = queue.length - 1;
    while (idx > 0) {
        var currentNode = queue[idx--];
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
    var bestMove = rootNode.children.reduce(function (n0, n1) {
        if (n0.score === n1.score) {
            return Math.random() > 0.5 ? n0 : n1;
        }
        return n0.score > n1.score ? n0 : n1;
    }).moves[0];
    console.log('Finished walking tree, best move:', bestMove, 'in', (Date.now() - start) / 1000, 's');
    game.move(bestMove);
    console.log('Board after', bestMove, ':', game.fen(), 'score:', evaluateBoard(game));
    board.position(game.fen());
};
var onDrop = function (source, target) {
    // see if the move is legal
    var move = game.move({
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
};
// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function () {
    board.position(game.fen());
};
var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};
var boardElement = document.getElementById('myBoard');
var board;
if (boardElement) {
    // @ts-ignore
    board = Chessboard('myBoard', config);
    board.position(game.fen());
}
else {
    console.log('Board element not found in DOM, quitting.');
}
