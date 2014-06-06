window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function CardTimer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

CardTimer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function CardAnimation(spriteSheet, frameWidth, frameHeight, frameDuration, loop) {
    this.spriteSheet = CARDASSET_MANAGER.getAsset(spriteSheet);
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.totalTime = (this.spriteSheet.width / this.frameWidth) * this.frameDuration;
    this.elapsedTime = 0;
    this.loop = loop;
}

CardAnimation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy, reverse) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.currentFrame();
    var locX = x - (this.frameWidth / 2) * scaleBy;
    var locY = y - (this.frameHeight / 2) * scaleBy;
    if (reverse) {
        ctx.drawImage(this.spriteSheet, index * this.frameWidth, 0, this.frameWidth, this.frameHeight,
                      locX, locY, this.frameWidth * scaleBy, this.frameHeight * scaleBy);
    } else {
        ctx.drawImage(this.spriteSheet, this.spriteSheet.width - index * this.frameWidth, 0, this.frameWidth, this.frameHeight,
                      locX, locY, this.frameWidth * scaleBy, this.frameHeight * scaleBy);
    }
}

CardAnimation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

CardAnimation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function CardGameEngine() {
    this.timer = new CardTimer();
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

CardGameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new CardTimer();

    cardgame.start();
}

CardGameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

// Global variables
var cardWidth = 70;
var cardHeight = 150;
var count = 0;
var card1;
var card2;
var blanks = 0;

CardGameEngine.prototype.startInput = function () {
    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        this.card = clickedOnCard(x, y);
        if (this.card.result) {
            x = this.card.x;
            y = this.card.y;
        } else {
            x = -1;
            y = -1;
        }

        return { x: x, y: y };
    }

    var clickedOnCard = function (x, y) {
        var result = true;

        if (x < 88 || x > 832 || y < 48 || y > 507) {
            x = -1;
            y = -1;
            result = false;
        } else if (x >= 88 && x < 158) {
            x = 0;
            y = getY(y);
        } else if (x >= 163 && x < 233) {
            x = 1;
            y = getY(y);
        } else if (x >= 238 && x < 308) {
            x = 2;
            y = getY(y);
        } else if (x >= 313 && x < 383) {
            x = 3;
            y = getY(y);
        } else if (x >= 388 && x < 458) {
            x = 4;
            y = getY(y);
        } else if (x >= 461 && x < 533) {
            x = 5;
            y = getY(y);
        } else if (x >= 538 && x < 608) {
            x = 6;
            y = getY(y);
        } else if (x >= 613 && x < 683) {
            x = 7;
            y = getY(y);
        } else if (x >= 688 && x < 758) {
            x = 8;
            y = getY(y);
        } else if (x >= 763 && x < 833) {
            x = 9;
            y = getY(y);
        } else {
            x = -1;
            y = -1;
            result = false;
        }

        return { result: result, x: x, y: y };
    }

    var getY = function (y) {
        if (y >= 48 && y < 198) {
            y = 0;
        } else if (y >= 203 && y < 353) {
            y = 1;
        } else if (y >= 358 && y < 508) {
            y = 2;
        } else {
            y = -1;
        }

        return y;
    }

    var that = this;

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousewheel", function (e) {
        that.wheel = e;
    }, false);
}

CardGameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

CardGameEngine.prototype.draw = function (drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.ctx.restore();

    this.ctx.fillStyle = "#000";
    this.ctx.font = "bold 20px Arial";
    this.ctx.drawImage(CARDASSET_MANAGER.getAsset('./images/time.png'), 327, 20);
    var t = 90 - Math.floor(this.timer.gameTime);
    if (t >= 0) {
        this.ctx.fillText(t + " seconds", 495, 33);
    } else if (cardPuzzleActive) {
        //alert("Out of time");
        var ls = document.getElementById('losingSound');
        ls.volume = 0.6;
        ls.play();
        cardPuzzleActive = false;
        canvas.style.display = "none";
        document.getElementById('gameWorld').style.display = "inline";
        document.getElementById('gameWorld').focus();
        document.getElementById('cardCanvas').style.display = "none";
        document.getElementById('carddivider').style.display = "none";
        document.body.style.background = "url('./wallpaper.png')";
        this.ctx.clearRect(0, 0, 1000, 1000);
        cardgame = new MiniGameEngine();
        cardgame.init(this.ctx);
        this.timer.gameTime = 0;
            isActive = true;
    }
}

