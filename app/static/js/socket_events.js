$(document).ready(function () {
    var socket = io.connect('http://'.concat(document.domain, ':', location.port, '/game'));
    var gamePathName = '/game/game';
    
    var currentGame = {
        gameId : '',
        myId: '',
        playerType : ''
    };
    
    var username = '';

    socket.on('server response', function() {

    });

    socket.on('connected to game', function(msg) {
        // username = msg.username;
        // currentGame.gameId = msg.game_id;
        // currentGame.myId = msg.client_id;
        // currentGame.playerType = msg.player_type;
        
        // socket.emit('join game', {game_id: msg.game_id});
        
        $("#player-status").text(msg.data);
    });

    socket.on('opponent left game', function() {
        socket.emit('goodbye', 'left game');
    });

    socket.on('added to queue', function() {

    });

    $(window).unload(function(){
        socket.emit('goodbye', 'player left game');
    });

});
