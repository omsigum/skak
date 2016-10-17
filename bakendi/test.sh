#!/bin/bash
FEN=$1
echo $FEN
( 
echo "position fen $FEN" 
echo "go depth 20"
sleep 20
) | stockfish