// Returns appropriate index to search for card entity, based on the card's x- and y-values
CardGameEngine.prototype.getCardIndex = function (x, y) {
    return x + y * 10;
}

CardGameEngine.prototype.update = function () {
    var e = -1;
    if (this.click) { // If click event occurs...
        e = this.getCardIndex(this.click.x, this.click.y);
        if (this.click.x !== -1 && this.click.y !== -1) { // If a card is clicked...
            // Ensure that the count is 0 - 2 (on 2, compare selected cards)
            if (count < 2) {
                count++;
            } else {
                count = 1;
            }

            if (count === 1) { // On first click, store first selected card
                card1 = this.entities[e];
                if (card1 instanceof Card) {
                    card1.flipOver = true; // Turn first card over
                } else { // If a blank is clicked, do not increment the count
                    count = 0;
                }
            } else if (count === 2) { // On second click, store second selected card
                card2 = this.entities[e];
                if (card2 instanceof Card) {
                    if (card1.x === card2.x && card1.y === card2.y) { // If same card is selected twice, do not increment count
                        count = 1;
                    } else { // Turn second card over
                        card2.flipOver = true;
                        setTimeout(function () {
                            if (card1.getValue() === card2.getValue()) { // Compare cards for match
                                card1.match = true;
                                card2.match = true;
                                blanks += 2;
                            } else { // Turn cards back over
                                card1.turnOver = true;
                                card2.turnOver = true;
                            }
                        }, 550);
                    }
                } else { // If a blank is clicked, do not increment the count
                    count = 1;
                }
            }
        }
    }

    // Iterate over list of entities and remove any with removeFromWorld flag turned on
    var entitiesCount = this.entities.length;
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    // Insert Blanks where Cards are removed
    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1, new Blank(this, this.entities[i].x, this.entities[i].y));
        }
    }

    if (blanks === 30) {
        //alert("You gained an extra life!");
        var ws = document.getElementById('winningSound');
        ws.volume = 0.6;
        ws.play();
        cardPuzzleActive = false;
        isActive = true;
        main_cat.lives += 1;
        blanks = 0;
        canvas.style.display = "none";
        document.getElementById('gameWorld').style.display = "inline";
        document.getElementById('gameWorld').focus();
        document.getElementById('carddivider').style.display = "none";
        document.body.style.background = "url('./wallpaper.png')";
    }
}

CardGameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

Entity.prototype.drawSpriteCentered = function (ctx) {
    if (this.sprite && this.x && this.y) {
        var x = this.x - this.sprite.width / 2;
        var y = this.y - this.sprite.height / 2;
        ctx.drawImage(this.sprite, x, y);
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    return offscreenCanvas;
}

function Card(game, x, y, sprite, value, flipSheet) {
    this.sprite = CARDASSET_MANAGER.getAsset(sprite);
    this.flipAnimation = new CardAnimation(flipSheet, 70, 150, 0.09, false);
    this.turnAnimation = new CardAnimation(flipSheet, 70, 150, 0.09, false);
    this.matchAnimation = new CardAnimation('./images/match.png', 70, 150, 0.08, false);
    this.value = value;
    this.flipOver = false;
    this.turnOver = false;
    this.match = false;
    Entity.call(this, game, x, y);
}

Card.prototype = new Entity();
Card.prototype.constructor = Card;

Card.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Card.prototype.draw = function (ctx) {
    if (this.flipOver) {
        this.sprite = CARDASSET_MANAGER.getAsset('./images/transparent.png');
        this.flipAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1, false);

        if (this.flipAnimation.isDone()) {
            this.flipOver = false;
            this.flipAnimation.elapsedTime = 0;
            this.sprite = CARDASSET_MANAGER.getAsset(this.value);
        }
    } else if (this.turnOver) {
        this.sprite = CARDASSET_MANAGER.getAsset('./images/transparent.png');
        this.turnAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1, true);

        if (this.turnAnimation.isDone()) {
            this.turnOver = false;
            this.turnAnimation.elapsedTime = 0;
            this.sprite = CARDASSET_MANAGER.getAsset('./images/face.png');
        }
    } else if (this.match) {
        sound = document.getElementById("matchSound");
        sound.volume = 0.3;
        sound.play();
        this.sprite = CARDASSET_MANAGER.getAsset('./images/transparent.png');
        this.matchAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1, false);

        if (this.matchAnimation.isDone()) {
            this.removeFromWorld = true;
        }
    }
    this.drawSpriteCentered(ctx);
    Entity.prototype.draw.call(this, ctx);
}

