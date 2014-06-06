
var canvas;
var kitty;
var context;

var currentFrame = 0;

var currRectX = 0;
var currRectY = 0;

var catImg = new Image();
catImg.src = "./kitty1.png";

var mazeWidth = 0;
var mazeHeight = 0;

var rand = 0;

var intervalVar;

function drawMazeAndKitty(rectX, rectY) {

    var mazeImg = new Image();

    mazeImg.onload = function () {
        context.drawImage(mazeImg, 0, 0);

        drawKittyImage(currRectX, currRectY, null);
        context.beginPath();

        switch (rand) {
            case 0:
                context.arc(618, 139, 7, 0, 2 * Math.PI, false);
                break;
            case 1:
                context.arc(587, 640, 7, 0, 2 * Math.PI, false);
                break;
            case 2:
                context.arc(645, 186, 7, 0, 2 * Math.PI, false);
                break;
            case 3:
                context.arc(645, 386, 7, 0, 2 * Math.PI, false);
                break;
            case 4:
                context.arc(537, 645, 7, 0, 2 * Math.PI, false);
                break;

        }
        context.closePath();
        context.fillStyle = '#FF66CC';
        context.fill();

    };

    rand = Math.floor(Math.random() * 5);
    console.log(rand);

    switch (rand) {
        case 0: //mazecanvas.png
            currRectX = 477;
            currRectY = 3;

            mazeWidth = 626;
            mazeHeight = 626;

            mazeImg.src = "mazecanvas.png";

            break;
        case 1: //MazeCanvas2.gif
            currRectX = 640;
            currRectY = 405;

            mazeWidth = 673;
            mazeHeight = 673;

            mazeImg.src = "MazeCanvas2.gif";

            break;
        case 2: //MazeCanvas3.gif
            currRectX = 20;
            currRectY = 279;

            mazeWidth = 673;
            mazeHeight = 673;

            mazeImg.src = "MazeCanvas3.gif";

            break;
        case 3: //MazeCanvas4.gif
            currRectX = 645;
            currRectY = 54;

            mazeWidth = 673;
            mazeHeight = 673;

            mazeImg.src = "MazeCanvas4.gif";

            break;
        case 4: //MazeCanvas5
            currRectX = 429;
            currRectY = 20;

            mazeWidth = 673;
            mazeHeight = 673;

            mazeImg.src = "MazeCanvas5.gif";

            break;
    }

    /**currRectX = 429;
	currRectY = 20;
	mazeWidth = 673;
	mazeHeight = 673;
    mazeImg.src = "MazeCanvas5.gif";
    **/

}
function drawKittyImage(x, y, style) {
    //makeTail(currRectX, currRectY, 15, 15);

    currRectX = x;
    currRectY = y;
    context.beginPath();

    if (currentFrame < 2) {
        currentFrame++;
    } else {
        currentFrame = 0;
    }

    var index = currentFrame;
    var locX = x - (14 / 2);
    var locY = y - (14 / 2);
    switch (rand) {
        case 0:
            context.arc(618, 139, 7, 0, 2 * Math.PI, false);
            break;
        case 1:
            context.arc(587, 640, 7, 0, 2 * Math.PI, false);
            break;
        case 2:
            context.arc(645, 186, 7, 0, 2 * Math.PI, false);
            break;
        case 3:
            context.arc(645, 386, 7, 0, 2 * Math.PI, false);
            break;
        case 4:
            context.arc(537, 645, 7, 0, 2 * Math.PI, false);
            break;

    }
    context.closePath();
    context.fillStyle = '#FF66CC';
    context.fill();
    /**context.drawImage(catImg,
                  index * 14, 0,
                  14, 27,
                  locX, locY,
                  14, 27);**/

    makeTail(currRectX, currRectY, 15, 15);

    context.drawImage(catImg, x, y);
    context.closePath();




}



function makeTail(x, y, w, h) {
    context.beginPath();
    context.rect(x, y, w, h);
    context.closePath();
    context.fillStyle = "#B2FFFF";
    context.fill();
}

function clearScreen(x, y, w, h) {
    context.beginPath();
    context.rect(x, y, w, h);
    context.closePath();
    context.fillStyle = "white";
    context.fill();
}

function moveKitty(e) {

    var newX;
    var newY;
    var canMove;
    e = e || window.event;

    switch (e.keyCode) {

        case 38:   // arrow up key

            newX = currRectX;
            newY = currRectY - 5;
            break;

        case 37: // arrow left key

            newX = currRectX - 5;
            newY = currRectY;
            break;

        case 40: // arrow down key

            newX = currRectX;
            newY = currRectY + 5;
            break;

        case 39: // arrow right key
            newX = currRectX + 5;
            newY = currRectY;
            break;
        default:
            newX = -322667;
            newY = -322667;
            break;
    }
    if (newX != -322667) {
        movingAllowed = canMoveTo(newX, newY);

        if (movingAllowed === 1) {      // 1 means the rectangle can move
            drawKittyImage(newX, newY, "#0000FF");
            currRectX = newX;
            currRectY = newY;
        }
        else if (movingAllowed === 2) { // 2 means the rectangle reached the end point
            clearInterval(intervalVar);
            clearScreen(0, 0, canvas.width, canvas.height);
            context.font = "40px Arial";
            context.fillStyle = "#FF99CC";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("You earned a new life!!!", canvas.width / 2, canvas.height / 2);
            window.removeEventListener("keydown", moveKitty, true);
            document.getElementById('MazeCanvas').style.display = "none";
            document.getElementById('gameWorld').style.display = 'inline';
            document.getElementById('gameWorld').focus();
            mazePuzzleActive = false;
            isActive = true;
            mazeInit();
        }
    }
}

function canMoveTo(destX, destY) {

    var imgData = context.getImageData(destX, destY, 15, 15);
    var data = imgData.data;
    var canMove = 1; // 1 means: the rectangle can move
    if (destX >= 0 && destX <= mazeWidth - 15 && destY >= 0 && destY <= mazeHeight - 15) { // check whether the rectangle would move inside the bounds of the canvas
        for (var i = 0; i < 4 * 15 * 15; i += 4) { // look at all pixels
            if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) { // if you're at an edge , it 
                canMove = 0;											//will be black and you cannot move.
                break;
            }
            else if (data[i] === 255 && data[i + 1] === 102 && data[i + 2] === 204) { // PINK: #FF66CC
                canMove = 2; // the end point is reached
                break;
            }
        }
    } else {
        canMove = 0;
    }
    return canMove;
}


function mazeInit() {
    window.addEventListener("keydown", moveKitty, true);
    drawMazeAndKitty(477, 3);
}

//Runs when the window loads
//window.onload = function () {
function load() {
    //Load game_canvas and game_context
    game_canvas = document.getElementById("miniGame");
    game_context = game_canvas.getContext("2d");
    console.log("Game canvas loaded!");

    //Load timer canvas and context
    timer_canvas = document.getElementById("miniGameTimer");
    timer_context = timer_canvas.getContext("2d");
    setupTimer();
    updateTimer();

    init();

    pipe_canvas = document.getElementById("pipeminiGame");
    pipe_context = pipe_canvas.getContext("2d");
    console.log("Pipe canvas loaded!");

    //Load timer canvas and context
    pipetimer_canvas = document.getElementById("pipeminiGameTimer");
    pipetimer_context = pipetimer_canvas.getContext("2d");
    pipesetupTimer();
    pipeupdateTimer();

    pipeinit();

    canvas = document.getElementById("MazeCanvas");
    context = canvas.getContext("2d");
    kitty = new Image();
    kitty.src = "kitty1.png"


    mazeInit();

}