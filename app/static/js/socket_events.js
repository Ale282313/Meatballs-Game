$(document).ready(function () {
    var socket = io.connect('http://'.concat(document.domain, ':', location.port, '/game'));
    
    socket.on('server response', function(msg) {
        $("#player-disconnect").text(msg.data);
        $("#player-status").text(msg.message);

        socket.disconnect();
    });

    socket.on('connected to game', function(msg) {
        $("#player-waiting").hide();
        $("#player-status").text(msg.data);
    });
});
