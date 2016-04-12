function Game() {
    this.gameBox = $("#game-box");
    this.warningMessage = $("#message");
    this.gravity = 4.34;
    this.timer = $("#timer");

    this.displayGravity = function() {
        //$("#gravity-bars:nth-child(g)").addClass("on");
    }
    this.startTimer = function(timer) {
        var secs = 0;
        setInterval(function() {
        secs+=1;
        if (secs<59) {
            if (secs<10) { timer.text("0" + secs); }
            else { timer.text(secs); }
        }
        else {
            if (secs%60<10) { timer.text(Math.round(secs/60) + ":0" + secs%60); }
            else { timer.text(Math.round(secs/60) + ":" + secs%60); }
        }
    }, 1000);}
    this.getDatafromServer = function() {
        //here we get the gravity and other general stuff from server
        //gets called once in the begining of the game
    }
    this.initializeGame = function() {
        $(document).bind("contextmenu", function(event) {
        event.preventDefault();
    });
        this.getDatafromServer();
        this.displayGravity(this.gravity);
        this.startTimer(this.timer);
    }
}

function CurrentPlayer() {
    this.username = $("#my-username");
    this.health = $("#my-health");
    this.currentHealth = $("#my-current-health");
    this.cooldown = $("#my-cooldown");
    this.currentCooldown = $("#my-current-cooldown");
    this.shield = $("#my-shield");
    this.currentShield = $("#my-current-shield");
    this.missile = $("#my-missile");
    this.cannon = $("#my-cannon");
    this.body = $("#my-body");
    this.defense = $("#my-defense");
    this.power = $("#power");
    this.currentPower = $("#current-power");

    this.isDead = function () {
        return this.currentHealth.width() <= 0
    };
    this.shot = function (startPosition, angle, power) {
        var hit = jQuery.Deferred();
        var pro = {
            x: startPosition[0],
            y: startPosition[1],
            r: 10,
            v: power,
            theta: angle
        };
        var frameCount = 0;
        var v0x = pro.v * Math.cos(pro.theta * Math.PI / 180);
        var v0y = pro.v * Math.sin(pro.theta * Math.PI / 180);
        var startX = pro.x;
        var startY = pro.y;

        var timer2 = setInterval(function () {
            if (pro.y < game.gameBox.height() - pro.r && pro.x < game.gameBox.width()) {
                currentPlayer.missile.show();
                if (!enemyPlayer.hasDefense()) {
                    pro.y = startY - ( v0y * frameCount - (1 / 2 * game.gravity * Math.pow(frameCount, 2)) );
                    pro.x = startX + v0x * frameCount;
                }
                else {
                    var xLimit = pro.x < (game.gameBox.width() - enemyPlayer.defense.width());
                    var yLimit = pro.y < (game.gameBox.height() - enemyPlayer.defense.height() - 10);
                    if (xLimit || yLimit) {
                        pro.y = startY - ( v0y * frameCount - (1 / 2 * game.gravity * Math.pow(frameCount, 2)) );
                        pro.x = startX + v0x * frameCount;
                    }
                    else {
                        clearInterval(timer2);
                    }
                }
            }
            else {
                if (pro.y < game.gameBox.height() - pro.r) {
                    currentPlayer.missile.hide();
                }
                if (pro.x > (game.gameBox.width() - enemyPlayer.body.width()) && pro.y > (game.gameBox.height() - enemyPlayer.body.height())) {
                    hit.resolve("bullseye!");
                }
                else {
                    hit.reject("missed!");
                }
                clearInterval(timer2);
            }
            currentPlayer.missile.css({left: pro.x + "px", top: pro.y + "px"});
            frameCount += .1;
        }, 1000 / 200);
        return hit.promise();
    }
    this.hasDefense = function () {
        return this.defense.css('display') != 'none'
    }
}

