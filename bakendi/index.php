<?php
// run the engine and return a bestmove. 
if (isset($_POST['fen'])) {
	$fen = $_POST['fen'];
	echo exec('./test.sh ' . $fen);
}
else{
	echo "invalid";
}
?>