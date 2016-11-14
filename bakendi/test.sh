#!/bin/bash
FEN=$1
echo $FEN
( 
echo "position fen $FEN" 
echo "go depth $2"
sleep $2
) | stockfish
exit 0
