function Game() {
    this.gameBox = $("#game-box");
    this.warningMessage = $("#message");
    this.gravity = 4.34;
    this.timer = $("#timer");

    this.displayGravity = function (gravity) {
        var maxGravity = 11;
        for (i = 1; i <= maxGravity * 10; i++) {
            var bar = document.createElement('div');
            $(bar).addClass("bar");
            if (i <= Math.floor(gravity) * 10) {
                $(bar).addClass("on");
            }
            $(bar).height(10);
            $(bar).width(5);
            $(bar).appendTo($("#gravity-bars"));
        }
    }

    this.startTimer = function (timer) {
        var secs = 0;
        setInterval(function () {
            secs += 1;
            timer.text(displayTimer(secs));
        }, 1000);
    }

    this.getDatafromServer = function () {
        //here we get the gravity and other general stuff from server
        //gets called once in the begining of the game
    }

    this.initializeGame = function () {
        $(document).bind("contextmenu", function (event) {
            event.preventDefault();
        });
        this.getDatafromServer();
        this.displayGravity(this.gravity);
        this.startTimer(this.timer);
    }
}

function Player(obj) {
    this.username = obj.username;
    this.health = obj.health;
    this.currentHealth = obj.currentHealth;
    this.cooldown = obj.cooldown;
    this.currentCooldown = obj.currentCooldown;
    this.shield = obj.shield;
    this.currentShield = obj.currentShield;

    this.missile = obj.missile;
    this.cannon = obj.cannon;
    this.body = obj.body;
    this.defense = obj.defense;

    this.hasDefense = false;
    this.shieldDuration = 3; //in seconds
    this.shieldCooldwown = 2; //in seconds
    this.shotCooldown = 1; //in seconds
    this.totalShots = 0;
    this.hitShots = 0;
    this.damage = 30;

    this.isDead = function () {
        return this.currentHealth.width() <= 0
    };
    this.showShield = function () {
        var that = this;
        this.hasDefense = true;
        this.defense.show();
        setTimeout(function hideDefense() {
            that.defense.hide();
            opponent(that).missile.hide();
            that.hasDefense = false;
        }, this.shieldDuration * 1000);
    }

    this.activateShield = function () {
        if (this.isShieldCooldownReady()) {
            this.showShield();
            this.shieldCooldownReset();
        }
        else {
            showWarningMessage("Shield cooldown!");
        }
    }
    this.shotCooldownReset = function() {
        this.currentCooldown.css({width: 0 + "px"});
        var that = this;
        var shotCooldownTimer = setInterval(function () {
            if (that.currentCooldown.width() <= Math.floor(that.cooldown.width())) {
                that.currentCooldown.css({width: that.currentCooldown.width() + 1 + "px"});
            }
            else {
                clearInterval(shotCooldownTimer);
            }
        }, 1000 / (200/that.shotCooldown)); //takes 5 seconds to refresh the shot\
    }
    this.shieldCooldownReset = function () {
        this.currentShield.css({width: 0 + "px"});
        var that = this;
        var shieldCooldownTimer = setInterval(function () {
            if (that.currentShield.width() <= Math.ceil(that.shield.width())) {
                that.currentShield.css({width: that.currentShield.width() + 1 + "px"});
            }
            else {
                clearInterval(shieldCooldownTimer);
            }
        }, 1000 / (200/that.shieldCooldwown)); //takes 20 seconds to refresh the shield
    }
    this.missileHit = function (opponent, damage) {
        opponent.currentHealth.css({width: opponent.currentHealth.width() - damage + "px"})
    }
    this.isShieldCooldownReady = function() {
        //this has to come from the server
        return (this.currentShield.width() >= Math.floor(this.shield.width()))
    }
    this.isShotCooldownReady = function() {
        //this has to come from the server
        return (this.currentCooldown.width() >= Math.floor(this.cooldown.width()))
    }
    this.computeNewYCoordinate = function(startY, vectorY, frameCount, gravity) {
        return startY - ( vectorY * frameCount - (1 / 2 * gravity * Math.pow(frameCount, 2)) )
    }
    this.shot = function (startPosition, angle, power) {
        var hit = jQuery.Deferred();
        var projectile = {
            x: startPosition[0],
            y: startPosition[1],
            radius: 10,
            velocity: power,
            theta: angle
        };
        var frameCount = 0;
        var vector = getVector(projectile.velocity, projectile.theta);
        var startX = projectile.x;
        var startY = projectile.y;
        var that = this;
        var timer2 = setInterval(function () {
            if (that.missileNotOutOfBounds(projectile.x, projectile.y, projectile.radius)) {
                that.missile.show();
                if (!opponent(that).hasDefense) {
                    projectile.y = that.computeNewYCoordinate(startY, vector[1], frameCount, game.gravity);
                    projectile.x = that.computeNewXCoordinate(startX, vector[0], frameCount);
                }
                else {
                    if (that.missileNotHitShield(projectile.x, projectile.y, projectile.radius)) {
                        projectile.y = that.computeNewYCoordinate(startY, vector[1], frameCount, game.gravity);
                        projectile.x = that.computeNewXCoordinate(startX, vector[0], frameCount);
                    }
                    else {
                        clearInterval(timer2);
                    }
                }
            }
            else {
                if (that.missileOutOfLateralBounds(projectile.y, projectile.radius)) {
                    that.missile.hide();
                }
                if (that.missileHitOpponent(projectile.x, projectile.y)) {
                    hit.resolve();
                }
                else {
                    hit.reject();
                }
                clearInterval(timer2);
            }
            that.missile.css({left: projectile.x + "px", top: projectile.y + "px"});
            frameCount += .1;
        }, 1000 / 200);
        return hit.promise();
    }
}

