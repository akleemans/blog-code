/// <reference path="global.d.ts" />
var pieceValue = {
    'q': 9.35,
    'r': 4.85,
    'b': 3.25,
    'n': 2.85,
    'p': 1,
    'k': 1
};
var colorBonusMap = { 'w': -1, 'b': 1 };
// Evaluation factors
var mobilityWeighting = 0.05;
var pawnWeighting = 0.5;
var centerWeighting = 0.2;
var center = [51, 53, 67, 68];
var extendedCenter = [34, 35, 36, 37, 50, 51, 52, 53, 66, 67, 68, 69, 82, 83, 84, 85];
/* ---------- Board helpers ---------- */
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
var swapTurn = function (game) {
    var tokens = game.fen().split(' ');
    tokens[1] = game.turn() === 'b' ? 'w' : 'b';
    tokens[3] = '-';
    return new Chess(tokens.join(' '));
};
/* ---------- Helpers ---------- */
var sum = function (a, b) { return a + b; };
var round = function (n) {
    return Math.round(n * 1000) / 1000;
};
var transpose = function (m) { return m[0].map(function (x, i) { return m.map(function (x) { return x[i]; }); }); };
var TreeNode = /** @class */ (function () {
    function TreeNode(level, moves, parent) {
        this.level = level;
        this.moves = moves;
        this.parent = parent;
        this.children = [];
    }
    return TreeNode;
}());
/* ---------- Evaluation methods ---------- */
var evaluateMaterial = function (allPieces) {
    return allPieces.filter(function (p) { return p; }).map(function (p) { return pieceValue[p.type] * colorBonusMap[p.color]; }).reduce(sum);
};
// Evaluate
var evaluateMobility = function (moves, enemyMoves, multiplier) {
    return multiplier * mobilityWeighting * moves.length - multiplier * mobilityWeighting * enemyMoves.length;
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
var calculateCenterScore = function (moves) {
    var score = 0;
    for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
        var move = moves_1[_i];
        var multiplier = 0;
        if (center.indexOf(move.to) !== -1) {
            multiplier = 2;
        }
        else if (extendedCenter.indexOf(move.to) !== -1) {
            multiplier = 1;
        }
        // console.log('move: ', move, 'multiplier:', multiplier, 'pieceValue[move.piece]:', pieceValue[move.piece], 'colorBonusMap[move.color]', colorBonusMap[move.color]);
        score += multiplier * (1 / pieceValue[move.piece]) * colorBonusMap[move.color];
    }
    return score;
};
var evaluateCenter = function (moves, enemyMoves, nrOfPieces) {
    // Center control is more important in early and mid-game
    var openingWeighting = Math.max((nrOfPieces - 8) / 24, 0);
    // Calculate control with per square reciprocal piece value of attacker
    var score = calculateCenterScore(moves) + calculateCenterScore(enemyMoves);
    return score * openingWeighting * centerWeighting;
};
var evaluateBoard = function (game, print) {
    if (print === void 0) { print = false; }
    var multiplier = colorBonusMap[game.turn()];
    var allPieces = getPieces(game);
    // 1. Game state
    if (game.game_over()) {
        if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
            return 0;
        }
        if (game.in_checkmate()) {
            return -multiplier * 200;
        }
    }
    var moves = game.moves();
    var enemyMoves = swapTurn(game).moves();
    var scores = {
        // 2. Material
        material: round(evaluateMaterial(allPieces)),
        // 3. Mobility (number of legal moves available)
        mobility: round(evaluateMobility(moves, enemyMoves, multiplier)),
        // 4. Pawn structure: doubled and isolated pawns
        pawns: round(evaluatePawns(game)),
        // 5. Center control, weighted by amount of pieces
        center: round(evaluateCenter(moves, enemyMoves, allPieces.length))
    };
    var totalScore = round(Object.keys(scores).map(function (k, i) { return scores[k]; }).reduce(sum, 0));
    if (print) {
        console.log('Scores:', scores);
    }
    return totalScore;
};
var log = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    console.log(message);
    document.getElementById('state').innerHTML = message.reduce(function (a, b) { return a + '<br>' + b; });
};
var getSortedMoves = function (game) {
    // Sort to really make use of minmax
    return game.moves().sort(function (a, b) {
        return a.flags - b.flags;
    });
};
var bestMove;
var searchDepth = 3;
var positionsEvaluated;
var max = function (game, depth, alpha, beta) {
    var moves = getSortedMoves(game);
    if (depth == 0 || moves.length === 0) {
        return evaluateBoard(game);
    }
    var maxValue = alpha;
    for (var _i = 0, _a = game.moves(); _i < _a.length; _i++) {
        var move = _a[_i];
        positionsEvaluated++;
        game.move(move);
        var score = min(game, depth - 1, maxValue, beta);
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
};
var min = function (game, depth, alpha, beta) {
    var moves = getSortedMoves(game);
    if (depth == 0 || moves.length === 0) {
        return evaluateBoard(game);
    }
    var minValue = beta;
    for (var _i = 0, _a = game.moves(); _i < _a.length; _i++) {
        var move = _a[_i];
        positionsEvaluated++;
        game.move(move);
        var score = max(game, depth - 1, alpha, minValue);
        game.undo();
        if (score < minValue) {
            minValue = score;
            if (minValue <= alpha)
                break;
        }
    }
    return minValue;
};
var makeMove = function () {
    // console.log('Board before move:', game.fen());
    if (game.game_over()) {
        log('Game over!');
        return;
    }
    var start = Date.now();
    positionsEvaluated = 0;
    bestMove = undefined;
    max(game, searchDepth, -Infinity, +Infinity);
    var t = (Date.now() - start) / 1000;
    log('Visited nodes in ' + t + 's', 'Positions evaluated: ' + positionsEvaluated, 'Nodes per second: ' + Math.round(positionsEvaluated / t), 'Current board score: ' + round(evaluateBoard(game, true)));
    if (bestMove == undefined) {
        throw new Error('Didnt find any move!');
    }
    game.move(bestMove);
    // log('Board after '+  bestMove + ': ' + game.fen(), 'Score: ' + round(evaluateBoard(game, true)));
    board.position(game.fen());
};
/* ---------- Game setup ---------- */
var game = new Chess();
log('Engine loaded.');
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
var onDrop = function (source, target) {
    var move = game.move({
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
};
// Update the board position after the piece snap
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
// Don't initialize Chessboard UI for tests
if (boardElement) {
    // @ts-ignore
    board = Chessboard('myBoard', config);
    board.position(game.fen());
}
else {
    console.log('Board element not found in DOM, quitting.');
}
