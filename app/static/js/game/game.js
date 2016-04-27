$(document).ready(function () {
    socket = io.connect('http://'.concat(document.domain, ':', location.port, '/game'));

    currentPlayerShotSound = new Audio('../static/resources/audio/shot.wav');
    enemyPlayerShotSound = currentPlayerShotSound.cloneNode();

    currentPlayerHitSound = new Audio('../static/resources/audio/hit.wav');
    enemyPlayerHitSound = currentPlayerHitSound.cloneNode();

    currentPlayerShieldSound = new Audio('../static/resources/audio/shield.wav');
    enemyPlayerShieldSound = currentPlayerShieldSound.cloneNode();

    currentPlayerCooldownSound = new Audio('../static/resources/audio/cooldown.wav');
    enemyPlayerCooldownSound = currentPlayerCooldownSound.cloneNode();
    
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
        $("#game-warning").text(data.data);
        $("#player-status").text(data.message);
        socket.disconnect();
    });

    socket.on('210', function(data) {
        enemyPlayer.rotateCannon(data.myAngle);
    });

    socket.on('221', function(data) {
        enemyPlayer.shot(enemyPlayer.getStartPosition(data.angle), data.angle, data.power);
        enemyPlayer.shotCooldownReset();
        enemyPlayerShotSound.play();
    });

    socket.on('222', function(data) {
        currentPlayer.missile.show();
        currentPlayer.shotCooldownReset();
        $.when(currentPlayer.shot(currentPlayer.getStartPosition(data.shotAngle), data.angle, data.power)).then(
            function () {
                socket.emit('250', {whoShot: currentPlayer.username.text(), damage: currentPlayer.damage});
            }
        );
        currentPlayerShotSound.play();
    });

    socket.on('231', function() {
        enemyPlayer.activateShield();
        enemyPlayerShieldSound.play();
    });
    
    socket.on('232', function() {
        currentPlayer.activateShield();
        currentPlayerShieldSound.play();
    });

    socket.on('251', function(data) {
        enemyPlayer.missileHit(currentPlayer, data);
        enemyPlayerHitSound.play();
    });

    socket.on('252', function(data) {
        currentPlayer.missileHit(enemyPlayer, data);
        enemyPlayerHitSound.play();
    });
    
    socket.on('261', function(data) {
        showWarningMessage(data.message);
        enemyPlayerCooldownSound.play();
    });

    socket.on('262', function(data) {
        showWarningMessage(data.message);
        currentPlayerCooldownSound.play();
    });
        
    socket.on('290', function(winnerUsername) {
        clearInterval(gameTimer);
        
        currentPlayer.endGame(winnerUsername);
        enemyPlayer.endGame(winnerUsername);
        
        setTimeout(function(){
            socket.emit('290', winnerUsername);
        }, 3000);
    });

    socket.on('291', function(data) {
        window.location = "./after?winner=" + data.winner
            +"&game_duration=" + data.game_duration
            +"&player1_username=" + data.player1_username
            +"&player1_totalShots=" + data.player1_totalShots
            +"&player1_hitShots=" + data.player1_hitShots
            +"&player1_shieldActivation=" + data.player1_shieldActivation
            +"&player2_username=" + data.player2_username
            +"&player2_totalShots=" + data.player2_totalShots
            +"&player2_hitShots=" + data.player2_hitShots
            +"&player2_shieldActivation=" + data.player2_shieldActivation;
    });
});
