// global variables
var pipe_canvas;
var pipe_context;
var pipetimer_canvas;
var pipetimer_context;
var backgroundChanged = false;
var Spiece = new Image(); Spiece.src = "images/start.gif";//6
var Epiece = new Image(); Epiece.src = "images/end.gif";    //7
var Ipiece1 = new Image(); Ipiece1.src = "images/I1.gif";  //0
var Ipiece2 = new Image(); Ipiece2.src = "images/I2.gif";  //1
var Lpiece1 = new Image(); Lpiece1.src = "images/L1.gif";  //2
var Lpiece2 = new Image(); Lpiece2.src = "images/L2.gif";  //3
var Lpiece3 = new Image(); Lpiece3.src = "images/L3.gif";  //4
var Lpiece4 = new Image(); Lpiece4.src = "images/L4.gif";  //5
var timeImg = new Image(); timeImg.src = "images/time.png";
var piperotations;
var pipeanswers;
var translatedX = 395;
var translatedY = -75;

//Settings class
var pipesettings = {
    rows: 10,
    columns: 10,
    width: 60,
    height: 60
};

//Mouse even listener
window.onclick = function (e) {
    mouse_x = e.pageX;
    mouse_y = e.pageY;
    switch (rand) {
        case 0:
            if (mouse_x > 0 && mouse_y > 0 && mouse_x < 400 && mouse_y < 400 && Math.floor(mouse_x / settings.width) < settings.columns
            && Math.floor(mouse_y / settings.height) < settings.height) {
            console.log("CLICK");
            clickedX = Math.floor(mouse_x/settings.width);
            clickedY = Math.floor(mouse_y/settings.height);

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
            console.log(clickedX + ", " + clickedY + " rotation = " + rotations[clickedX][clickedY]);
            }
            
            drawCanvas();
            if (checkAnswer()) {
                endGame();
            }
            /**if (mouse_x > 0 && mouse_y > 0 && mouse_x < 600 && mouse_y < 600 && Math.floor(mouse_x / settings.width) < settings.columns
                && Math.floor(mouse_y / settings.height) < settings.height) {
                clickedX = Math.floor(mouse_x / settings.width);
                clickedY = Math.floor(mouse_y / settings.height);

                switch (rotations[clickedX][clickedY]) {
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
                //console.log(clickedX + ", " + clickedY + " rotation = " + rotations[clickedX][clickedY]);
            }
            //drawCanvas(); ??????????
            if (checkAnswer()) {
                endGame();
            }**/

            break;
        case 1:
            mouse_x = e.pageX - translatedX;
            mouse_y = e.pageY - translatedY;

            if (Math.floor(mouse_x / pipesettings.width) < pipesettings.columns
                && Math.floor(mouse_y / pipesettings.height) < pipesettings.height) {
                clickedX = Math.floor(mouse_x / pipesettings.width);
                clickedY = Math.floor(mouse_y / pipesettings.height);

                switch (piperotations[clickedX][clickedY]) {
                    case 0:
                        piperotations[clickedX][clickedY] = 1;
                        break;
                    case 1:
                        piperotations[clickedX][clickedY] = 0;
                        break;
                    case 2:
                        piperotations[clickedX][clickedY] = 3;
                        break;
                    case 3:
                        piperotations[clickedX][clickedY] = 4;
                        break;
                    case 4:
                        piperotations[clickedX][clickedY] = 5;
                        break;
                    case 5:
                        piperotations[clickedX][clickedY] = 2;
                        break;
                    default:
                        break;
                }

                //console.log(clickedX + ", " + clickedY + " rotation = " + piperotations[clickedX][clickedY]);
                //console.log(clickedX + ", " + clickedY + " answer = " + pipeanswers[clickedX][clickedY]);
            }

            pipedrawCanvas();
            if (pipecheckAnswer()) {
                pipeendGame();
            }
            break;
    }
}

function pipecheckAnswer() {
    for (var x = 0; x < pipesettings.rows; x++) {
        for (var y = 0; y < pipesettings.columns; y++) {
            if (piperotations[x][y] === pipeanswers[x][y]) {
                //console.log("true")
            } else {
                //console.log("false");
                return false;
            }
        }
    }
    return true;
}

//ends the game and stops timemr
function pipeendGame() {
    var ws = document.getElementById('winningSound');
    ws.volume = 0.6;
    ws.play();
    //alert("You gained an extra life!");
    clearTimeout(pipetimerID);
    pipetimerID = 0;
    pipe_canvas.style.display = "none";
    pipetimer_canvas.style.display = "none";
    pipedivider.style.display = "none";
    document.getElementById('gameWorld').style.display = 'inline';
    document.getElementById('gameWorld').focus();
    pipePuzzleActive = false;
    document.body.style.background = "url('./wallpaper.png')";
    backgroundChanged = false;
    isActive = true;
    main_cat.lives += 1;
    pipeinit();
}



