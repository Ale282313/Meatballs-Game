from flask import Blueprint, render_template, request, session, redirect, url_for
from flask_login import login_required
from flask import request, session

from .socket_events import player_rooms


game = Blueprint('game', __name__)


@game.route('/game')
@login_required
def meatballs_game():
    return render_template('game/game.html')




@game.route('/aftercancer')
@login_required
def after():
    winner = request.args.get('username')
    session_id = request.args.get('session_id')
    player1 = player_rooms.get_player_by_id(session_id)
    player2 = player1.opponent
    game = player1.game

#TODO: fix it FFS
    return redirect(url_for('game.after', winner=winner,
                        duration=game.get_game_duration(),
                        player1_username=player1.username,
                        player1_totalShots=player1.total_shots,
                        player1_hitShots=player1.hit_shots,
                        player1_shieldActivation=player1.shield_activation,
                        player2_username=player2.username,
                        player2_totalShots=player2.total_shots,
                        player2_hitShots=player2.hit_shots,
                        player2_shieldActivation=player2.shield_activation
                        ))

