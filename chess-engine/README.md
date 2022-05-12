# Chess engine

Custom chess engine. UI elements based on
this [initial UI example](https://chessboardjs.com/examples/5001).

Compile Typescript: `tsc chess-engine.ts`
Run tests: Open `run-tests.html` in browser will let jasmine run the tests.

## Evaluation

The following criteria are used for evaluating a position:

* Game: 200/-200 for won/lost, 0 for draw
* Material: Sum of piece values on board
* Mobility: Number of legal moves (* 0.1)
* Pawn structure: Penalty for doubled or isolated pawns (* 0.5)
* Center control

## Idea

Based on the ideas of [paper from Shannon](https://www.pi.infn.it/~carosi/chess/shannon.txt).

Formula used there:

```
f(P)= 200(K-K') + 9(Q-Q') + 5(R-R') + 3(B-B'+N-N')  + (P-P') 
    - 0.5(D-D'+S-S'+I-I') 
    + 0.1(M-M')

where K,Q,R,B,N,P are the number of White kings, queens, rooks, bishops, knights
and pawns on the board.
D,S,I are doubled, backward and isolated White pawns.
M = White mobility (measured, say, as the number of legal moves available
to White).
```