function EnemyPlayer() {
    this.username = $("#enemy-username");
    this.health = $("#enemy-health");
    this.currentHealth = $("#enemy-current-health");
    this.cooldown = $("#enemy-cooldown");
    this.currentCooldown = $("#enemy-current-cooldown");
    this.shield = $("#enemy-shield");
    this.currentShield = $("#enemy-current-shield");
    this.missile = $("#enemy-missile");
    this.cannon = $("#enemy-cannon");
    this.body = $("#enemy-body");
    this.defense = $("#enemy-defense");

    this.isDead = function () {
        return this.currentHealth.width() <= 0
    };
    this.hasDefense = function () {
        return this.defense.css('display') != 'none'
    }
    this.shot = function (startPosition, angle, power) {
        var hit = jQuery.Deferred();
        var pro = {
            x: 1100,
            y: startPosition[1],
            r: 10,
            v: power,
            theta: angle
        };
        var frameCount = 0;
        var v0x = pro.v * Math.cos(pro.theta * Math.PI / 180);
        var v0y = pro.v * Math.sin(pro.theta * Math.PI / 180);
        var startX = pro.x;
        var startY = pro.y;

        var timer2 = setInterval(function () {
            if (pro.y < game.gameBox.height() - pro.r && pro.x > 0) {
                enemyPlayer.missile.show();
                if (!currentPlayer.hasDefense()) {
                    pro.y = startY - ( v0y * frameCount - (1 / 2 * game.gravity * Math.pow(frameCount, 2)) );
                    pro.x = startX - v0x * frameCount;
                }
                else {
                    var xLimit = pro.x > currentPlayer.defense.width();
                    var yLimit = pro.y < (game.gameBox.height() - currentPlayer.defense.height() - 10);
                    if (xLimit || yLimit) {
                        pro.y = startY - ( v0y * frameCount - (1 / 2 * game.gravity * Math.pow(frameCount, 2)) );
                        pro.x = startX - v0x * frameCount;
                    }
                    else {
                        clearInterval(timer2);
                    }
                }
            }
            else {
                if (pro.y < game.gameBox.height() - pro.r) {
                    enemyPlayer.missile.hide();
                }
                if (pro.x < currentPlayer.body.width() && pro.y > (game.gameBox.height() - currentPlayer.body.height())) {
                    hit.resolve("bullseye!");
                }
                else {
                    hit.reject("missed!");
                }
                clearInterval(timer2);
            }
            enemyPlayer.missile.css({left: pro.x + "px", top: pro.y + "px"});
            frameCount += .1;
        }, 1000 / 200);
        return hit.promise();
    }
}

$(document).ready(function () {
    game = new Game();
    currentPlayer = new CurrentPlayer();
    enemyPlayer = new EnemyPlayer();
    game.initializeGame();

    $(document).mousemove(function (e) {
        angle = getAngle(e);
        rotateCannon(currentPlayer.cannon, angle);
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
            activateShield(enemyPlayer);
        }
        if (e.which === 3) {
            activateShield(currentPlayer);
        }
    });
});

function leftClick(e) {
    var power = getPower();
    var positionAngle = getAngle(e);
    var startPosition = getStartPosition(positionAngle);
    var angle = getAngle(e);
    angle = polishAngle(angle);
    if (isCooldownReady(currentPlayer.currentCooldown, currentPlayer.cooldown)) {
        currentPlayer.missile.show();
        $.when(currentPlayer.shot(startPosition, angle, power)).then(
            function () {
                missileHit(enemyPlayer, 101);
                if (enemyPlayer.isDead()) {
                    showWaringMessage("Ai castigat!");
                }
            }
        );
        shotCooldownReset(currentPlayer);
    }
    else {
        showWaringMessage("Shot cooldown!");
    }
}
function activateShield(player) {
    if (isCooldownReady(player.currentShield, player.shield)) {
        showShield(player);
        shieldCooldownReset(player);
    }
    else {
        showWaringMessage("Shield cooldown!");
    }
}

function showShield(player) {
    player.defense.show();
    setTimeout(function hideDefense() {
        player.defense.hide();
    }, 3000);
}

function showWaringMessage(textMessage) {
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

function rotateCannon(cannon, angle) {
    cannon.css({'transform': 'rotate(' + angle + 'deg)'});
}

function getStartPosition(angle) {
    var xPos = currentPlayer.cannon.offset().left - 1 - game.gameBox.offset().left + 1.3 * angle;
    var yPos = Math.floor(currentPlayer.cannon.offset().top - 1 - game.gameBox.offset().top);
    return [xPos, yPos];
}

function getPower() {
    var p = currentPlayer.currentPower.width() / 3;
    currentPlayer.power.hide();
    return p;
}

function isCooldownReady(child, wrapper) {
    return (child.width() >= Math.floor(wrapper.width()))
}

function missileHit(enemyPlayer, damage) {
    enemyPlayer.currentHealth.css({width: enemyPlayer.currentHealth.width() - damage + "px"})
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

function shotCooldownReset(player) {
    player.currentCooldown.css({width: 0 + "px"});
    var shotCooldownTimer = setInterval(function () {
        if (player.currentCooldown.width() <= Math.floor(player.cooldown.width())) {
            player.currentCooldown.css({width: player.currentCooldown.width() + 1 + "px"});
        }
        else {
            clearInterval(shotCooldownTimer);
        }
    }, 1000 / 40); //takes 5 seconds to refresh the shot
}

function shieldCooldownReset(player) {
    player.currentShield.css({width: 0 + "px"});
    var shieldCooldownTimer = setInterval(function () {
        if (player.currentShield.width() <= Math.ceil(player.shield.width())) {
            player.currentShield.css({width: player.currentShield.width() + 1 + "px"});
        }
        else {
            clearInterval(shieldCooldownTimer);
        }
    }, 1000 / 10); //takes 20 seconds to refresh the shot
}







