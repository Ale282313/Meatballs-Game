$(document).ready(function () {
    startTimer();
    displayGravity();
    
    //initialize most used DOM elements
    var myCannon=$("#my-cannon");
    var myCurrentCooldown=$("#my-current-cooldown");
    var gameBox=$("#game-box");
    var warningMessage = $("#message");
    var myBody = $("#my-body");
    var myMissile = $("#my-missile");
    
    //initialize g - this will be done on the server side, but for now, we do it here
    var g = ((Math.random()*10)+1).toFixed(2);

    $(document).mousemove(function(e){
        var distX = e.pageX - gameBox.offset().left - myBody.width();
        var distY = Math.abs(e.pageY - gameBox.offset().top - gameBox.height())-myBody.height();

        var angle = Math.atan2(distX,distY)*(180/Math.PI);
        if(angle<0) {
          angle=0;
        }
        if(angle>90) {
          angle=90;
        }
        myCannon.css({ "-webkit-transform": 'rotate(' + angle + 'deg)'});
        myCannon.css({ '-moz-transform': 'rotate(' + angle + 'deg)'});
        myCannon.css({ 'transform': 'rotate(' + angle + 'deg)'});
    });
    gameBox.mousedown(function(e){
        if(e.which==1) {
            $('#power').show();
            $('#power').css({
                'left': e.pageX - gameBox.offset().left,
                'right': 'auto',
                'top': e.pageY-gameBox.offset().top-5,
                'bottom': 'auto'});
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
                var distX = e.pageX - gameBox.offset().left;
                var distY = Math.abs(e.pageY - gameBox.offset().top - gameBox.height());
                var angle = Math.atan2(distX-myBody.width(),distY-myBody.height())*(180/Math.PI);
                if(angle<0) {
                  angle=0;
                }
                if(angle>90) {
                  angle=90;
                }
                //compute the actual starting Position of the missile
                var xPos = myCannon.offset().left-1-gameBox.offset().left+1.3*angle;
                var yPos = Math.floor(myCannon.offset().top-1-gameBox.offset().top);
                var startPosition = [xPos,yPos];

                //angle of the shot
                var dx = e.pageX - gameBox.offset().left;
                var dy = Math.abs(e.pageY - gameBox.offset().top - gameBox.height());
                var angle = Math.atan2(dx-myBody.width(),dy-myBody.height())*(180/Math.PI);
                if(Math.atan2(dx-myBody.width(),dy-myBody.height())*(180/Math.PI)-90<0) {
                    var angle = Math.abs(Math.atan2(dx-myBody.width(),dy-myBody.height())*(180/Math.PI)-90);
                }
                else {
                    var angle = -(Math.atan2(dx-myBody.width(),dy-myBody.height())*(180/Math.PI)-90);
                }
                if(angle<0) {
                    angle=0;
                }
                if(angle>90) {
                    angle=90;
                }

                //call myShot - to shot projectile from my cannon
                if(myCurrentCooldown.width()>=Math.floor($("#my-cooldown").width())) {
                    myMissile.css( { display: "inherit" });
                    myCurrentCooldown.css( { width: 0+"px" } );
                    $.when(myShot(startPosition, angle, power) ).then(
                        function(status) {
                            $("#enemy-current-health").css( { width: $("#enemy-current-health").width()-101 + "px" } )
                            if($("#enemy-current-health").width()<=0) {
                                warningMessage.show();
                                warningMessage.text("Ai castigat!");
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
                    warningMessage.text("Shoot cooldown!");
                    warningMessage.show();
                    setTimeout(function hideMessage() { warningMessage.hide(); }, 1000)
                }
                break;
            case 3:
                //right mouse button pressed
                var myDefense = $('#my-defense');
                var myCurrentShield = $("#my-current-shield");
                if(myCurrentShield.width()>=Math.floor($("#my-shield").width())) {
                    myDefense.show();
                    setTimeout(function hideDefense() { myDefense.hide(); }, 3000);
                    myCurrentShield.css( { width: 0+"px" } );
                    shieldCooldownReset();
                }
                else {
                    warningMessage.text("Shield cooldown!");
                    warningMessage.show();
                    setTimeout(function hideMessage() { warningMessage.hide(); }, 1000)
                }
                break;
            default:
                break;
                //alert('You have a strange Mouse!');
        }

    });
    
    function myShot(startPosition, angle, power) {
        var hit = jQuery.Deferred();
        var pro = {x:startPosition[0],
                y:startPosition[1],
                r:10,
                v:power,
                theta: angle };
        var frameCount = 0;
        //X and Y vector
        var v0x = pro.v * Math.cos(pro.theta * Math.PI/180);
        var v0y = pro.v * Math.sin(pro.theta * Math.PI/180);
        //starting coordinates of the missile
        var startX = pro.x;
        var startY = pro.y;

        var timer2 = setInterval(function()
                {
                //mingea zboara cat timp nu iese din ecran
                var enemyDefense = $("#enemy-defense");
                var stop = "fly";
                if(pro.y<gameBox.height()-pro.r && pro.x < gameBox.width())
                {
                myMissile.css( { display: "inline" });
                //daca scutul e invizibil - zboare mai  departe linistit
                if ( enemyDefense.css('display') == 'none'){
                      pro.y = startY - ( v0y * frameCount - (1/2 * g * Math.pow(frameCount,2)) );
                      pro.x = startX + v0x * frameCount;
                }
                //altfel - daca scutul e vizibil
                else {
                    //si mingea nu a ajuns la scut - zboara mai departe linistit
                    var xLimit = pro.x<(gameBox.width()-enemyDefense.width());
                    var yLimit = pro.y<(gameBox.height()-enemyDefense.height()-10);
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
            if(pro.y<gameBox.height()-pro.r) {
                //this hides the missle only if it reached the right side of the game-box
                // the missile remains on the ground if it landed on the ground
                myMissile.css( { display: "none" });
            }
            var enemyBody = $("#enemy-body");        
            if(pro.x>(gameBox.width()-enemyBody.width()) && pro.y>(gameBox.height()-enemyBody.height())) {
                //variable stop remembers where the ball stopped - on the ground or on the shield or enemy hit
                // stop = "enemy hit";
                hit.resolve( "bullseye!" );
            }
            else {
                hit.reject( "missed!" );
            }
            clearInterval(timer2);
          }

          myMissile.css( { left: pro.x + "px", top: pro.y + "px" } );
                    frameCount+=.1;
          }, 1000/200);

        return hit.promise();
    }

    function shotCooldownReset() {
        var shotCooldownTimer = setInterval(function(){
        if(myCurrentCooldown.width()<=Math.floor($("#my-cooldown").width())) {
            myCurrentCooldown.css( { width: myCurrentCooldown.width()+1 + "px"} );
        }
        else { clearInterval(shotCooldownTimer);  }
        }, 1000/40); //takes 5 seconds to refresh the shot
    }
    function shieldCooldownReset() {
        var myCurrentShield = $("#my-current-shield");
        var shieldCooldownTimer = setInterval(function(){
        if(myCurrentShield.width()<=Math.floor($("#my-shield").width())) {
            myCurrentShield.css( { width: myCurrentShield.width()+1 + "px"} );
        }
        else { clearInterval(shieldCooldownTimer); }
        }, 1000/10); //takes 20 seconds to refresh the shot
    }
    
    function displayGravity() {
        //$("#gravity-bars:nth-child(g)").addClass("on");
    }
    function startTimer() {
        var secs = 0;
        var timer = $('#timer');
        setInterval(function() {
        secs+=1;
        if(secs<59) {
            if(secs<10) { timer.text("0" + secs); }
            else { timer.text(secs); }
        }
        else {
            if(secs%60<10) { timer.text(Math.round(secs/60) + ":0" + secs%60); }
            else { timer.text(Math.round(secs/60) + ":" + secs%60); }
        }
    }, 1000);}

    $(document).bind("contextmenu", function(event) {
        event.preventDefault();
    });
});
