$(document).ready(function () {

    var cannon = $("#my-cannon");
    var cannonCenter = [cannon.offset().left, cannon.offset().top];

    $(document).mousemove(function (e) {
        var angle = Math.atan2(e.pageX - cannonCenter[0], -(e.pageY - cannonCenter[1])) * (180 / Math.PI);

        cannon.css({"-webkit-transform": 'rotate(' + angle + 'deg)'});
        cannon.css({'-moz-transform': 'rotate(' + angle + 'deg)'});
        cannon.css({'transform': 'rotate(' + angle + 'deg)'});

    });
    $("#game-box").click(function(){
        alert("Ai tras !!!");
    });
});
