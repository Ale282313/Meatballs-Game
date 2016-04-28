function startMouseEvents() {
    $(document).mousemove(function (e) {
        var angle = getAngle(e);
        currentPlayer.rotateCannon(angle);

        socket.emit('210', { myAngle: angle });
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
    game.gameBox.mouseup(function (e) {
        if (e.which === 3) {
            socket.emit('230');
        }
    });
    $(document).mouseup(function (e) {
        if (e.which === 1) {
            if (currentPlayer.power.css('display') == 'none' ) {
                return;
            }
            leftClick(e);
        }
    });
}

function startGame(data) {
    $("#game-box").show();
    var cPlayer = {
        username : $("#my-stats > .username"),
        health : $("#my-stats > .health"),
        currentHealth : $("#my-stats > .health > .current-health"),
        cooldown : $("#my-stats > .cooldown"),
        currentCooldown : $("#my-stats > .cooldown >.current-cooldown"),
        shield : $("#my-stats > .shield"),
        currentShield : $("#my-stats > .shield > .current-shield"),
        missile : $("#my-tank > .missile"),
        cannon : $("#my-tank > .tank-wrapper > .cannon-wrapper"),
        body : $("#my-tank > .tank-wrapper > .tank-body"),
        defense : $("#my-tank > .defense"),
        hitShadow: $("#my-tank > .hit-shadow"),
        tank: $("#my-tank > .tank-wrapper")
    };
    CurrentPlayer.prototype = new Player(cPlayer);
    currentPlayer = new CurrentPlayer($("#power"), $("#current-power"));

    var ePlayer = {
        username : $("#enemy-stats > .username"),
        health : $("#enemy-stats > .health"),
        currentHealth : $("#enemy-stats > .health > .current-health"),
        cooldown : $("#enemy-stats > .cooldown"),
        currentCooldown : $("#enemy-stats > .cooldown >.current-cooldown"),
        shield : $("#enemy-stats > .shield"),
        currentShield : $("#enemy-stats > .shield > .current-shield"),
        missile : $("#enemy-tank > .missile"),
        cannon : $("#enemy-tank > .tank-wrapper > .cannon-wrapper"),
        body : $("#enemy-tank > .tank-wrapper > .tank-body"),
        defense : $("#enemy-tank > .defense"),
        hitShadow: $("#enemy-tank > .hit-shadow"),
        tank: $("#enemy-tank > .tank-wrapper")
    };
    EnemyPlayer.prototype = new Player(ePlayer);
    enemyPlayer = new EnemyPlayer();

    game = new Game(data);
    game.initializeGame();
}

function getVector(velocity, angle) {
    var v0x = velocity * Math.cos(angle * Math.PI / 180);
    var v0y = velocity * Math.sin(angle * Math.PI / 180);
    return [v0x,v0y]
}

function leftClick(e) {
    var power = currentPlayer.getPower();
    var shotAngle = getAngle(e);
    angle = polishAngle(shotAngle);
    
    socket.emit('220', {shotAngle: shotAngle, angle: angle, power: power});
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

function showWarningMessage (textMessage) {
    game.warningMessage.text(textMessage);
    game.warningMessage.show();
    setTimeout(function hideMessage() {
        game.warningMessage.hide();
    }, 1000)
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

function connectionString(data) {
    return $.param({"winner": data.winner,
                    "game_duration": data.game_duration,
                    "player1_username": data.player1_username,
                    "player1_totalShots": data.player1_totalShots,
                    "player1_hitShots": data.player1_hitShots,
                    "player1_shieldActivation": data.player1_shieldActivation,
                    "player2_username": data.player2_username,
                    "player2_totalShots": data.player2_totalShots,
                    "player2_hitShots": data.player2_hitShots,
                    "player2_shieldActivation": data.player2_shieldActivation
    });
}
