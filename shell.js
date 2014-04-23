window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
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

function Animation(spriteSheet, frameWidth, frameDuration, loop) {
    this.spriteSheet = ASSET_MANAGER.getAsset(spriteSheet);
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = this.spriteSheet.height;
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
                  index * this.frameWidth, 0,  // source from sheet
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
    return gameDelta;
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

Entity.prototype.drawSpriteCentered = function(ctx) {
    if (this.sprite && this.x && this.y) {
        var x = this.x - this.sprite.width/2;
        var y = this.y - this.sprite.height/2;
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
    this.y = 400;
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.update = function () {
    Entity.prototype.update.call(this);
}
vx = 0;

GameBoard.prototype.draw = function (ctx) {
    var canvas = document.getElementById('gameWorld');
    rect = canvas.getContext("2d");
    this.ctx = ctx;
    var img = ASSET_MANAGER.getAsset('./bg.png');
    ctx.drawImage(img, vx, 0);
    ctx.drawImage(img, img.width - Math.abs(vx), 0);

    if (Math.abs(vx) > img.width) {
        vx = 0;
    }

    vx -= 1;
    rect.fillStyle = "#947E6B";
    rect.fillRect(this.x, this.y, 1000, 100);
}

function Cat(game, x, y, sprite) {
    Entity.call(this, game);
    this.x = x;
    this.y = y;
    this.sprite = ASSET_MANAGER.getAsset(sprite);
    this.radius = this.sprite.height / 2;
}
Cat.prototype = new Entity();
Cat.prototype.constructor = Cat;

this.descend = false;

Cat.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Cat.prototype.draw = function(ctx) {
    this.drawSpriteCentered(ctx);
    
    Entity.prototype.draw.call(this, ctx);
}

function RollingCat(game, x, y) {
    this.t = new Timer();
    Entity.call(this, game, x, y);
    this.animation = new Animation('./rolling.png', 300, 0.09, true);
    this.radius = this.animation.frameWidth / 2;
}
RollingCat.prototype = new Entity();
RollingCat.prototype.constructor = RollingCat;

RollingCat.prototype.update = function () {
    Entity.prototype.update.call(this);
    if (this.animation.isDone()) {
        this.removeFromWorld = true;
    }
}

RollingCat.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.t.tick(), ctx, this.x, this.y, 1);
    Entity.prototype.draw.call(this, ctx);
}

function Food(game, radial_distance, angle) {
    Entity.call(this, game);
    this.radial_distance = radial_distance;
    this.angle = 0;
    this.speed = 100;
    this.sprite = ASSET_MANAGER.getAsset('./cake.gif');
    this.radius = this.sprite.height / 2;
    this.setCoords();
}
Food.prototype = new Entity();
Food.prototype.constructor = Food;

Food.prototype.setCoords = function () {
    this.x = this.radial_distance * Math.cos(this.angle);
    this.y = 375;
}

Food.prototype.update = function () {
    this.setCoords();
    this.radial_distance -= this.speed * this.game.clockTick;

    if (this.x < 360 && this.y + 75 > main_cat.y) {
        console.log("Collision - FOOD");
        this.removeFromWorld = true;
    }

    Entity.prototype.update.call(this);
}

/*Food.prototype.hitPlanet = function () {
    var distance_squared = ((this.x * this.x) + (this.y * this.y));
    var radii_squared = (this.radius + Earth.RADIUS) * (this.radius + Earth.RADIUS);
    return distance_squared < radii_squared;
}*/

Food.prototype.draw = function (ctx) {
    this.drawSpriteCentered(ctx);

    Entity.prototype.draw.call(this, ctx);
}

function Garbage(game, radial_distance, angle) {
    Entity.call(this, game);
    this.radial_distance = radial_distance;
    this.angle = 0;
    this.speed = 200;
    this.sprite = ASSET_MANAGER.getAsset('./skull.png');
    this.radius = 135 / 2;
    this.setCoords();
}
Garbage.prototype = new Entity();
Garbage.prototype.constructor = Garbage;

Garbage.prototype.setCoords = function () {
    this.x = this.radial_distance;
    this.y = 370;
}

Garbage.prototype.update = function () {
    this.setCoords();
    this.radial_distance -= this.speed * this.game.clockTick;

    if (this.radial_distance < 360) {
        console.log("Collision - GARBAGE");
        this.removeFromWorld = true;
    }

    Entity.prototype.update.call(this);
}

Food.prototype.hitCat = function () {
    //var distance_squared = ((this.x * this.x) + (this.y * this.y));
    //var radii_squared = this.radius * this.radius;
    return this.x < 525;
}

Garbage.prototype.draw = function (ctx) {
    this.drawSpriteCentered(ctx);

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

CatEngine.prototype.update = function () {
    if (this.lastFoodAddedAt == null || (this.timer.gameTime - this.lastFoodAddedAt) > 3) {
        this.addEntity(new Food(this, this.ctx.canvas.width, Math.random() * Math.PI * 180));
        this.lastFoodAddedAt = this.timer.gameTime;
    }

    if (this.lastGarbageAddedAt == null || (this.timer.gameTime - this.lastGarbageAddedAt) > 3) {
        this.addEntity(new Garbage(this, this.ctx.canvas.width, Math.random() * Math.PI * 180));
        this.lastGarbageAddedAt = this.timer.gameTime;
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
    var ctx = canvas.getContext('2d');
    var game = new CatEngine();

    ASSET_MANAGER.queueDownload('./pusheen1.png');
    ASSET_MANAGER.queueDownload('./cake.gif');
    ASSET_MANAGER.queueDownload('./skull.png');
    ASSET_MANAGER.queueDownload('./bg.png');
    ASSET_MANAGER.queueDownload('./rolling.png');
    
    ASSET_MANAGER.downloadAll(function () {
        //main_cat = new Cat(this, 250, 360, './pusheen1.png');
        main_cat = new RollingCat(this, 250, 360);
        gb = new GameBoard(this);
        canvas.setAttribute('tabindex', '0');
        canvas.focus();
        canvas.onkeypress = function (e) {
            if (e.keyCode === 119) {
                main_cat.y-=3;
            }

            if (e.keyCode === 115) {
                main_cat.y+=3;
            }

            if (e.keyCode === 100) {
                main_cat.x+=3;
            }

            if (e.keyCode === 97) {
                main_cat.x-=3;
            }

            if (e.keyCode === 32) {
                console.log("jump");
            }
        };
        game.init(ctx);
        game.start();
    });
});