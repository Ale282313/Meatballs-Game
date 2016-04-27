function Game(data) {
    this.gameBox = $("#game-box");
    this.warningMessage = $("#message");
    this.gravity = data.gravity;
    this.timer = $("#timer");

    this.displayGravity = function (gravity) {
        var maxGravity = 11;
        for (i = 1; i <= maxGravity * 10; i++) {
            var bar = document.createElement('div');
            $(bar).addClass("bar");
            if (i <= Math.floor(gravity) * 10) {
                $(bar).addClass("on");
            }
            $(bar).appendTo($("#gravity-bars"));
        }
    };


    this.startTimer = function (timer) {
        secs = 0;
        gameTimer = setInterval(function () {
            secs += 1;
            timer.text(displayTimer(secs));
        }, 1000);
    };

    this.getDataFromServer = function (msg) {
        $('#my-stats > .username').text(msg.player1);
        $('#enemy-stats > .username').text(msg.player2);
    };

    this.initializeGame = function () {
        $(document).bind("contextmenu", function (event) {
            event.preventDefault();
        });
        this.displayGravity(this.gravity);
        this.startTimer(this.timer);
        switch (data.background) {
            case 'moon':
                game.gameBox.css({'background': 'url("../../static/resources/img/moon_bg.png")'});
                break;

            case 'mars':
                game.gameBox.css({'background': 'url("../../static/resources/img/mars_bg.png")'});
                break;

            case 'earth':
                game.gameBox.css({'background': 'url("../../static/resources/img/earth_bg.png")'});
                break;
        }
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
    this.hitShadow = obj.hitShadow;
    this.tank = obj.tank;

    this.hasDefense = false;
    this.shieldDuration = null; //in seconds
    this.shieldCooldwown = null; //in seconds
    this.shotCooldown = null; //in seconds
    this.tankAnimation = null;
    this.damage = null;

    this.endGame = function(winnerUsername) {
        game.gameBox.addClass('animated fadeOut');

        if(winnerUsername == currentPlayer.username.text()) {
            setTimeout(function () {
                game.gameBox.hide();
                $('#connection-messages').show();
                $('#player-waiting').hide();
                $("#game-warning").text('Victory!');
                $('#game-warning').addClass('animated fadeIn');
            }, 1000);
        }
        else {
            setTimeout(function () {
                game.gameBox.hide();
                $('#connection-messages').show();
                $('#player-waiting').hide();
                $("#game-warning").text('Defeat!');
                $('#game-warning').addClass('animated fadeIn');
            }, 1000);
        }
    };

    this.setUsername = function (username) {
        this.username.text(username);
    };

    this.initializePlayer = function (data) {
        this.damage = data.damage;
        this.shieldCooldwown = data.shield_cooldown;
        this.shotCooldown = data.shot_cooldown;
        this.shieldDuration = data.shield_duration;
        this.tankAnimation = data.tank_animation;
    };

    this.initializeUsername = function (username) {
        this.username = username;
    };

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
    };

    this.activateShield = function () {
        this.showShield();
        this.shieldCooldownReset();
    };

    this.shotCooldownReset = function () {
        this.currentCooldown.css({width: 0 + "px"});
        var that = this;
        var shotCooldownTimer = setInterval(function () {
            if (that.currentCooldown.width() <= Math.floor(that.cooldown.width())) {
                that.currentCooldown.css({width: that.currentCooldown.width() + 2 + "px"});
            }
            else {
                clearInterval(shotCooldownTimer);
            }
        }, 1000 / (100 / this.shotCooldown));
    };

    this.shieldCooldownReset = function () {
        this.currentShield.css({width: 0 + "px"});
        var that = this;
        var shieldCooldownTimer = setInterval(function () {
            if (that.currentShield.width() <= Math.ceil(that.shield.width())) {
                that.currentShield.css({width: that.currentShield.width() + 2 + "px"});
            }
            else {
                clearInterval(shieldCooldownTimer);
            }
        }, 1000 / (100 / that.shieldCooldwown));
    };

    this.missileHit = function (opponent, damage) {
        var that = opponent;

        that.hitShadow.show();
        that.tank.addClass("animated tank-shake");

        setTimeout(function () {
            that.hitShadow.hide();
            that.tank.removeClass("animated tank-shake");
        }, that.tankAnimation * 1000);

        that.currentHealth.css({width: that.currentHealth.width() - damage + "px"});
    };

    this.computeNewYCoordinate = function (startY, vectorY, frameCount, gravity) {
        return startY - ( vectorY * frameCount - (1 / 2 * gravity * Math.pow(frameCount, 2)) )
    };

    this.shot = function (startPosition, angle, power) {
        var hit = jQuery.Deferred();
        rightOffset = game.gameBox.offset().left;
        var projectile = {
            x: startPosition[0],
            y: startPosition[1],
            radius: 15,
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
            that.missile.css({left: (projectile.x + rightOffset) + "px", top: projectile.y + "px"});
            frameCount += .1;
        }, 1000 / 200);
        return hit.promise();
    }
}

