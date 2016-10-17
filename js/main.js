var model = {
	chess : null,
	playermove: true,
	history: new Array(),
	chessObj: new DHTMLGoodies.ChessFen(),
	init : function(){
		// initalize a new chess game. 
		this.chess = new Chess();
	},
	move : function(play){
		var a = this.chess.move(play, {sloppy: true});
		console.log(a);
		if (a != null && this.playermove) {
			// the move was accepted. 
			this.playermove = false;
			// trigger the process to get a response from the server. add the move to history and then refresh the chess board for the user. 
			// append to history. 
			this.history.push(this.chess.fen());
			// refresh the chess board. 
			octapus.refresh();
			// set the game to the computer's turn. 
			this.playermove = false;
			this.getbestmove();
			// turn the turn indicator red. 
			
			return true;
		}
		else{
			// the move was not accpepted. 
			return false;
		}
	},
	getbestmove: function(){
	// this will stay empty for some time. 
		$.ajax({
		  type: "POST",
		  url: "https://nam.eniac.is/VEFPHP/skakapi/index.php",
		  data: {
		  	fen: octapus.currentfen()
		  },
		  success: function(response){
		  	console.log(response);
		  	model.pcomve(response);
		  }
		});
	},
	fen(){
		return this.chess.fen();
	},
	pcomve: function(response){
		var play = response.split(' ')[1];
		console.log(play + "the move. ")
		this.chess.move(play, {sloppy: true});
		octapus.refresh();
		this.playermove = true;
	}
	
}
var octapus = {
	currentfen: function(){
		return model.fen();
	},
	moveaplayer: function(play){
		return model.move(play);
	},
	refresh: function(){
		// refresh. 
		view.render(octapus.currentfen());
	},
	getgameobj: function(){
		return model.chessObj;
	},
	movepc: function(response){
		// response in style. bestmove yk zs ponder rt aw
		// remove ponder from the back. 

	}
}
var view = {
	init :function(){
		// initalize the view for the user and listen for a submit.
		
		this.render();
		// listen for the user making a move. 
		document.getElementById('play').addEventListener('click',function(){
			// user submited a move. 
			var move = document.getElementById('movefield');
			console.log(move.value);
			if (octapus.moveaplayer(move.value)) {
				alert("move was accpepted, please wait for response");
			}
			else{
				alert("move was not accpepted, please try agein. are you sure it's your turn ?");
			}
			move.value = "";
		})
	},
	render: function(){
		console.log(octapus.currentfen() + octapus.getgameobj())
		octapus.getgameobj().loadFen(octapus.currentfen().replace(' b ', ' w '),'chessBoard1'); // the string replace is here so that the fen is modified to a point that the chess board is always turned to the user. (the chessFen drawer is for forums and has to be slightly modified to fir my needs.)
	}
}
model.init();
view.init();
octapus.moveaplayer('e5');
/* This project will interact with a static backend, it can serve multible people at a time. */ 
/* The fen is stored in local storage and the user can resume a game after a refresh */
/* open source project's used are https://github.com/jhlywa/chess.js and the chess engine stockfish */
