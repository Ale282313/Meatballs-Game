$(document).ready(function () {
    socket = io.connect('http://'.concat(document.domain, ':', location.port, '/game'));

    socket.on('200', function (data) {
        $("#connection-messages").hide();
        startGame(data);
        startMouseEvents();
        enemyPlayer.initializePlayer(data);
        currentPlayer.initializePlayer(data);
    });
    
    socket.on('201', function (data) {
        currentPlayer.setUsername(data.player2_username);
        enemyPlayer.setUsername(data.player1_username);
    });
    
    socket.on('202', function (data) {
        currentPlayer.setUsername(data.player1_username);
        enemyPlayer.setUsername(data.player2_username);
    });

    socket.on('300', function (data) {
        $("#game-box").hide();
        $("#connection-messages").show();
        $("#player-waiting").hide();
        $("#player-disconnect").text(data.data);
        $("#player-status").text(data.message);
        socket.disconnect();
    });

    socket.on('210', function(data) {
        enemyPlayer.rotateCannon(data.myAngle);
    });

    socket.on('221', function(data) {
        enemyPlayer.shot(enemyPlayer.getStartPosition(data.angle), data.angle, data.power);
        enemyPlayer.shotCooldownReset();
    });

    socket.on('222', function(data) {
        currentPlayer.missile.show();
        currentPlayer.shotCooldownReset();
        $.when(currentPlayer.shot(currentPlayer.getStartPosition(data.angle), data.angle, data.power)).then(
            function () {
                socket.emit('250', {whoShot: currentPlayer.username.text(), damage: currentPlayer.damage});
            }
        );
    });

    socket.on('231', function() {
        enemyPlayer.activateShield();
    });
    
    socket.on('232', function() {
        currentPlayer.activateShield();
    });

    socket.on('251', function(data) {
        console.log(data)
        enemyPlayer.missileHit(currentPlayer, data);
    });

    socket.on('252', function(data) {
        console.log(data)
        currentPlayer.missileHit(enemyPlayer, data);
    });
    
    socket.on('261', function(data) {
        showWarningMessage(data.message);
    });
    
    socket.on('262', function(data) {
        showWarningMessage(data.message);
    });
        
    socket.on('290', function(data) {
        showWarningMessage(data + ' won!');
        //functia care redirecteaza userii pe pagina after_game.html
        //poate un efect cool de FADE OUT la elementele jocului
        clearInterval(gameTimer)
        setTimeout(function(){
            console.log(secs);
            //maybe make another event to send the duration of the game to the server
            window.location.replace("game/after_game.html");
            //and of course, close the socket
        }, 1000);

        //TODO: de colectat stats-urile de la server (totalShots, hitSHots, time)
    });
});
