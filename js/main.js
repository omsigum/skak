var startx = 0;
var starty = 0;
var letters = ['a','b','c','d','e','f','g','h'];
var srcelement;
var board;
var allowDrop = function(event){ // this event is to allow a drop, otherwise no drop is triggered. 
	event.preventDefault();
}
var drag = function(event){ // this event triggers when the image is starting to move. Here is record information about the start position and the element being draged.
	startx = event.clientX;
	starty = event.clientY;
	srcelement = event.srcElement;
	
}
var drop = function(event){	

	event.preventDefault(); // allow the element to drop
	var xdiff = startx - event.clientX;
	var ydiff = starty - event.clientY;
	var xblock = Math.floor((xdiff / 45) + 0.5) * -1;
	var yblock = Math.floor((ydiff / 45) + 0.5);
	
	var pfromright = srcelement.parentElement.style.left;
	var countfromright = (pfromright.substring(0,pfromright.length - 2)) / 45;

	var pfromtop = srcelement.parentElement.style.top;
	var countfromtop = 8 - ((pfromtop.substr(0,pfromtop.length - 2 )) / 45); // the -8 is to reverte the number. 8 is at the bottom but is suppose to be at the top
	var from = letters[countfromright] + countfromtop;
	var xto = countfromright + xblock; // add the "move" value, how far did he go in the x direction
	var yto = countfromtop + yblock;   // same for the y,
	var to = letters[xto] + yto;
	view.move(from + to); // this is the same function as takes in the SAN moves, so if the move is valid it is accepted and it triggers a refresh of the board. looks good. 
}
var model = {
	chess : null,
	playermove: true,
	history: new Array(),
	chessObj: new DHTMLGoodies.ChessFen(),
	historylist : null,
	init : function(){
		// initalize a new chess game. 
		this.chess = new Chess();
		this.historylist = document.getElementById('history');
	},
	getcolor: function()
	{
		return this.chess.turn();
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
		  url: "http://localhost:3000/bakendi", 
		  crossDomain: true,
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
		console.log(play + " the move.")
		this.chess.move(play, {sloppy: true});
		octapus.refresh();
		this.playermove = true;
	},
	getHistory: function(){
		return this.chess.history({ verbose: true });
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

		// method is in the model. perhaps dosent have to be hereþ
	},
	getListelement(){
		return model.historylist;
	}
}
var view = {
	init :function(){
		// initalize the view for the user and listen for a submit.
		this.render();
		// listen for the user making a move. 
		document.getElementById('play').addEventListener('click',function(){
			view.move("");
		})
	},
	move: function(move){
			// user submited a move. 
			if(move == ""){
				var move = document.getElementById('movefield').value;
			}
			if (!octapus.moveaplayer(move)) {
				alert("move was not accpepted");
			}
			// move.value = ""; // clear the field. 
	},
	render: function(){
		// get the side moving and update the moving status. 
		var colortomove = model.getcolor();
		var text = "";
		if(colortomove == "b")
			text = "Black to move";
		else
			text = "White to move - Your turn"
		document.getElementById("turn").innerHTML = text;

		
		console.log(octapus.currentfen() + octapus.getgameobj())
		octapus.getgameobj().loadFen(octapus.currentfen().replace(' b ', ' w '),'chessBoard1'); // the string replace is here so that the fen is modified to a point that the chess board is always turned to the user. (the chessFen drawer is for forums and has to be slightly modified to fir my needs.)
		// append the history into the column. 
		var chessHistory = model.getHistory();
		console.log(chessHistory);
		var outputlist = "";
		for (var i = 0; i < chessHistory.length; i++) {

			outputlist += "<li>" + chessHistory[i].color + chessHistory[i].from + chessHistory[i].to + "</li>" ;
			// -> [{ color: 'w', from: 'e2', to: 'e4', flags: 'b', piece: 'p', san: 'e4' },
		}
		octapus.getListelement().innerHTML = outputlist;
	}
}
model.init();
view.init();
/* This project will interact with a static backend, it can serve multible people at a time. */ 
/* The fen is stored in local storage and the user can resume a game after a refresh */
/* open source project's used are https://github.com/jhlywa/chess.js and the chess engine stockfish */
