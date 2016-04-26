from flask import Blueprint, render_template, request, session, redirect, url_for
from flask_login import login_required
from flask import request, session

from .socket_events import player_rooms


game = Blueprint('game', __name__)


@game.route('/game')
@login_required
def meatballs_game():
    return render_template('game/game.html')


@game.route('/after')
@login_required
def after():
    return render_template('game/after_game.html')


@game.route('/statistics')
@login_required
def get_statistics():
    winner = request.args.get('winner')
    game_duration = request.args.get('game_duration')
    player1_username = request.args.get('player1_username')
    player1_total_shots = request.args.get('player1_totalShots')
    player1_hit_shots = request.args.get('player1_hitShots')
    player1_shield_activation = request.args.get('player1_shieldActivation')
    player2_username = request.args.get('player2_username')
    player2_total_shots = request.args.get('player2_totalShots')
    player2_hit_shots = request.args.get('player2_hitShots')
    player2_shield_activation = request.args.get('player2_shieldActivation')


    return redirect(url_for('game.after', winner=winner,
                        duration=game_duration,
                        player1_username=player1_username,
                        player1_totalShots=player1_total_shots,
                        player1_hitShots=player1_hit_shots,
                        player1_shieldActivation=player1_shield_activation,
                        player2_username=player2_username,
                        player2_totalShots=player2_total_shots,
                        player2_hitShots=player2_hit_shots,
                        player2_shieldActivation=player2_shield_activation
                        ))

