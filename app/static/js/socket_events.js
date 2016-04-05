$(document).ready(function () {
    var socket = io.connect('http://'.concat(document.domain).concat(':').concat(location.port).concat('/game'));
    socket.on('my response', function(msg) {
        $('#player-status').text(msg.data);
    });
});
