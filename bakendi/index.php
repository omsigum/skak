<?php
// run the engine and return a bestmove. 
if (isset($_POST['fen'])) {
	$fen = $_POST['fen'];
	$time = $_POST['time'];
	$command = "./test.sh '" . $fen ."' " . $time;
	// echo $command;
	echo exec($command);
}
else{
	echo "invalid";
}
?>