function CurrentPlayer(power, currentPower) {
    this.power = power;
    this.currentPower = currentPower;
    this.rotateCannon = function(angle) {
        this.cannon.css({'transform': 'rotate(' + angle + 'deg)'});
    }
    this.getPower = function() {
        var p = this.currentPower.width() / 3;
        this.power.hide();
        return p;
    }

    this.missileNotOutOfBounds = function(x, y, radius) {
        return y < game.gameBox.height() - radius && x < game.gameBox.width()
    }
    this.missileNotHitShield = function(x, y, radius) {
        var xLimit = x < (game.gameBox.width() - enemyPlayer.defense.width());
        var yLimit = y < (game.gameBox.height() - enemyPlayer.defense.height() - radius);
        return (xLimit || yLimit)
    }
    this.missileOutOfLateralBounds = function(y, radius) {
        return y < game.gameBox.height() - radius
    }
    this.missileHitOpponent = function(x, y) {
        return x > (game.gameBox.width() - enemyPlayer.body.width()) && y > (game.gameBox.height() - enemyPlayer.body.height())
    }
    this.computeNewXCoordinate = function(startX, vector, frameCount) {
        return startX + vector * frameCount;
    }
    this.getStartPosition = function (angle) {
        var xPos = currentPlayer.cannon.offset().left - 1 - game.gameBox.offset().left + 1.3 * angle;
        var yPos = Math.floor(currentPlayer.cannon.offset().top - 1 - game.gameBox.offset().top);
        return [xPos, yPos];
    }

}

function EnemyPlayer() {
    this.missileNotOutOfBounds = function(x, y, radius) {
        return y < game.gameBox.height() - radius && x > 0
    }
    this.missileNotHitShield = function(x, y, radius) {
        var xLimit = x > currentPlayer.defense.width();
        var yLimit = y < (game.gameBox.height() - currentPlayer.defense.height() - radius);
        return (xLimit || yLimit)
    }
    this.missileOutOfLateralBounds = function(y, radius) {
        return y < game.gameBox.height() - radius
    }
    this.missileHitOpponent = function(x, y) {
        return x < currentPlayer.body.width() && y > (game.gameBox.height() - currentPlayer.body.height())
    }
    this.computeNewXCoordinate = function(startX, vector, frameCount) {
        return startX - vector * frameCount;
    }
    this.rotateCannon = function(angle) {
        this.cannon.css({'transform': 'rotate(' + -angle + 'deg)'});
    }
    this.getStartPosition = function (angle) {
        var xPos = this.cannon.offset().left-1-game.gameBox.offset().left;
        var yPos = Math.floor(this.cannon.offset().top-1-game.gameBox.offset().top);
        return [xPos, yPos];
    }
}

$(document).ready(function () {

    startGame();
    game.gameBox.mousemove(function (e) {
        var angle = getAngle(e);
        currentPlayer.rotateCannon(angle);
    });
    game.gameBox.mousedown(function (e) {
        if (e.which == 1) {
            currentPlayer.power.show();
            currentPlayer.power.css({
                'left': e.pageX - game.gameBox.offset().left,
                'right': 'auto',
                'top': e.pageY - game.gameBox.offset().top - 5,
                'bottom': 'auto'
            });
        }
    });
    $(document).mouseup(function (e) {
        if (e.which === 1) {
            leftClick(e);
        }
        if (e.which === 2) {
            //just for fun - you can shoot and activate enemy's shield with scroll button - test purposes
            enemyPlayer.activateShield();
        }
        if (e.which === 3) {
            currentPlayer.activateShield();
        }
    });
});

