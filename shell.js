var garbage = 6;
var garbage_speed = 200;
var food_scale = 1;

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

    ctx.fillStyle = "#000";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Lives: " + main_cat.lives, 10, 25);
    ctx.fillText("Score: " + main_cat.score, 10, 45);

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
    this.radius = 50;
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
    this.radius = 50;
    this.jump = false;
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
    this.lives = 9;
    this.score = 0;
    this.scale = 0.7;
}
RollingCat.prototype = new Entity();
RollingCat.prototype.constructor = RollingCat;

RollingCat.prototype.update = function () {
    this.centerx = this.x + this.radius;
    this.centery = this.y + this.radius;
    Entity.prototype.update.call(this);
    if (this.animation.isDone()) {
        this.removeFromWorld = true;
    }

    if (this.jump) {
        if (this.y > 100) {
            this.y -= 5;
        } else {
            this.jump = false;
        }
    } else {
        if (this.y < 360) {
            this.y += 5;
        }
    }
}

RollingCat.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.t.tick(), ctx, this.x, this.y, this.scale);
    Entity.prototype.draw.call(this, ctx);
}


function Vortex(game, radial_distance, angle){
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

    this.x = this.radial_distance* Math.cos(this.angle);
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

    if (dist <= sum) {
    	//Here is where vortex collision will happen
    	
        console.log("Collided with vortex!!!");
        document.getElementById('gameWorld').style.display = 'none';
		document.getElementById('miniGame').focus();
        
    }
    Entity.prototype.update.call(this);
}

Vortex.prototype.draw = function (ctx) {
    this.drawSpriteCentered(ctx);

    Entity.prototype.draw.call(this, ctx);
}




function Food(game, radial_distance, angle) {
    Entity.call(this, game);
    this.radial_distance = radial_distance;
    this.angle = 0;
    this.speed = 100;
    this.sprite = ASSET_MANAGER.getAsset('./cake.gif');
    this.radius = 25;
	var rand = Math.floor((Math.random() * 3));
	if (rand === 0) {
		this.y = 375;
	} else if ( rand === 1) {
		this.y = 250;
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

    /*console.log("Sum: " + sum);
    console.log("Distance: " + sum);*/

    if (dist <= sum) {
        if (main_cat.scale <= 1.5) {
            main_cat.scale += 0.01;
			if (food_scale > .50) {
				food_scale -= 0.005;
			}
        }
        main_cat.score += 100;
		if (main_cat.score % 200 === 0 && garbage > 1) {
			garbage--;
		}
        this.removeFromWorld = true;
    }

    /*if (this.x < 360 && !main_cat.jump) {
        console.log("Collision - FOOD");
        this.removeFromWorld = true;
    }*/
                    
    Entity.prototype.update.call(this);
}


/*Food.prototype.hitPlanet = function () {
    var distance_squared = ((this.x * this.x) + (this.y * this.y));
    var radii_squared = (this.radius + Earth.RADIUS) * (this.radius + Earth.RADIUS);
    return distance_squared < radii_squared;
}*/

Food.prototype.draw = function (ctx) {
    var x = this.x - this.sprite.width/2;
    var y = this.y - this.sprite.height/2;
    ctx.drawImage(this.sprite, x, y, 100 * food_scale, 100 * food_scale);

    Entity.prototype.draw.call(this, ctx);
}

function Garbage(game, radial_distance, angle) {
    Entity.call(this, game);
    this.radial_distance = radial_distance;
    this.angle = 0;
    this.speed = garbage_speed;
    this.sprite = ASSET_MANAGER.getAsset('./skull.png');
    this.radius = 100 / 2;
	var rand = Math.floor((Math.random() * 3));
	if (rand === 0) {
		this.y = 375;
	} else if ( rand === 1) {
		this.y = 250;
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
            alert("You Died!!!!!");
			document.getElementById('gameWorld').style.display = 'none';
        }
    }
    Entity.prototype.update.call(this);
}

Food.prototype.hitCat = function () {
    //var distance_squared = ((this.x * this.x) + (this.y * this.y));
    //var radii_squared = this.radius * this.radius;
    return this.x < 525;
}

Garbage.prototype.draw = function (ctx) {
    var x = this.x - this.sprite.width/2;
    var y = this.y - this.sprite.height/2;
    ctx.drawImage(this.sprite, x, y, 100 * food_scale, 100 * food_scale);

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
    if (this.lastFoodAddedAt == null || (this.timer.gameTime - this.lastFoodAddedAt) > 1) {
        this.addEntity(new Food(this, this.ctx.canvas.width, Math.random() * Math.PI * 180));
        this.lastFoodAddedAt = this.timer.gameTime;
    }

    if (this.lastGarbageAddedAt == null || (this.timer.gameTime - this.lastGarbageAddedAt) > garbage) {
        this.addEntity(new Garbage(this, this.ctx.canvas.width, Math.random() * Math.PI * 180));
        this.lastGarbageAddedAt = this.timer.gameTime;
    }
    /**if(this.lastVortexAddedAt == null && (this.timer.gameTime - this.lastVortexAddedAt) > Math.random() * 200 + 10){
    	this.addEntity(new Vortex(this, this.ctx.canvas.width, Math.random() * Math.PI * 180));
    	this.lastVortexAddedAt = this.timer.gameTime;
    }**/
  

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

    ASSET_MANAGER.queueDownload('./pusheen1.png');
    ASSET_MANAGER.queueDownload('./cake.gif');
    ASSET_MANAGER.queueDownload('./skull.png');
    ASSET_MANAGER.queueDownload('./bg.png');
    ASSET_MANAGER.queueDownload('./rolling.png');
    ASSET_MANAGER.queueDownload('./vortex.png');
    
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
                main_cat.jump = true;
            }
        };
        game.init(ctx);
        game.start();
    });
});