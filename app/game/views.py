from flask import Blueprint, render_template
from flask_login import login_required
from flask import request


game = Blueprint('game', __name__)


@game.route('/game')
@login_required
def meatballs_game():
    return render_template('game/game.html')


@game.route('/after')
@login_required
def get_statistics():
    return render_template('game/after_game.html', winner=request.args.get('winner', "undefined"),
                           duration=request.args.get('game_duration', 0),
                           player1_username=request.args.get('player1_username', "undefined"),
                           player1_totalShots=request.args.get('player1_totalShots', 0),
                           player1_hitShots=request.args.get('player1_hitShots', 0),
                           player1_shieldActivation=request.args.get('player1_shieldActivation', 0),
                           player2_username=request.args.get('player2_username', "undefined"),
                           player2_totalShots=request.args.get('player2_totalShots', 0),
                           player2_hitShots=request.args.get('player2_hitShots', 0),
                           player2_shieldActivation=request.args.get('player2_shieldActivation', 0)
                           )