Card.prototype.getValue = function () {
    return this.value;
}

Card.prototype.setFace = function (value) {
    this.sprite = CARDASSET_MANAGER.getAsset(value);
}

function Blank(game, x, y) {
    Entity.call(this, game, x, y);
}

Blank.prototype = new Entity();
Blank.prototype.constructor = Card;

Blank.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Blank.prototype.draw = function (ctx) {
    var canvas = document.getElementById('cardCanvas');
    rect = canvas.getContext("2d");
    rect.fillStyle = "transparent";
    rect.fillRect(this.x, this.y, 70, 150);
}

function MiniGameEngine() {
    CardGameEngine.call(this);
}
MiniGameEngine.prototype = new CardGameEngine();
MiniGameEngine.prototype.constructor = MiniGameEngine;

MiniGameEngine.prototype.start = function () {
    CardGameEngine.prototype.start.call(this);
    for (var i = 0; i < cards.length; i++) {
        this.addEntity(cards[i]);
    }
}

MiniGameEngine.prototype.update = function () {
    CardGameEngine.prototype.update.call(this);
}

MiniGameEngine.prototype.draw = function () {
    CardGameEngine.prototype.draw.call(this, function (game) {
    });
}

var CARDASSET_MANAGER = new AssetManager();

CARDASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('cardCanvas');
    var ctx = canvas.getContext('2d');
    cardgame = new MiniGameEngine();

    var flips = ['./images/dreamflip.png', './images/earthflip.png', './images/eraseflip.png', './images/fireflip.png',
                 './images/flowerflip.png', './images/mirrorflip.png', './images/mistflip.png', './images/sandflip.png',
                 './images/silentflip.png', './images/snowflip.png', './images/songflip.png', './images/throughflip.png',
                 './images/waterflip.png', './images/windflip.png', './images/woodflip.png'];
    for (var i = 0; i < flips.length; i++) {
        CARDASSET_MANAGER.queueDownload(flips[i]);
    }

    var values = ['./images/dream.png', './images/earth.png', './images/erase.png', './images/fire.png', './images/flower.png',
                  './images/mirror.png', './images/mist.png', './images/sand.png', './images/silent.png', './images/snow.png',
                  './images/song.png', './images/through.png', './images/water.png', './images/wind.png', './images/wood.png'];

    for (var i = 0; i < values.length; i++) {
        CARDASSET_MANAGER.queueDownload(values[i]);
    }
    CARDASSET_MANAGER.queueDownload('./images/transparent.png');
    CARDASSET_MANAGER.queueDownload('./images/face.png');
    CARDASSET_MANAGER.queueDownload('./images/match.png');
    CARDASSET_MANAGER.queueDownload('./images/time.png');

    CARDASSET_MANAGER.downloadAll(function () {
        cardValues = new Array(30);
        for (var a = 0; a < cardValues.length; a++) {
            cardValues[a] = 0;
        }

        var counter = new Array(15);
        for (var b = 0; b < counter.length; b++) {
            counter[b] = 0;
        }

        for (var c = 0; c < cardValues.length; c++) {
            var rand = Math.floor(Math.random() * 15);

            if (counter[rand] < 2) {
                cardValues[c] = rand;
                counter[rand]++;
            } else {
                c--;
            }
        }

        cards = new Array(30);
        var n = 0;
        var padding = 123;
        var spacing = 5;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 10; j++) {
                cards[n] = new Card(cardgame, j * (cardWidth + spacing) + padding, i * (cardHeight + spacing) + padding,
                                    './images/face.png', values[cardValues[n]], flips[cardValues[n]]);
                n++;
            }
        }

        canvas.setAttribute('tabindex', '0');
        canvas.focus();

        cardgame.init(ctx);
    });
});