function pipeinit() {
    pipeanswers = new Array(10);
    piperotations = new Array(10);
    for (var x = 0; x < pipesettings.rows; x++) {
        piperotations[x] = new Array(10);
        pipeanswers[x] = new Array(10);
    }

    for (var x = 0; x < pipesettings.rows; x++) {
        for (var y = 0; y < pipesettings.columns; y++) {
            if (x === 0 && y === 9) {
                piperotations[x][y] = 6;
            } else if (x === 9 && y === 9) {
                piperotations[x][y] = 7;
            } else {
                piperotations[x][y] = -1;
            }

            pipeanswers[x][y] = -1;
        }
    }

    pipesetupAnswer(Math.floor(Math.random() * 3));
    //pipesetupAnswer(2);
    pipedrawCanvas();
}

function pipesetupAnswer(key) {
    switch (key) {
        case 0:
            //answers
            pipeanswers[0][9] = 6; //start
            pipeanswers[9][9] = 7; //end
            pipeanswers[0][6] = 3;
            pipeanswers[0][5] = 4;
            pipeanswers[1][5] = 1;
            pipeanswers[1][6] = 1;
            pipeanswers[1][9] = 1;
            pipeanswers[2][5] = 1;
            pipeanswers[2][6] = 5;
            pipeanswers[2][7] = 0;
            pipeanswers[2][8] = 0;
            pipeanswers[2][9] = 2;
            pipeanswers[3][5] = 1;
            pipeanswers[4][5] = 1;
            pipeanswers[5][5] = 5;
            pipeanswers[5][6] = 0;
            pipeanswers[5][7] = 0;
            pipeanswers[5][8] = 3;
            pipeanswers[6][8] = 1;
            pipeanswers[7][8] = 1;
            pipeanswers[8][8] = 5;
            pipeanswers[8][9] = 3;
            //rotations
            piperotations[0][9] = 6; //start
            piperotations[9][9] = 7; //end
            piperotations[0][6] = 4;
            piperotations[0][5] = 2;
            piperotations[1][5] = 0;
            piperotations[1][6] = 1;
            piperotations[1][9] = 0;
            piperotations[2][5] = 0;
            piperotations[2][6] = 3;
            piperotations[2][7] = 0;
            piperotations[2][8] = 1;
            piperotations[2][9] = 5;
            piperotations[3][5] = 1;
            piperotations[4][5] = 0;
            piperotations[5][5] = 3;
            piperotations[5][6] = 0;
            piperotations[5][7] = 1;
            piperotations[5][8] = 4;
            piperotations[6][8] = 0;
            piperotations[7][8] = 1;
            piperotations[8][8] = 3;
            piperotations[8][9] = 2;
            break;

        case 1:
            pipeanswers[0][9] = 6;
            pipeanswers[9][9] = 7;
            pipeanswers[0][8] = 3;
            pipeanswers[0][7] = 0;
            pipeanswers[0][6] = 0;
            pipeanswers[0][5] = 4;
            pipeanswers[1][9] = 2;
            pipeanswers[1][8] = 5;
            pipeanswers[1][5] = 2;
            pipeanswers[1][4] = 4;
            pipeanswers[2][7] = 3;
            pipeanswers[2][6] = 4;
            pipeanswers[2][4] = 2;
            pipeanswers[2][3] = 4;
            pipeanswers[3][9] = 3;
            pipeanswers[3][8] = 0;
            pipeanswers[3][7] = 5;
            pipeanswers[3][6] = 2;
            pipeanswers[3][5] = 0;
            pipeanswers[3][4] = 0;
            pipeanswers[3][3] = 5;
            pipeanswers[4][9] = 1;
            pipeanswers[5][9] = 1;
            pipeanswers[6][9] = 1;
            pipeanswers[7][9] = 1;
            pipeanswers[8][9] = 1;

            piperotations[0][9] = 6;
            piperotations[9][9] = 7;
            piperotations[0][8] = 2;
            piperotations[0][7] = 1;
            piperotations[0][6] = 1;
            piperotations[0][5] = 5;
            piperotations[1][9] = 4;
            piperotations[1][8] = 2;
            piperotations[1][5] = 3;
            piperotations[1][4] = 5;
            piperotations[2][7] = 2;
            piperotations[2][6] = 2;
            piperotations[2][4] = 3;
            piperotations[2][3] = 5;
            piperotations[3][9] = 2;
            piperotations[3][8] = 1;
            piperotations[3][7] = 5;
            piperotations[3][6] = 3;
            piperotations[3][5] = 1;
            piperotations[3][4] = 1;
            piperotations[3][3] = 4;
            piperotations[4][9] = 0;
            piperotations[5][9] = 0;
            piperotations[6][9] = 0;
            piperotations[7][9] = 0;
            piperotations[8][9] = 0;
            break;

        case 2:
            pipeanswers[0][9] = 6;
            pipeanswers[9][9] = 7;
            pipeanswers[1][9] = 1;
            pipeanswers[2][9] = 2;
            pipeanswers[2][8] = 0;
            pipeanswers[2][7] = 4;
            pipeanswers[3][7] = 2;
            pipeanswers[3][6] = 4;
            pipeanswers[4][6] = 1;
            pipeanswers[5][6] = 2;
            pipeanswers[5][5] = 0;
            pipeanswers[5][4] = 4;
            pipeanswers[6][7] = 3;
            pipeanswers[6][6] = 0;
            pipeanswers[6][5] = 4;
            pipeanswers[6][4] = 1;
            pipeanswers[7][9] = 3;
            pipeanswers[7][8] = 4;
            pipeanswers[7][7] = 1;
            pipeanswers[7][5] = 2;
            pipeanswers[7][4] = 5;
            pipeanswers[8][9] = 1;
            pipeanswers[8][8] = 2;
            pipeanswers[8][7] = 5;

            piperotations[0][9] = 6;
            piperotations[9][9] = 7;
            piperotations[1][9] = 0;
            piperotations[2][9] = 4;
            piperotations[2][8] = 1;
            piperotations[2][7] = 5;
            piperotations[3][7] = 3;
            piperotations[3][6] = 2;
            piperotations[4][6] = 0;
            piperotations[5][6] = 3;
            piperotations[5][5] = 1;
            piperotations[5][4] = 5;
            piperotations[6][7] = 2;
            piperotations[6][6] = 1;
            piperotations[6][5] = 5;
            piperotations[6][4] = 0;
            piperotations[7][9] = 4;
            piperotations[7][8] = 4;
            piperotations[7][7] = 0;
            piperotations[7][5] = 4;
            piperotations[7][4] = 3;
            piperotations[8][9] = 0;
            piperotations[8][8] = 4;
            piperotations[8][7] = 4;
            break;
        default:
            break;
    }

}

