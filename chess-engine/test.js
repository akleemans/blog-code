describe('Chess engine', () => {

  describe('chess.js assumptions', () => {
    it('should load fen fast', () => {
      let midGameFen = 'rn1Q1k1r/pp2R2b/5p2/7p/2B5/2N2P1q/PP6/3KR3 b - - 2 24';
      let game = Chess();

      // Time fen() methods
      let start = Date.now();
      for (let i = 0; i < 500; i++) {
        let initialFen = game.fen();
        game.load(midGameFen)
        let fen2 = game.fen();
        game.load(initialFen)
      }
      const fenTime = (Date.now() - start) / 1000;
      // console.log('fenTime:', fenTime);

      expect(fenTime).toBeLessThan(1);
    });

    it('should undo move', () => {
      let game = Chess();

      let fen1 = game.fen();
      game.move(game.moves()[0]);
      game.move(game.moves()[0]);
      game.undo();
      game.undo();

      expect(fen1).toEqual(game.fen());
    });

    it('should provide moves only for one side', () => {
      let game = Chess();

      const moves = game.moves();
      expect(moves.length).toEqual(20);
    });

    it('should provide correct amount of moves', () => {
      let game = Chess('rn1Q1k1r/pp2R2b/5p2/7p/2B5/2N2P1q/PP6/3KR3 b - - 2 24');
      expect(game.moves().length).toEqual(0);

      game.load('4k3/4P3/4K3/8/8/8/8/8 b - - 0 78');
      expect(game.moves().length).toEqual(0);

      game.load(
          'rnbqkbnr/ppp5/3ppp1p/6P1/2BPP3/6P1/PPP4P/RNBQK1NR b KQkq - 0 6');
      expect(game.moves().length).toEqual(25);

      game.load(
          'rnb1kbnr/pppp1ppp/1q6/4P3/4P3/6P1/PPPP3P/RNBQKBNR b KQkq - 0 5');
      expect(game.moves().length).toEqual(41);

      game.load('8/3p4/4p3/K7/5k2/1pn5/8/8 w - - 0 54');
      expect(game.moves().length).toEqual(3);

      game.load(
          'r1b1k1nr/1pppbppp/1p6/n3Pq2/2PP4/P1N2NP1/4B2P/R1BQK2R w KQkq - 0 14');
      expect(game.moves().length).toEqual(38);
    });
  });

  describe('Helper methods', () => {
    it('should calculate sum', () => {
      expect(sum(1, 2)).toEqual(3);
      expect(sum(-10, 5)).toEqual(-5);
    });

    it('should transpose board', () => {
      expect(transpose([[1, 2], [1, 4]])).toEqual([[1, 1], [2, 4]]);
      expect(transpose([[1, 2, 3], [1, 2, 3], [1, 2, 3]])).toEqual(
          [[1, 1, 1], [2, 2, 2], [3, 3, 3]]);
    });
  });

  describe('Game state', () => {
    it('should recognize game over', () => {
      const gameOvers = [
        'rn1Q1k1r/pp2R2b/5p2/7p/2B5/2N2P1q/PP6/3KR3 b - - 2 24',
        'N7/p7/8/1p2R2Q/7k/BP6/P6P/7K b - - 6 40'
      ]
      for (let fen of gameOvers) {
        game.load(fen);
        let score = evaluateBoard(game);
        expect(game.game_over()).toBeTruthy();
        expect(score).toEqual(-200);
      }
    });

    it('should recognize stalemate', () => {
      game.load('4k3/4P3/4K3/8/8/8/8/8 b - - 0 78');
      let score = evaluateBoard(game);
      expect(game.game_over()).toBeTruthy();
      expect(game.in_stalemate()).toBeTruthy();
      expect(score).toEqual(0);
    });

    it('should recognize insufficient material', () => {
      game.load('8/3K4/8/8/8/2n2k2/8/8 b - - 0 70');
      let score = evaluateBoard(game);
      expect(game.game_over()).toBeTruthy();
      expect(game.insufficient_material()).toBeTruthy();
      expect(score).toEqual(0);
    });
  });

  describe('Material evaluation', () => {
    it('should calculate initial position', () => {
      game.load('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      let score = evaluateMaterial(getPieces(game));
      expect(score).toBeCloseTo(0);
    });

    it('should evaluate missing pawn', () => {
      game.load(
          'rnbqkbnr/ppp5/3ppp1p/6P1/2BPP3/6P1/PPP4P/RNBQK1NR b KQkq - 0 6')
      const score = evaluateMaterial(getPieces(game));
      expect(score).toBeCloseTo(-1);
    });

    it('should evaluate captured queen', () => {
      game.load(
          'rnb1kbn1/ppppq3/6p1/1B3pN1/5P1r/4Q3/PPPP3P/RNB1K2R b KQq - 3 10')
      const scoreBefore = evaluateMaterial(getPieces(game));

      game.load(
          'rnb1kbn1/pppp4/6p1/1B3pN1/5P1r/4q3/PPPP3P/RNB1K2R w KQq - 0 11')
      const scoreAfter = evaluateMaterial(getPieces(game))
      expect(scoreAfter - scoreBefore).toBeCloseTo(9.35);
    });

    it('should evaluate material fast', () => {
      game.load(
          'rnbqkbnr/ppp5/3ppp1p/6P1/2BPP3/6P1/PPP4P/RNBQK1NR b KQkq - 0 6')

      let start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const score = evaluateMaterial(getPieces(game));
        expect(score).toBeCloseTo(-1);
      }
      const evaluationTime = (Date.now() - start) / 1000;
      console.log('Material evaluation:', evaluationTime);
      expect(evaluationTime).toBeLessThan(0.05);
    });
  });

  describe('Mobility evaluation', () => {
    it('should calculate mobility for endgame situation', () => {
      // 19 moves for black, 4 for white. White to move, so multiplier = -1
      game.load('8/p2p4/4p1k1/1p6/4n1K1/8/8/8 w - - 0 48');
      expect(evaluateMobility(game.moves(), swapTurn(game).moves(),
          -1)).toBeCloseTo(15 * mobilityWeighting);
    });

    it('should calculate mobility for late endgame', () => {
      // 16 moves for black, 5 for white
      game.load('8/3p4/3K4/8/8/2n2k2/8/8 w - - 11 70');
      expect(evaluateMobility(game.moves(), swapTurn(game).moves(),
          -1)).toBeCloseTo(11 * mobilityWeighting);
    });

    it('should calculate mobility for initial game', () => {
      game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(evaluateMobility(game.moves(), swapTurn(game).moves(),
          -1)).toBeCloseTo(0);
    });

    it('should evaluate mobility "somewhat" fast', () => {
      game.load(
          'rnbqkbnr/ppp5/3ppp1p/6P1/2BPP3/6P1/PPP4P/RNBQK1NR b KQkq - 0 6')

      let start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const score = evaluateMobility(game.moves(), swapTurn(game).moves(),
            -1);
        expect(score).toBeCloseTo(0.75);
      }
      const evaluationTime = (Date.now() - start) / 1000;
      console.log('Mobility evaluation:', evaluationTime);
      expect(evaluationTime).toBeLessThan(5);
    });
  });

  describe('Pawn evaluation', () => {
    it('should recognize no isolated & doubled pawns', () => {
      // No isolated or doubled pawns
      game.load('8/p2p4/4p1k1/1p6/4n1K1/8/8/8 w - - 0 48');
      expect(evaluatePawns(game)).toBeCloseTo(0);
    });

    it('should recognize isolated pawn', () => {
      game.load('8/3p4/4p3/K7/5k2/1pn5/8/8 w - - 0 54');
      expect(evaluatePawns(game)).toBeCloseTo(-1 * pawnWeighting);
    });

    it('should recognize one double white pawn', () => {
      game.load(
          'rnb1kbnr/pppp1ppp/1q6/4P3/4P3/6P1/PPPP3P/RNBQKBNR b KQkq - 0 5');
      expect(evaluatePawns(game)).toBeCloseTo(pawnWeighting);
    });

    it('should handle black doubled, white isolated pawn', () => {
      game.load(
          'r1b1k1nr/1pppbppp/1p6/n3Pq2/2PP4/P1N2NP1/4B2P/R1BQK2R w KQkq - 0 14');
      expect(evaluatePawns(game)).toBeCloseTo(0);
    });

    it('should handle complex situation with border pawns', () => {
      // Black: 1 doubled, 2 isolated pawns
      // White: 1 doubled, 3 isolated pawns
      // => White is weaker in pawn structure
      game.load(
          'r1b1kbnr/1pP2pp1/1p1p4/n3Pq1p/2P5/P1N2NP1/4B2P/R1BQK2R w KQkq - 0 17');
      expect(evaluatePawns(game)).toBeCloseTo(pawnWeighting);
    });

    it('should evaluate pawn structure fast', () => {
      game.load(
          'r1b1kbnr/1pP2pp1/1p1p4/n3Pq1p/2P5/P1N2NP1/4B2P/R1BQK2R w KQkq - 0 17')

      let start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const score = evaluatePawns(game);
        expect(score).toBeCloseTo(pawnWeighting);
      }
      const evaluationTime = (Date.now() - start) / 1000;
      console.log('Pawn structure evaluation:', evaluationTime);
      expect(evaluationTime).toBeLessThan(0.05);
    });
  });

  describe('Center control evaluation', () => {
    const nrOfPieces = 32;

    it('should evaluate center control for initial game', () => {
      game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(evaluateCenter(game.moves(), swapTurn(game).moves(),
          nrOfPieces)).toBeCloseTo(0);
    });

    it('should see white as more in control in mid-game', () => {
      game.load(
          'r1b1kbnr/1pP2pp1/1p1p4/n3Pq1p/2P5/P1N2NP1/4B2P/R1BQK2R w KQkq - 0 17');
      expect(evaluateCenter(game.moves(), swapTurn(game).moves(),
          nrOfPieces)).toBeLessThan(0);
    });

    it('should see white dominating the center', () => {
      game.load(
          'r1b1kbnr/1pPq1pp1/1p1P4/n6p/2P5/P1N2NP1/4B2P/R1BQK2R w KQkq - 1 18');
      // console.log('score:', evaluateCenter(game, getPieces(game)));
      expect(evaluateCenter(game.moves(), swapTurn(game).moves(),
          nrOfPieces)).toBeLessThan(0);
    });

    it('should give less weight for endgame', () => {
      game.load('8/p2p4/4p1k1/1p6/4n1K1/8/8/8 w - - 0 48');
      expect(
          evaluateCenter(game.moves(), swapTurn(game).moves(), 8)).toBeCloseTo(
          0);
    });

    it('should recognize balanced center situation', () => {
      game.load('r1b2knr/pppp2pp/2n5/2b2B2/4PP2/2PP4/PP5P/RNB1QKNR b - - 0 10');
      expect(evaluateCenter(game.moves(), swapTurn(game).moves(),
          nrOfPieces)).toBeLessThan(centerWeighting);
    });

    it('should evaluate center control fast', () => {
      game.load('r1b2knr/pppp2pp/2n5/2b2B2/4PP2/2PP4/PP5P/RNB1QKNR b - - 0 10')

      let start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const score = evaluateCenter(game.moves(), swapTurn(game).moves(), 32);
        expect(score).toBeLessThan(centerWeighting);
      }
      const evaluationTime = (Date.now() - start) / 1000;
      console.log('Center control evaluation:', evaluationTime);
      expect(evaluationTime).toBeLessThan(0.5);
    });
  });
});