function CurrentPlayer(power, currentPower) {
    this.power = power;
    this.currentPower = currentPower;

    this.rotateCannon = function (angle) {
        this.cannon.css({'transform': 'rotate(' + angle + 'deg)'});
    };

    this.getPower = function () {
        var p = this.currentPower.width() / 3;
        this.power.hide();
        return p;
    };

    this.missileNotOutOfBounds = function (x, y, radius) {
        return y < game.gameBox.height() - radius && x < game.gameBox.width();
    };

    this.missileNotHitShield = function (x, y, radius) {
        var xLimit = x < (game.gameBox.width() - enemyPlayer.defense.width());
        var yLimit = y < (game.gameBox.height() - enemyPlayer.defense.height() - radius);

        return (xLimit || yLimit);
    };

    this.missileOutOfLateralBounds = function (y, radius) {
        return y < game.gameBox.height() - radius;
    };

    this.missileHitOpponent = function (x, y) {
        return x > (game.gameBox.width() - enemyPlayer.body.width()) && y > (game.gameBox.height() - enemyPlayer.body.height());
    };

    this.computeNewXCoordinate = function (startX, vector, frameCount) {
        return startX + vector * frameCount;
    };

    this.getStartPosition = function (angle) {
        var xPos = currentPlayer.cannon.offset().left - 1 - game.gameBox.offset().left + 1.2 * angle;
        var yPos = Math.floor(currentPlayer.cannon.offset().top - 1 - game.gameBox.offset().top);

        return [xPos, yPos];
    }
}

function EnemyPlayer() {

    this.missileNotOutOfBounds = function (x, y, radius) {
        return y < game.gameBox.height() - radius && x > 0;
    };

    this.missileNotHitShield = function (x, y, radius) {
        var xLimit = x > currentPlayer.defense.width();
        var yLimit = y < (game.gameBox.height() - currentPlayer.defense.height() - radius);
        return (xLimit || yLimit);
    };

    this.missileOutOfLateralBounds = function (y, radius) {
        return y < game.gameBox.height() - radius;
    };

    this.missileHitOpponent = function (x, y) {
        return x < currentPlayer.body.width() && y > (game.gameBox.height() - currentPlayer.body.height());
    };

    this.computeNewXCoordinate = function (startX, vector, frameCount) {
        return startX - vector * frameCount;
    };

    this.rotateCannon = function (angle) {
        this.cannon.css({'transform': 'rotate(' + -angle + 'deg)'});
    };

    this.getStartPosition = function () {
        var xPos = this.cannon.offset().left - 1 - game.gameBox.offset().left;
        var yPos = Math.floor(this.cannon.offset().top - 10 - game.gameBox.offset().top);
        return [xPos, yPos];
    }
}
