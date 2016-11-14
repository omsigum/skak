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
	var xblock = Math.floor((xdiff / model.squareSize) + 0.5) * -1;
	var yblock = Math.floor((ydiff / model.squareSize) + 0.5);
	
	var pfromright = srcelement.parentElement.style.left;
	var countfromright = (pfromright.substring(0,pfromright.length - 2)) / model.squareSize;

	var pfromtop = srcelement.parentElement.style.top;
	var countfromtop = 8 - ((pfromtop.substr(0,pfromtop.length - 2 )) / model.squareSize); // the -8 is to reverte the number. 8 is at the bottom but is suppose to be at the top
	var from = letters[countfromright] + countfromtop;
	var xto = countfromright + xblock; // add the "move" value, how far did he go in the x direction
	var yto = countfromtop + yblock;   // same for the y,
	var to = letters[xto] + yto;
	view.move(from + to); // this is the same function as takes in the SAN moves, so if the move is valid it is accepted and it triggers a refresh of the board. looks good. 
}
var model = {
	squareSize: 60,
	chess : null,
	playermove: true,
	history: new Array(),
	time: 20,
	chessObj: new DHTMLGoodies.ChessFen({squareSize: 60}),
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
			this.getbest(octapus.currentfen());
			// turn the turn indicator red. 
			if(this.chess.game_over()){
				octapus.gameover();
			}
			return true;
		}
		else{
			// the move was not accpepted. 
			return false;
		}
	},
	getbest: function(fen){
		$.ajax({
		  type: "POST",
		  url: "http://localhost:3000/bakendi", 
		  crossDomain: true,
		  data: {
		  	fen: fen,
			time: model.time
		  },
		  success: function(response){
			  model.pcomve(response);
		  }
		});
	},
	getbestmove: function(reqstedfen){
		$.ajax({
		  type: "POST",
		  url: "http://localhost:3000/bakendi", 
		  crossDomain: true,
		  data: {
		  	fen: reqstedfen,
			time: model.time
		  },
		  success: function(response){
			  view.showbestmove(response);
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
		this.history.push(this.chess.fen());
		octapus.refresh();
		this.playermove = true;
	},
	getHistory: function(){
		return this.chess.history({ verbose: true });
	}
	
}
var octapus = {
	gameover: function(){
		// freeze the board and make it aware that the game has ended. 
		model.playermove = false; // player not able to move.
		alert("Game over");			
	},
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
		document.getElementById("settime").addEventListener("click",function(){
			// update the time. 
			element = document.getElementById("timec");
			model.time = element.value;
			console.log(element.value);
			element.value = 0;
			alert("updated");
		})
	},
	showbestmove: function(blabla){
		console.log(blabla);
		var thing = document.getElementById("bestmove");
		thing.innerHTML = blabla;
		
		alert("bestmove updated.");
	},
	move: function(move){
			// user submited a move. 
			if(move == ""){
				var move = document.getElementById('movefield').value;
			}
			if (!octapus.moveaplayer(move)) {
				alert("move was not accpepted");
			}
			var move = document.getElementById('movefield').value = "";
	},
	render: function(){
		var colortomove = model.getcolor();
		var text = "";
		if(model.chess.game_over())
			text = "Game over";
		else if(colortomove == "b")
			text = "Black to move";
		else
			text = "White to move - Your turn"
		document.getElementById("turn").innerHTML = text;
	
		octapus.getgameobj().loadFen(octapus.currentfen(),'chessBoard1'); // the string replace is here so that the fen is modified to a point that the chess board is always turned to the user. (the chessFen drawer is for forums and has to be slightly modified to fir my needs.)
		// append the history into the column. 
		var chessHistory = model.getHistory();
		if(chessHistory.length != 0){
			chessboard =  new DHTMLGoodies.ChessFen({squareSize: 30});
			var outputdiv = document.createElement("div");
			outputdiv.id = "chessboard2" + chessHistory.length;
			var ouputli = document.createElement("li");
			var ouputlicon = document.createTextNode(chessHistory[chessHistory.length - 1].color + chessHistory[chessHistory.length - 1].from + chessHistory[chessHistory.length - 1].to);
			ouputli.appendChild(ouputlicon);
			ouputli.appendChild(outputdiv);	
			octapus.getListelement().appendChild(ouputli);
			let fenpostition  = model.history.length -1;
			ouputli.addEventListener("click",function(event){
				// function for triggering a diagnostic of the game at that position.
				console.log("hey");
				console.log(model.history[fenpostition]);
				console.log(fenpostition);
				model.getbestmove(model.history[fenpostition]);
			});
			chessboard.loadFen(octapus.currentfen(), "chessboard2" + chessHistory.length);
		}
	}
}
model.init();
view.init();
/* This project will interact with a static backend, it can serve multible people at a time. */ 
/* The fen is stored in local storage and the user can resume a game after a refresh */
/* open source project's used are https://github.com/jhlywa/chess.js and the chess engine stockfish */
