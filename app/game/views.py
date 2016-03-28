from flask import Blueprint, render_template, redirect, url_for

game = Blueprint('game', __name__)


@game.route('/game')
def meatballs_game():
    return render_template('game/game.html')
