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
var colorPenaltyMap = { 'w': 1, 'b': -1 };
// Evaluation factors
var mobilityWeighting = 0.05;
var pawnWeighting = 0.5;
var centerWeighting = 0.25;
var extendedCenterSquares = [];
['c', 'd', 'e', 'f'].forEach(function (a) { return [3, 4, 5, 6].forEach(function (b) { return extendedCenterSquares.push(a + b); }); });
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
    var score = 0;
    score += allPieces.filter(function (p) { return p.color === 'b'; }).map(function (p) { return pieceValue[p.type]; }).reduce(sum, 0);
    score -= allPieces.filter(function (p) { return p.color === 'w'; }).map(function (p) { return pieceValue[p.type]; }).reduce(sum, 0);
    return score;
};
// Evaluate mobility, but with swapping
var evaluateMobilityB = function (game, multiplier) {
    var score = 0;
    score += multiplier * mobilityWeighting * game.moves().length;
    var fen = game.fen();
    swapTurn(game);
    score -= multiplier * mobilityWeighting * game.moves().length;
    game.load(fen);
    return score;
};
// Evaluate
var evaluateMobility = function (game, multiplier) {
    var score = multiplier * mobilityWeighting * game.moves().length;
    // @ts-ignore
    var modifiedGame = swapTurn(game);
    score -= multiplier * mobilityWeighting * modifiedGame.moves().length;
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
// Check occupancy of extended center
var evaluateCenter = function (game, allPieces) {
    // const centerSquares = ['d5', 'e5', 'd4', 'e4'];
    // Center control is more important in early and mid-game
    var openingWeighting = Math.max((allPieces.length - 8) / 24, 0);
    // console.log('centerWeighting with', allPieces.length, 'is:', centerWeighting);
    // Calculate control with per square reciprocal piece value of attacker
    var score = 0;
    for (var _i = 0, _a = ['c', 'd', 'e', 'f']; _i < _a.length; _i++) {
        var a = _a[_i];
        for (var _b = 0, _c = [3, 4, 5, 6]; _b < _c.length; _b++) {
            var b = _c[_b];
            var square = a + b;
            var piece = game.get(square);
            if (piece !== null) {
                score += (1 / pieceValue[piece.type]) * colorBonusMap[piece.color];
            }
        }
    }
    return score * openingWeighting * centerWeighting;
};
// Check possible moves in center
var evaluateCenterC = function (game, allPieces) {
    // Center control is more important in early and mid-game
    var openingWeighting = Math.max((allPieces.length - 8) / 24, 0);
    var score = game.moves({ verbose: true }).filter(function (m) { return extendedCenterSquares.indexOf(m.to) !== -1; }).map(function (m) { return (1 / pieceValue[m.piece]) * colorBonusMap[m.color]; }).reduce(sum, 0);
    return score * openingWeighting * centerWeighting;
};
// Check control via
var evaluateCenterB = function (game, allPieces) {
    var centerSquares = ['d5', 'e5', 'd4', 'e4'];
    var score = 0;
    // Center control is more important in early and mid-game
    var openingWeighting = Math.max((allPieces.length - 8) / 24, 0);
    var fen = game.fen();
    var movesToCenter = game.moves({ verbose: true }).filter(function (m) { return centerSquares.indexOf(m.to) !== -1; });
    swapTurn(game);
    movesToCenter.push.apply(movesToCenter, game.moves({ verbose: true }).filter(function (m) { return centerSquares.indexOf(m.to) !== -1; }));
    game.load(fen);
    var _loop_1 = function (square) {
        var squareScore = 0;
        var attackerScore = movesToCenter.filter(function (m) { return m.to === square; }).map(function (m) { return (1 / pieceValue[m.piece]) * colorBonusMap[m.color]; }).reduce(sum, 0);
        squareScore = attackerScore;
        /*
        // Other way: Count by squares
        if (Math.abs(attackerScore) < 0.01) {
          squareScore = 0;
        } else {
          squareScore = (attackerScore > 0 ? 1 : -1);
        }*/
        score += squareScore;
    };
    for (var _i = 0, centerSquares_1 = centerSquares; _i < centerSquares_1.length; _i++) {
        var square = centerSquares_1[_i];
        _loop_1(square);
    }
    return score * openingWeighting * centerWeighting;
};
var evaluateBoard = function (game, print) {
    if (print === void 0) { print = false; }
    var multiplier = (game.turn() === 'b' ? 1.0 : -1.0);
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
    var scores = {
        // 2. Material
        material: round(evaluateMaterial(allPieces)),
        // 3. Mobility (number of legal moves available)
        mobility: round(evaluateMobility(game, multiplier)),
        // 4. Pawn structure: doubled and isolated pawns
        pawns: round(evaluatePawns(game)),
        // 5. Center control, weighted by amount of pieces
        center: round(evaluateCenter(game, allPieces))
    };
    // TODO 6. King safety
    // const blackKing = allPieces.filter(p => p.type === 'k');
    // const whiteKing = allPieces.filter(p => p.type === 'w');
    var totalScore = round(Object.keys(scores).map(function (k, i) { return scores[k]; }).reduce(sum, 0));
    if (print) {
        console.log('Scores:', scores);
    }
    return totalScore;
};
var log = function (message) {
    console.log(message);
    document.getElementById('state').innerText = message;
};
var makeMove = function () {
    console.log('Board before move:', game.fen(), 'score:', evaluateBoard(game, true));
    if (game.game_over()) {
        log('Game over!');
        return;
    }
    log('Board evaluation score before: ' + round(evaluateBoard(game)));
    var searchDepth = 2;
    var rootNode = new TreeNode(0, [], null);
    var queue = [rootNode];
    // Node Generation
    var start = Date.now();
    var idx = 0;
    var _loop_2 = function () {
        var _a;
        var currentNode = queue[idx++];
        // Update current board to generate correct following moves
        for (var _i = 0, _b = currentNode.moves; _i < _b.length; _i++) {
            var m = _b[_i];
            game.move(m);
        }
        currentNode.score = evaluateBoard(game);
        if (currentNode.level < searchDepth) {
            var newNodes = game.moves().map(function (m) {
                return new TreeNode(currentNode.level + 1, currentNode.moves.concat([m]), currentNode);
            });
            (_a = currentNode.children).push.apply(_a, newNodes);
            queue.push.apply(queue, newNodes);
        }
        for (var _c = 0, _d = currentNode.moves; _c < _d.length; _c++) {
            var m = _d[_c];
            game.undo();
        }
    };
    while (idx < queue.length) {
        _loop_2();
    }
    // Tree walking
    idx = queue.length - 1;
    while (idx >= 0) {
        var currentNode = queue[idx--];
        // Only update score if leaf node
        if (currentNode.score === undefined) {
            for (var _i = 0, _a = currentNode.moves; _i < _a.length; _i++) {
                var m = _a[_i];
                game.move(m);
            }
            currentNode.score = evaluateBoard(game);
            for (var _b = 0, _c = currentNode.moves; _b < _c.length; _b++) {
                var m = _c[_b];
                game.undo();
            }
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
    var t = (Date.now() - start) / 1000;
    console.log('Visited nodes in ', t, ', queue size:', queue.length, 'nodes per second:', queue.length / t);
    var bestMove = rootNode.children.reduce(function (n0, n1) {
        if (n0.score === n1.score) {
            return Math.random() > 0.5 ? n0 : n1;
        }
        return n0.score > n1.score ? n0 : n1;
    }).moves[0];
    game.move(bestMove);
    console.log('Board after', bestMove, ':', game.fen(), round(evaluateBoard(game, true)));
    board.position(game.fen());
};
/* ---------- Game setup ---------- */
var game = new Chess();
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
