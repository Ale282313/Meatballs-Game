$(document).ready(function () {
    socket = io.connect('http://'.concat(document.domain, ':', location.port, '/game'));

    socket.on('200', function (data) {
        $("#connection-messages").hide();
        startGame(data);
        startMouseEvents();
    });
    
    socket.on('201', function (msg) {
        game.getDataFromServer(msg)
    });
    
    socket.on('202', function (msg) {
        game.getDataFromServer(msg)
    });

    socket.on('300', function (msg) {
        $("#game-box").hide();
        $("#connection-messages").show();
        $("#player-waiting").hide();
        $("#player-disconnect").text(msg.data);
        $("#player-status").text(msg.message);
        socket.disconnect();
    });

    socket.on('210', function(msg) {
        enemyPlayer.rotateCannon(msg.myAngle);
    });

    socket.on('220', function(msg) {
        enemyPlayer.shot(enemyPlayer.getStartPosition(msg.angle), msg.angle, msg.power);
    });

    socket.on('231', function() {
        enemyPlayer.activateShield();
    });
    
    socket.on('232', function() {
        currentPlayer.activateShield();
    });
    
    socket.on('241', function() {
        enemyPlayer.shotCooldownReset();
    });
    
    socket.on('242', function() {
        currentPlayer.shotCooldownReset();
    });

    socket.on('251', function(msg) {
        enemyPlayer.missileHit(currentPlayer, msg.damage);
    });

    socket.on('252', function(msg) {
        currentPlayer.missileHit(enemyPlayer, msg.damage);
    });
    
    socket.on('261', function(msg) {
        showWarningMessage(msg.message);
    });
    
    socket.on('262', function(msg) {
       showWarningMessage(msg.message);
    });
        
    socket.on('290', function(msg) {
       showWarningMessage(msg.winner + ' won!');
    });
});
