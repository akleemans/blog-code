# blog-code

Initial UI example: https://chessboardjs.com/examples/5001

Compile Typescript: `tsc shannon.ts`

Shannon function ([source](https://www.pi.infn.it/~carosi/chess/shannon.txt)):

f(P)= 200(K-K') + 9(Q-Q') + 5(R-R') + 3 (B-B'+N-N') + (P-P')- 0.5(D-D'+S-S'+I-I') + 0.1(M-M')

in which:-
K,Q,R,B,N,P are the number of White kings, queens, rooks, bishops, knights
and pawns on the board.

D,S,I are doubled, backward and isolated White pawns.
M= White mobility (measured, say, as the number of legal moves available
to White).
