$(document).ready(function () {
    startTimer();
    displayGravity();
    //initialize DOM elements

    var cannon=$("#my-cannon");
    var myCurrentCooldown=$("#my-current-cooldown");

    var g = ((Math.random()*10)+1).toFixed(2);

    $(document).mousemove(function(e){
        var distX = e.pageX - $("#game-box").offset().left;
        var distY = Math.abs(e.pageY - $("#game-box").offset().top - $("#game-box").height());

        var angle = Math.atan2(distX-$("#my-body").width(),distY-$("#my-body").height())*(180/Math.PI);
        if(angle<0) {
          angle=0;
        }
        if(angle>90) {
          angle=90;
        }
        cannon.css({ "-webkit-transform": 'rotate(' + angle + 'deg)'});
        cannon.css({ '-moz-transform': 'rotate(' + angle + 'deg)'});
        cannon.css({ 'transform': 'rotate(' + angle + 'deg)'});
    });

    $("#game-box").mousedown(function(e){
        switch (e.which) {
            case 1:
                //left mouse button pressed
                $('#power').show();
                $('#power').css({
                'left': e.pageX - $("#game-box").offset().left,
                'right': 'auto',
                'top': e.pageY-$("#game-box").offset().top-5,
                'bottom': 'auto'});
                break;
            case 2:
                //console.log('Middle Mouse button pressed.');
                break;
            case 3:
                //alert('Right Mouse button pressed.');
                break;
            default:
                break;
                //alert('You have a strange Mouse!');
        }
    });

    $(document).mouseup(function(e){
        switch (e.which) {
            case 1:
                //left mouse button pressed
                //power of the shot
                var power = $('#current-power').width()/3;
                $('#power').hide();

                //starting Position of the shot
                //we need the angle of the cannon to compute the starting position
                var distX = e.pageX - $("#game-box").offset().left;
                var distY = Math.abs(e.pageY - $("#game-box").offset().top - $("#game-box").height());
                var angle = Math.atan2(distX-$("#my-body").width(),distY-$("#my-body").height())*(180/Math.PI);
                if(angle<0) {
                  angle=0;
                }
                if(angle>90) {
                  angle=90;
                }
                //compute the actual starting Position of the missile
                var xPos = $("#my-cannon").offset().left-1-$("#game-box").offset().left+1.3*angle;
                var yPos = Math.floor($("#my-cannon").offset().top-1-$("#game-box").offset().top);
                var startPosition = [xPos,yPos];

                //angle of the shot
                var dx = e.pageX - $("#game-box").offset().left;
                var dy = Math.abs(e.pageY - $("#game-box").offset().top - $("#game-box").height());
                var angle = Math.atan2(dx-$("#my-body").width(),dy-$("#my-body").height())*(180/Math.PI);
                if(Math.atan2(dx-$("#my-body").width(),dy-$("#my-body").height())*(180/Math.PI)-90<0) {
                    var angle = Math.abs(Math.atan2(dx-$("#my-body").width(),dy-$("#my-body").height())*(180/Math.PI)-90);
                }
                else {
                    var angle = -(Math.atan2(dx-$("#my-body").width(),dy-$("#my-body").height())*(180/Math.PI)-90);
                }
                if(angle<0) {
                    angle=0;
                }
                if(angle>90) {
                    angle=90;
                }

                //call myShot - to shot projectile from my cannon
                if($("#my-current-cooldown").width()>=Math.floor($("#my-cooldown").width())) {
                    $("#my-missile").css( { display: "inherit" });
                    $("#my-current-cooldown").css( { width: 0+"px" } );
                    console.log(startPosition, angle, power);
                    $.when(myShot(startPosition, angle, power) ).then(
                        function( status ) {
                            $("#enemy-current-health").css( { width: $("#enemy-current-health").width()-101 + "px" } )
                            if($("#enemy-current-health").width()<=0) {
                                $("#message").show();
                                $("#message").text("Ai castigat!");
                            }
                        },
                        function( status ) {
                            //console.log("miss");
                        },
                        function( status ) {
                            //$( "body" ).append( status );
                        }
                    );

                shotCooldownReset();
                }
                else {
                    $("#message").text("Shoot cooldown!");
                    $("#message").show();
                    setTimeout(function hideMessage() { $("#message").hide(); }, 1000)
                }
                break;
            case 3:
                //right mouse button pressed
                if($("#my-current-shield").width()>=Math.floor($("#my-shield").width())) {
                    $('#my-defense').show();
                    //maked the defense visible for 3 seconds
                    setTimeout(function hideDefense() { $("#my-defense").hide(); }, 3000);
                    $("#my-current-shield").css( { width: 0+"px" } );
                    shieldCooldownReset();
                }
                else {
                    $("#message").text("Shield cooldown!");
                    $("#message").show();
                    setTimeout(function hideMessage() { $("#message").hide(); }, 1000)
                }
                break;
            default:
                break;
                //alert('You have a strange Mouse!');
        }

    });

    function shotCooldownReset() {
        var shotCooldownTimer = setInterval(function(){
        if($("#my-current-cooldown").width()<=Math.floor($("#my-cooldown").width())) {
            $("#my-current-cooldown").css( { width: $("#my-current-cooldown").width()+1 + "px"} );
        }
        else { clearInterval(shotCooldownTimer);  }
        }, 1000/40); //takes 5 seconds to refresh the shot
    }

    function shieldCooldownReset() {
        var shieldCooldownTimer = setInterval(function(){
        if($("#my-current-shield").width()<=Math.floor($("#my-shield").width())) {
            $("#my-current-shield").css( { width: $("#my-current-shield").width()+1 + "px"} );
        }
        else { clearInterval(shieldCooldownTimer); }
        }, 1000/10); //takes 20 seconds to refresh the shot
    }

    function myShot(startPosition, angle, power) {
        var hit = jQuery.Deferred();
        var pro = {x:startPosition[0],
                y:startPosition[1],
                r:10,
                v:power,
                theta: angle };

        var missile=$("#my-missile");
        var frameCount = 0;
        var v0x = pro.v * Math.cos(pro.theta * Math.PI/180);
        var v0y = pro.v * Math.sin(pro.theta * Math.PI/180);
        var startX = pro.x;
        var startY = pro.y;

        var timer2 = setInterval(function()
                {
                //mingea zboara cat timp nu iese din ecran
                var stop = "fly";
                if(pro.y<$("#game-box").height()-pro.r && pro.x < $("#game-box").width())
                {
                $("#my-missile").css( { display: "inline" });
                //daca scutul e invizibil - zboare mai  departe linistit
                if ( $("#enemy-defense").css('display') == 'none'){
                      pro.y = startY - ( v0y * frameCount - (1/2 * g * Math.pow(frameCount,2)) );
                      pro.x = startX + v0x * frameCount;
                }
                //altfel - daca scutul e vizibil
                else {
                    //si mingea nu a ajuns la scut - zboara mai departe linistit
                    var xLimit = pro.x<($("#game-box").width()-$("#enemy-defense").width());
                    var yLimit = pro.y<($("#game-box").height()-$("#enemy-defense").height()-10);
                    if(xLimit || yLimit) {
                        pro.y = startY - ( v0y * frameCount - (1/2 * g * Math.pow(frameCount,2)) );
                        pro.x = startX + v0x * frameCount;
                    }
                    //daca e vizibil si a ajuns la scut
                    else {
                    stop="shield";
                        //mingea se opreste la scut daca e vizibil
                    clearInterval(timer2);
                    }
                }
                }
                //mingea trece de scut daca e invizibil
            else {
            if(stop=="fly") {
              stop = "ground";
            }
            //variable stop remembers where the ball stopped - on the ground or on the shield
            if(pro.y<$("#game-box").height()-pro.r) {
              //this hides the missle only if it reached the right side of the game-box
              //the missile remains on the ground if it landed on the ground
              $("#my-missile").css( { display: "none" });
            }
            if(pro.x>($("#game-box").width()-$("#enemy-body").width()) && pro.y>($("#game-box").height()-$("#enemy-body").height())) {
              //variable stop remembers where the ball stopped - on the ground or on the shield or enemy hit
               stop = "enemy hit";
               hit.resolve( "bullseye!" );
            }
            else {
              hit.reject( "missed!" );
            }

            clearInterval(timer2);
          }

          $("#my-missile").css( { left: pro.x + "px", top: pro.y + "px" } );
                    frameCount+=.1;
        //aici mai trebuie sa ma joc in functie de g - cred
          }, 1000/1000);

        return hit.promise();
    }

    function displayGravity() {
        //$("#gravity-bars:nth-child(g)").addClass("on");
    }
    function startTimer() {
        var secs = 0;
        var mins = 0;
        setInterval(function() {
        secs+=1;
        if(secs<59) {
            if(secs<10) {
                $('#timer').text("0" + secs);
            }
            else {
                $('#timer').text(secs);
            }
        }
        else {
            if(secs%60<10) {
                $('#timer').text(Math.round(secs/60) + ":0" + secs%60);
            }
            else {
                $('#timer').text(Math.round(secs/60) + ":" + secs%60);
            }
        }
    }, 1000);}
    $(document).bind("contextmenu", function(event) {
        event.preventDefault();
    });
});