function startGame() {
    $("#connection-messages").hide();
    $("#game-box").show();
    var cPlayer = {
        username : $("#my-username"),
        health : $("#my-health"),
        currentHealth : $("#my-current-health"),
        cooldown : $("#my-cooldown"),
        currentCooldown : $("#my-current-cooldown"),
        shield : $("#my-shield"),
        currentShield : $("#my-current-shield"),
        missile : $("#my-missile"),
        cannon : $("#my-cannon"),
        body : $("#my-body"),
        defense : $("#my-defense")
    }
    CurrentPlayer.prototype = new Player(cPlayer);
    currentPlayer = new CurrentPlayer($("#power"),$("#current-power"));

    var ePlayer = {
        username: $("#enemy-username"),
        health: $("#enemy-health"),
        currentHealth: $("#enemy-current-health"),
        cooldown: $("#enemy-cooldown"),
        currentCooldown: $("#enemy-current-cooldown"),
        shield: $("#enemy-shield"),
        currentShield: $("#enemy-current-shield"),
        missile: $("#enemy-missile"),
        cannon: $("#enemy-cannon"),
        body: $("#enemy-body"),
        defense: $("#enemy-defense")
    }
    EnemyPlayer.prototype = new Player(ePlayer);
    enemyPlayer = new EnemyPlayer();

    game = new Game();
    game.initializeGame();
}

function getVector(velocity, angle) {
    var v0x = velocity * Math.cos(angle * Math.PI / 180);
    var v0y = velocity * Math.sin(angle * Math.PI / 180);
    return [v0x,v0y]
}

function leftClick(e) {
    var power = currentPlayer.getPower();
    var positionAngle = getAngle(e);
    var startPosition = currentPlayer.getStartPosition(positionAngle);
    var angle = getAngle(e);
    angle = polishAngle(angle);
    if (currentPlayer.isShotCooldownReady()) {
        currentPlayer.totalShots++;
        currentPlayer.missile.show();
        $.when(currentPlayer.shot(startPosition, angle, power)).then(
            function () {
                currentPlayer.hitShots++;
                currentPlayer.missileHit(enemyPlayer, currentPlayer.damage);
                if (enemyPlayer.isDead()) {
                    //check if life on server is 0 too
                    showWarningMessage("Ai castigat!");
                    //redirect to after_game page
                }
            }
        );
        currentPlayer.shotCooldownReset();
    }
    else {
        showWarningMessage("Shot cooldown!");
    }
}

function showWarningMessage(textMessage) {
    game.warningMessage.text(textMessage);
    game.warningMessage.show();
    setTimeout(function hideMessage() {
        game.warningMessage.hide();
    }, 1000)
}

function getAngle(e) {
    var distX = e.pageX - game.gameBox.offset().left - currentPlayer.body.width();
    var distY = Math.abs(e.pageY - game.gameBox.offset().top - game.gameBox.height()) - currentPlayer.body.height();
    var angle = Math.atan2(distX, distY) * (180 / Math.PI);
    if (angle < 0) {
        angle = 0;
    }
    if (angle > 90) {
        angle = 90;
    }
    return angle;
}

function getStartPosition(angle) {
    var xPos = currentPlayer.cannon.offset().left - 1 - game.gameBox.offset().left + 1.3 * angle;
    var yPos = Math.floor(currentPlayer.cannon.offset().top - 1 - game.gameBox.offset().top);
    return [xPos, yPos];
}

function polishAngle(angle) {
    if (angle - 90 < 0) {
        var angle = Math.abs(angle - 90);
    }
    else {
        var angle = -(angle - 90);
    }
    if (angle < 0) {
        angle = 0;
    }
    if (angle > 90) {
        angle = 90;
    }
    return angle;
}

function displayTimer(secs) {
    if (secs < 59) {
        if (secs < 10) {
            return ("0" + secs);
        }
        else {
            return (secs);
        }
    }
    else {
        if (secs % 60 < 10) {
            return (Math.floor(secs / 60) + ":0" + secs % 60);
        }
        else {
            return (Math.floor(secs / 60) + ":" + secs % 60);
        }
    }
}

function opponent(player) {
    if (player instanceof CurrentPlayer) {
        return enemyPlayer;
    }
    if (player instanceof EnemyPlayer) {
        return currentPlayer;
    }
}
