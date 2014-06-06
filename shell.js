var garbage = 6;
var garbage_speed = 200;
var food_scale = 1;
var isActive = true;

var rotationPuzzleActive = false;
var pipePuzzleActive = false;
var mazePuzzleActive = false;
var cardPuzzleActive = false;

var timerID = 0;
var startTime;
var timeLeft = 0;

var pipetimerID = 0;
var pipestartTime;
var pipetimeLeft = 0;
var rand = 0;
var vortexCollision = false;

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

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function (callback) {
    if (this.downloadQueue.length === 0) window.setTimeout(callback, 100);
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function () {
            that.successCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.addEventListener("error", function () {
            that.errorCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function (path) {
    return this.cache[path];
}

function Animation(spriteSheet, frameWidth, frameHeight, frameDuration, loop) {
    this.spriteSheet = ASSET_MANAGER.getAsset(spriteSheet);
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.totalTime = (this.spriteSheet.width / this.frameWidth) * this.frameDuration;
    this.elapsedTime = 0;
    this.loop = loop;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
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
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth, 0,
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    if (isActive) {
        return gameDelta;
    } else {
        return 0;
    }
}

function GameEngine() {
    this.timer = new Timer();
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    song = document.getElementById("mainMusic");
    song.volume = 0.4;
    song.play();
}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
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

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

GameEngine.prototype.draw = function (drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;

    if (song.ended) {
        song.play();
    }
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
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}

function GameBoard(game) {
    Entity.call(this, game);
    this.x = 0;
    this.y = 450;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.img0 = new Animation('./rain.png', 400, 250, 0.2, true);
    this.img1 = new Animation('./paris.png', 400, 250, 0.2, true);
    this.img2 = new Animation('./fireworks.png', 400, 250, 0.2, true);
    this.img3 = new Animation('./snow.png', 400, 250, 0.2, true);
    this.img4 = new Animation('./christmas.png', 400, 250, 0.2, true);
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.update = function () {
    Entity.prototype.update.call(this);
}

GameBoard.prototype.draw = function (ctx) {
    var canvas = document.getElementById('gameWorld');
    rect = canvas.getContext("2d");
    this.img0.drawFrame(this.game.clockTick, ctx, 400 + this.vx, 250, 2);
    this.img1.drawFrame(this.game.clockTick, ctx, 1200 +(this.vx), 250, 2);
    this.img2.drawFrame(this.game.clockTick, ctx, 2000 +(this.vx), 250, 2);
    this.img3.drawFrame(this.game.clockTick, ctx, 2800 +(this.vz), 250, 2);
    this.img4.drawFrame(this.game.clockTick, ctx, 3600 +(this.vy), 250, 2);

    //ctx.drawImage(this.bg, this.vx, 0);
    //ctx.drawImage(this.bg, this.bg.width - Math.abs(this.vx), 0);

    if (Math.abs(this.vx) > 3000) {
        this.vx = 990;
    }

    if (Math.abs(this.vy) > 4000) {
        this.vy = -10;
    }

    if (Math.abs(this.vz) > 3600) {
        this.vz = 390;
    }
        this.vy -= 1;
        this.vx -= 1;
        this.vz -= 1;
    


    /*rect.fillStyle = "#947E6B";
    rect.fillRect(this.x, this.y, 1000, 100);*/

    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Arial";
    ctx.drawImage(ASSET_MANAGER.getAsset('./lives.png'), 10, 10);
    ctx.drawImage(ASSET_MANAGER.getAsset('./score.png'), 10, 28);
    ctx.fillText(main_cat.lives, 80, 24);
    ctx.fillText(main_cat.score, 85, 42);
}

function Cat(game, x, y, sprite) {
    Entity.call(this, game);
    this.x = x;
    this.y = y;
    this.sprite = ASSET_MANAGER.getAsset(sprite);
    this.radius = 50;
}
Cat.prototype = new Entity();
Cat.prototype.constructor = Cat;

this.descend = false;

Cat.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Cat.prototype.draw = function (ctx) {
    this.drawSpriteCentered(ctx);

    Entity.prototype.draw.call(this, ctx);
}

function RollingCat(game, x, y, spriteSheet) {
    Entity.call(this, game, x, y);
    this.spriteSheet = spriteSheet;
    this.animation = new Animation(spriteSheet, 205, 108, 0.2, true);
    this.radius = 50;
    this.jump = false;
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
    this.lives = 9;
    this.score = 0;
    this.scale = 0.7;
    this.angle = 0;
    this.count = 0;
}
RollingCat.prototype = new Entity();
RollingCat.prototype.constructor = RollingCat;

RollingCat.prototype.update = function () {
    if (this.count % 10 === 0 && this.count / 10 <= 5) {
        var index = this.count / 10;
        this.animation.spriteSheet = ASSET_MANAGER.getAsset(cats[index]);
        this.animation.frameWidth = this.animation.spriteSheet.width / 2;
        this.animation.frameHeight = this.animation.spriteSheet.height;
    }

    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
    Entity.prototype.update.call(this);
    if (this.animation.isDone()) {
        this.removeFromWorld = true;
    }

    if (this.jump) {
        if (this.y > 125) {
            this.y -= 5;
        } else {
            this.jump = false;
        }
    } else {
        if (this.y < 430) {
            this.y += 5;
        }
    }
}

RollingCat.prototype.draw = function (ctx) {
    if (this.jump || this.y < 430) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(degreeToRadian(this.angle));
        ctx.translate(-this.animation.frameWidth / 16, -this.animation.frameHeight / 16);
        this.animation.drawFrame(this.game.clockTick, ctx, 0, 0, this.scale);
        ctx.restore();
        this.angle += 8;
    } else if (this.y >= 430) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    Entity.prototype.draw.call(this, ctx);
}

function degreeToRadian(d) {
    // Converts degrees to radians
    return d * 0.0174532925199432957;
}

function Vortex(game, radial_distance, angle) {
    Entity.call(this, game);
    this.radial_distance = radial_distance;
    this.angle = 0;
    this.speed = 100;
    this.sprite = ASSET_MANAGER.getAsset('./vortex.png');
    this.radius = 40;
    this.setCoords();
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
}
Vortex.prototype = new Entity();
Vortex.prototype.constructor = Vortex;

Vortex.prototype.setCoords = function () {

    this.x = this.radial_distance;
    this.y = 150;
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
}

Vortex.prototype.update = function () {
    this.setCoords();
    this.radial_distance -= this.speed * this.game.clockTick;

    distX = main_cat.centerx - this.centerx;
    distY = main_cat.centery - this.centery;

    dist = Math.sqrt((distX * distX) + (distY * distY));
    sum = this.radius + main_cat.radius;

    if (dist <= sum && vortexCollision === false) {
        //Here is where vortex collision will happen
        vortexCollision = true;
        this.removeFromWorld = true;
        isActive = false;
        rand = Math.floor(Math.random() * 3);

        if (played) {
            rand = Math.floor(Math.random() * 2);
        }

        if (rand === 2) {
            played = true;
        }

        console.log(rand);
        switch (rand) {
            case 0: //rotation puzzle
                rotationPuzzleActive = true;
                startTime = Date.now();

                timerID = setInterval("updateTimer()", 1000);
                timeLeft = 30000;
                updateTimer();

                document.getElementById('miniGame').style.display = 'inline';
                document.getElementById('miniGame').focus();
                document.getElementById('miniGameTimer').style.display = 'inline';
                document.getElementById('gameWorld').style.display = 'none';

                break;
            case 1: //pipe puzzle
                pipePuzzleActive = true;
                pipestartTime = Date.now();

                pipetimerID = setInterval("pipeupdateTimer()", 1000);
                pipetimeLeft = 30000;
                pipeupdateTimer();

                document.getElementById('pipeminiGame').style.display = 'inline';
                document.getElementById('pipeminiGameTimer').style.display = 'inline';
                document.getElementById('pipedivider').style.display = 'inline';
                document.getElementById('pipeminiGame').focus();
                document.getElementById('gameWorld').style.display = 'none';

                break;
            case 2:
                cardPuzzleActive = true;
                //cardInit();
                document.getElementById('cardCanvas').style.display = 'inline';
                document.getElementById('cardCanvas').focus();
                document.getElementById('carddivider').style.display = 'inline';
                document.body.style.background = "url('./cardbg.png')";
                document.getElementById('gameWorld').style.display = 'none';
                this.game.ctx.clearRect(0, 0, 1000, 1000);
                break;
        }
        vortexCollision = false;
    }
    Entity.prototype.update.call(this);
}

Vortex.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(degreeToRadian(this.angle));
    ctx.translate(-this.sprite.width * 0.5, -this.sprite.height * 0.5);
    ctx.drawImage(this.sprite, 0, 0);
    ctx.restore();
    this.angle += 2;

    Entity.prototype.draw.call(this, ctx);
}

function Food(game, sprite, radial_distance, angle) {
    Entity.call(this, game);
    this.radial_distance = radial_distance;
    this.angle = 0;
    this.speed = 100;
    this.sprite = ASSET_MANAGER.getAsset(sprite);
    this.radius = 25;
    var rand = Math.floor((Math.random() * 3));
    if (rand === 0) {
        this.y = 425;
    } else if (rand === 1) {
        this.y = 275;
    } else {
        this.y = 125;
    }
    this.setCoords();
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
}
Food.prototype = new Entity();
Food.prototype.constructor = Food;

Food.prototype.setCoords = function () {
    this.x = this.radial_distance * Math.cos(this.angle);
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
}

Food.prototype.update = function () {
    this.setCoords();
    this.radial_distance -= this.speed * this.game.clockTick;

    distX = main_cat.centerx - this.centerx;
    distY = main_cat.centery - this.centery;

    dist = Math.sqrt((distX * distX) + (distY * distY));
    sum = this.radius + main_cat.radius;

    if (dist <= sum) {

        if (food_scale > 0.5) {
            main_cat.scale -= 0.001;
            food_scale -= 0.005;
        }

        main_cat.count++;
        main_cat.score += 100;
        if (main_cat.score % 200 === 0 && garbage > 1) {
            garbage--;
        }
        this.removeFromWorld = true;
    }

    Entity.prototype.update.call(this);
}

Food.prototype.draw = function (ctx) {
    var x = this.x - this.sprite.width / 2;
    var y = this.y - this.sprite.height / 2;
    ctx.drawImage(this.sprite, x, y, this.sprite.width * food_scale, this.sprite.height * food_scale);

    Entity.prototype.draw.call(this, ctx);
}

function Garbage(game, sprite, radial_distance, angle) {
    Entity.call(this, game);
    this.radial_distance = radial_distance;
    this.angle = 0;
    this.speed = garbage_speed;
    this.sprite = ASSET_MANAGER.getAsset(sprite);
    this.radius = 100 / 2;
    var rand = Math.floor((Math.random() * 3));
    if (rand === 0) {
        this.y = 425;
    } else if (rand === 1) {
        this.y = 275;
    } else {
        this.y = 125;
    }
    this.setCoords();
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
}
Garbage.prototype = new Entity();
Garbage.prototype.constructor = Garbage;

Garbage.prototype.setCoords = function () {
    this.x = this.radial_distance;
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
}

Garbage.prototype.update = function () {
    this.setCoords();
    this.radial_distance -= this.speed * this.game.clockTick;

    distX = main_cat.centerx - this.centerx;
    distY = main_cat.centery - this.centery;

    dist = Math.sqrt((distX * distX) + (distY * distY));
    sum = this.radius + main_cat.radius;


    if (dist <= sum) {
        this.removeFromWorld = true;
       main_cat.lives--;
       if (main_cat.lives === 0) {
           song = document.getElementById("mainMusic");
           song.volume = 0;
           alert("GAME OVER");
            document.getElementById('gameWorld').style.display = 'none';
            isActive = false;
        }
    }
    Entity.prototype.update.call(this);
}

Food.prototype.hitCat = function () {
    return this.x < 525;
}

Garbage.prototype.draw = function (ctx) {
    var x = this.x - this.sprite.width / 2;
    var y = this.y - this.sprite.height / 2;
    ctx.drawImage(this.sprite, x, y, this.sprite.width * food_scale, this.sprite.height * food_scale);

    Entity.prototype.draw.call(this, ctx);
}

function CatEngine() {
    GameEngine.call(this);
}
CatEngine.prototype = new GameEngine();
CatEngine.prototype.constructor = CatEngine;

CatEngine.prototype.start = function () {
    GameEngine.prototype.start.call(this);
    this.addEntity(gb);
    this.addEntity(main_cat);
}

var food1 = 0;
var garbage1 = 0;
var vortex1 = 0;
var played = false;

CatEngine.prototype.update = function () {
    if (isActive && (this.lastFoodAddedAt == null || (this.timer.gameTime - this.lastFoodAddedAt) > 1)) {
        if (food1 !== 0) {
            var rand = Math.floor(Math.random() * food.length);
            this.addEntity(new Food(this, food[rand], this.ctx.canvas.width, Math.random() * Math.PI * 180));
            this.lastFoodAddedAt = this.timer.gameTime;
        } else {
            food1++;
        }
    }

    if (isActive && (this.lastGarbageAddedAt == null || (this.timer.gameTime - this.lastGarbageAddedAt) > garbage)) {
        if (garbage1 !== 0) {
            var rand = Math.floor(Math.random() * basura.length);
            this.addEntity(new Garbage(this, basura[rand], this.ctx.canvas.width, Math.random() * Math.PI * 180));
            this.lastGarbageAddedAt = this.timer.gameTime;
        } else {
            garbage1++;
        }
    }

    if (isActive && (this.lastVortexAddedAt == null || (this.timer.gameTime - this.lastVortexAddedAt) > Math.random() + 20)) {
        if (vortex1 > 0) {
            this.addEntity(new Vortex(this, this.ctx.canvas.width, Math.random() * Math.PI * 180));
            this.lastVortexAddedAt = this.timer.gameTime;
        } else {
            vortex1++;
        }
    }


    GameEngine.prototype.update.call(this);
}

CatEngine.prototype.draw = function () {
    GameEngine.prototype.draw.call(this, function (game) {
    });
}

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var game_canvas = document.getElementById('miniGame');
    var ctx = canvas.getContext('2d');
    var game_context = game_canvas.getContext('2d');
    var game = new CatEngine();

    food = ['./cake.png', './donut.png', './noodles.png', './pancakes.png', './popsicle.png', './riceball.png', './sushi.png'];
    for (var i = 0; i < food.length; i++) {
        ASSET_MANAGER.queueDownload(food[i]);
    }
    basura = ['./poison.gif', './poop.png', './skull.png'];
    for (var i = 0; i < basura.length; i++) {
        ASSET_MANAGER.queueDownload(basura[i]);
    }

    cats = ['./pusheen1.png', './pusheen2.png', './pusheen3.png', './pusheen4.png', './pusheen5.png', './pusheen6.png'];
    for (var i = 0; i < cats.length; i++) {
        ASSET_MANAGER.queueDownload(cats[i]);
    }

    ASSET_MANAGER.queueDownload('./lives.png');
    ASSET_MANAGER.queueDownload('./score.png');
    ASSET_MANAGER.queueDownload('./rain.png');
    ASSET_MANAGER.queueDownload('./rainbow.png');
    ASSET_MANAGER.queueDownload('./vortex.png');
    ASSET_MANAGER.queueDownload('./paris.png');
    ASSET_MANAGER.queueDownload('./snow.png');
    ASSET_MANAGER.queueDownload('./fireworks.png');
    ASSET_MANAGER.queueDownload('./christmas.png');
    ASSET_MANAGER.queueDownload('./vortex.png');
    ASSET_MANAGER.queueDownload('./catwalk_forward.png');

    ASSET_MANAGER.downloadAll(function () {
        //main_cat = new Cat(this, 250, 360, './pusheen1.png');
        main_cat = new RollingCat(game, 250, 430, './pusheen1.png');

        gb = new GameBoard(game);
        canvas.setAttribute('tabindex', '0');
        canvas.focus();
        window.addEventListener("keydown", function (e) {
            if (e.keyCode === 32) {
                main_cat.jump = true;
            }
        }, true);
        game.init(ctx);
        game.start();
    });
});