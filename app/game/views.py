from flask import Blueprint, render_template
from flask_login import login_required

game = Blueprint('game', __name__)


@game.route('/game')
@login_required
def meatballs_game():
    return render_template('game/game.html')


@game.route('/after')
@login_required
def after():
    return render_template('game/after_game.html')
