// global variables
var game_canvas;
var game_context;
var timer_canvas;
var timer_context;
var canvas;
var timerID = 0;
var startTime;
var timeLeft = 0;
var pic1 = new Image(); pic1.src =  "images/cat_01.gif";
var pic2 = new Image(); pic2.src ="images/cat_02.gif";    
var pic3 = new Image(); pic3.src = "images/cat_03.gif";  
var pic4 = new Image(); pic4.src = "images/cat_04.gif"; 
var pic5 = new Image(); pic5.src = "images/cat_05.gif";  
var pic6 = new Image(); pic6.src = "images/cat_06.gif";  
var pic7 = new Image(); pic7.src = "images/cat_07.gif";  
var pic8 = new Image(); pic8.src = "images/cat_08.gif";  
var pic9 = new Image(); pic9.src =  "images/cat_09.gif";
var pic10 = new Image(); pic10.src ="images/cat_10.gif";    
var pic11 = new Image(); pic11.src = "images/cat_11.gif";  
var pic12 = new Image(); pic12.src = "images/cat_12.gif"; 
var pic13 = new Image(); pic13.src = "images/cat_13.gif";  
var pic14 = new Image(); pic14.src = "images/cat_14.gif";  
var pic15 = new Image(); pic15.src = "images/cat_15.gif";  
var pic16 = new Image(); pic16.src = "images/cat_16.png";  

var grid = new Array(4);
var mouse_x;
var mouse_y;
var clickedX;
var clickedY;
var rotations;
var answers;

//Settings class
var settings = {
	rows: 4,
	columns: 4,
	width: 100,
	height: 100
};



//Runs when the window loads
window.onload = function() {
	//Load game_canvas and game_context
	game_canvas = document.getElementById('miniGame');
	game_context = game_canvas.getContext('2d');
	canvas = document.getElementById('gameWorld');
	console.log("Game canvas loaded!");
	init();
	setupAnswer();
	game_context.font = "bold 20px Time New Roman";
	game_context.fillText("Time Left:", 400, 20);
	
}

//Mouse even listener
window.onclick = function(e) {
	mouse_x = e.pageX;
	mouse_y = e.pageY;

	if (mouse_x > 0 && mouse_y > 0 && mouse_x < 400 && mouse_y < 400 && Math.floor(mouse_x / settings.width) < settings.columns 
		&& Math.floor(mouse_y / settings.height) < settings.height) {
		clickedX = Math.floor(mouse_x/settings.width);
		clickedY = Math.floor(mouse_y/settings.height);

		if (timerID !== 0) {
			switch(rotations[clickedX][clickedY]) {
			case 0:
				rotations[clickedX][clickedY] = 1;
				break;
			case 1:
				rotations[clickedX][clickedY] = 2;
				break;
			case 2:
				rotations[clickedX][clickedY] = 3;
				break;
			case 3:
				rotations[clickedX][clickedY] = 0;
				break;
			default:
				break;
			}
		}
		

		
		console.log(clickedX + ", " + clickedY + " rotation = " + rotations[clickedX][clickedY]);
	}

	drawCanvas();
	if (checkAnswer() && timerID !== 0) {
		endGame();
	}
}

function checkAnswer() {
	for (var x = 0; x < settings.rows; x++) {
		for (var y = 0; y < settings.columns; y++) {
			if (rotations[x][y] === 0) {
				console.log("true")
			} else {
				console.log("false");
				return false;
			}
		}
	}
	return true;
}

//ends the game and stops timer
function endGame() {
	alert("YOU WON!");
	clearTimeout(timerID);
	timerID = 0;
	canvas.style.display = "block";
	canvas.focus();
	init();
	setupAnswer();
	setupTimer();
	updateTimer();
}

