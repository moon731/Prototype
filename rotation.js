// global variables
var main_canvas;
var game_canvas;
var game_context;
var timer_canvas;
var timer_context;
var pic1 = new Image(); pic1.src =  "images/cat2a.png";
var pic2 = new Image(); pic2.src ="images/cat2b.png";
var pic3 = new Image(); pic3.src = "images/cat2c.png";
var pic4 = new Image(); pic4.src = "images/cat2d.png";
var pic5 = new Image(); pic5.src = "images/cat2e.png";
var pic6 = new Image(); pic6.src = "images/cat2f.png";
var pic7 = new Image(); pic7.src = "images/cat2g.png";
var pic8 = new Image(); pic8.src = "images/cat2h.png";
var pic9 = new Image(); pic9.src =  "images/cat2i.png";
var pic10 = new Image(); pic10.src ="images/cat2j.png";
var pic11 = new Image(); pic11.src = "images/cat2k.png";
var pic12 = new Image(); pic12.src = "images/cat2l.png";
var pic13 = new Image(); pic13.src = "images/cat2m.png";
var pic14 = new Image(); pic14.src = "images/cat2n.png";
var pic15 = new Image(); pic15.src = "images/cat2o.png";
var pic16 = new Image(); pic16.src = "images/cat2p.png";
var grid = new Array(4);
var mouse_x;
var mouse_y;
var clickedX;
var clickedY;
var rotations;
var answers;
var backgroundChanged = false;
var img = new Image(); img.src = "images/time.png";

//Settings class
var settings = {
	rows: 4,
	columns: 4,
	width: 100,
	height: 100
};

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
    var ws = document.getElementById('winningSound');
    ws.volume = 0.6;
    ws.play();
    //alert("You gained an extra life!");
	clearTimeout(timerID);
	timerID = 0;
	game_canvas.style.display = "none";
	timer_canvas.style.display = "none";
	document.getElementById('gameWorld').style.display = 'inline';
	document.getElementById('gameWorld').focus();
	document.body.style.background = "url('./wallpaper.png')";
	backgroundChanged = false;
	rotationPuzzleActive = false;
	main_cat.lives += 1;
	isActive = true;

	init();
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

	setupAnswer();
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
	timeLeft = 30000;
}

//Updates the on screen timer.
function updateTimer() {
    if (rotationPuzzleActive) {
        if (!backgroundChanged) {
            document.body.style.background = "url('./rotbg.gif')";
            backgroundChanged = true;
        }
		timeLeft = Math.round((30000 - (Date.now() - startTime)) / 1000); // 30 second limit
		timer_context.clearRect(0, 0, 1000, 100);  // clear timer canvas area before redrawing
		timer_context.drawImage(img, 0, 7);
        timer_context.fillStyle = "#000";
        timer_context.font = "bold 20px Arial";
		if (timeLeft >= 100) {
		    timer_context.clearRect(450, 0, 1000, 100);
		    timer_context.fillText(timeLeft + " seconds", 168, 20);
		} else if (timeLeft >= 10) {
			timer_context.fillText(timeLeft + " seconds", 168, 20);
		} else {
			timer_context.fillText(timeLeft + " seconds", 168, 20);
		}

		if (timeLeft <= 0) {
		    var ls = document.getElementById('losingSound');
		    ls.volume = 0.6;
		    ls.play();
			//alert("Out of time");
			clearTimeout(timerID);
			timerID = 0;
			game_canvas.style.display = "none";
			timer_canvas.style.display = "none";
			document.getElementById('gameWorld').style.display = 'inline';
			document.getElementById('gameWorld').focus();
			document.body.style.background = "url('./wallpaper.png')";
			backgroundChanged = false;
			rotationPuzzleActive = false;
			isActive = true;
		}
	} else {

	}
}