//Draws cubes onto game canvas
function pipedrawCanvas() {
    //console.log("redrawn canvas");
    pipe_context.clearRect(0 + translatedX, 0 + translatedY, 600, 600);

    for (var i = 0; i < pipesettings.rows; i++) {
        for (var j = 0; j < pipesettings.columns; j++) {
            var x = j * pipesettings.width;
            var y = i * pipesettings.height;

            switch (piperotations[Math.floor(x / pipesettings.width)][Math.floor(y / pipesettings.height)]) {
                case 0:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Ipiece1, x + translatedX, y + translatedY);
                    break;
                case 1:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Ipiece2, x + translatedX, y + translatedY);
                    break;
                case 2:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Lpiece1, x + translatedX, y + translatedY);
                    break;
                case 3:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Lpiece2, x + translatedX, y + translatedY);
                    break;
                case 4:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Lpiece3, x + translatedX, y + translatedY);
                    break;
                case 5:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Lpiece4, x + translatedX, y + translatedY);
                    break;
                case 6:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Spiece, x + translatedX, y + translatedY);
                    break;
                case 7:
                    pipe_context.clearRect(x + translatedX, y + translatedY, 60, 60);
                    pipe_context.drawImage(Epiece, x + translatedX, y + translatedY);
                    break;
                default:
                    break;
            }
        }
    }
}

//Initializes and starts the timer
function pipesetupTimer() {
    pipetimer_context.drawImage(timeImg, 522, 25);
    pipestartTime = Date.now();
    pipetimerID = setInterval("pipeupdateTimer()", 1000);
}

//Updates the on screen timer.
function pipeupdateTimer() {
    if (pipePuzzleActive) {
        if (!backgroundChanged) {
            document.body.style.background = "url('./pipebg.gif')";
            backgroundChanged = true;
        }
        pipetimeLeft = Math.round((30000 - (Date.now() - pipestartTime)) / 1000); // 30 second limit
        pipetimer_context.clearRect(0 + translatedX, 0 + translatedY, 200, 100);  // clear timer canvas area before redrawing

        pipetimer_context.fillStyle = "#000";
        pipetimer_context.font = "bold 20px Arial";

        if (pipetimeLeft >= 100) {
            pipetimer_context.clearRect(690, 0, 1000, 100);
            pipetimer_context.fillText(pipetimeLeft + " seconds", 690, 38);
        } else if (pipetimeLeft >= 10) {
            pipetimer_context.clearRect(690, 0, 1000, 100);
            pipetimer_context.fillText(pipetimeLeft + " seconds", 690, 38);
        } else {
            pipetimer_context.clearRect(690, 0, 1000, 100);
            pipetimer_context.fillText(pipetimeLeft + " seconds", 690, 38);
        }

        if (pipetimeLeft <= 0) {
            clearInterval(pipetimerID);
            var ls = document.getElementById('losingSound');
            ls.volume = 0.6;
            ls.play();
            //alert("Out of time");
            document.body.style.background = "url('./wallpaper.png')";
            backgroundChanged = false;
            pipe_canvas.style.display = "none";
            pipetimer_canvas.style.display = "none";
            pipedivider.style.display = "none";
            document.getElementById('gameWorld').style.display = 'inline';
            document.getElementById('gameWorld').focus();
            pipePuzzleActive = false;
            isActive = true;
            sound = document.getElementById("clickSound");
            sound.volume = 0.5;
            sound.play();
            pipeinit();
        }
    }
}