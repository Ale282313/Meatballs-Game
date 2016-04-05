$(document).ready(function () {
    var socket = io.connect('http://'.concat(document.domain, ':', location.port, '/game'));
    socket.on('my response', function(msg) {
        $('#player-status').text(msg.data);
    });
});