function init() {
	answers = new Array(4);
	rotations = new Array(4);
	for (var x = 0; x < settings.rows; x++) {
		rotations[x] = new Array(4);
		answers[x] = new Array(4);
	}

	for (var x = 0; x < settings.rows; x++) {
		grid[x] = new Array(4);
	}

	grid[0][0] = pic1;
	grid[0][1] = pic2;
	grid[0][2] = pic3;
	grid[0][3] = pic4;
	grid[1][0] = pic5;
	grid[1][1] = pic6;
	grid[1][2] = pic7;
	grid[1][3] = pic8;
	grid[2][0] = pic9;
	grid[2][1] = pic10;
	grid[2][2] = pic11;
	grid[2][3] = pic12;
	grid[3][0] = pic13;
	grid[3][1] = pic14;
	grid[3][2] = pic15;
	grid[3][3] = pic16;

	for (var x = 0; x < settings.rows; x++) {
		for (var y = 0; y < settings.columns; y++) {
			rotations[x][y] = Math.floor(Math.random() * 3);

			answers[x][y] = -1;
		}
	}

	drawCanvas();
}

function setupAnswer() {

	//testing
	rotations[0][0] = 1;
	rotations[0][1] = 0;
	rotations[0][2] = 3;
	rotations[0][3] = 0;
	rotations[1][0] = 2;
	rotations[1][1] = 0;
	rotations[1][2] = 1;
	rotations[1][3] = 0;
	rotations[2][0] = 2;
	rotations[2][1] = 0;
	rotations[2][2] = 3;
	rotations[2][3] = 0;
	rotations[3][0] = 0;
	rotations[3][1] = 2;
	rotations[3][2] = 0;
	rotations[3][3] = 1;
}

//Draws cubes onto game canvas
function drawCanvas() {
	console.log("redrawn canvas");
	game_context.clearRect(0, 0, 400, 400);

	for (var i = 0; i < settings.rows; i++) {
		for (var j = 0; j < settings.columns; j++) {
			var x = j * settings.width;
			var y = i * settings.height;
			var image = grid[i][j];

			switch (rotations[Math.floor(x / settings.width)][Math.floor(y / settings.height)]) {
				case 0:
					game_context.drawImage(image, x, y);
					break;
				case 1:
					game_context.save(); 
					game_context.translate(x, y); 
					game_context.translate(settings.width/2, settings.height/2); 	
					game_context.rotate(Math.PI/2); 
					game_context.drawImage(image, -settings.width/2, -settings.height/2);
    				game_context.restore(); 
					break;
				case 2:
					game_context.save(); 
					game_context.translate(x, y); 
					game_context.translate(settings.width/2, settings.height/2); 	
					game_context.rotate(Math.PI); 
					game_context.drawImage(image, -settings.width/2, -settings.height/2);
    				game_context.restore(); 
					break;
				case 3:
					game_context.save(); 
					game_context.translate(x, y); 
					game_context.translate(settings.width/2, settings.height/2); 	
					game_context.rotate(3*Math.PI/2); 
					game_context.drawImage(image, -settings.width/2, -settings.height/2);
    				game_context.restore(); 
					break;
				default:
					break;
			}
		}
	}
}

//Initializes and starts the timer
function setupTimer() {
	startTime = Date.now();
	timerID = setInterval("updateTimer()", 1000);
}

//Updates the on screen timer.
function updateTimer() {
	timeLeft = Math.round((30000 - (Date.now() - startTime)) / 1000); // 30 second limit
	game_context.clearRect(470, 22, 200, 100);  // clear timer canvas area before redrawing

	game_context.fillStyle = "rgb(0,0,0)";
	game_context.font = "40px Time New Roman";
	if (timeLeft >= 100) {
		game_context.fillText(timeLeft, 470, 60);
	} else if (timeLeft >= 10) {
		game_context.fillText(timeLeft, 480, 60);
	} else {
		game_context.fillText(timeLeft, 490, 60);
	}

	if(timeLeft <= 0) {
		clearInterval(timerID);
		alert("Time up!");
	}
}