from app import login_manager
from flask import Blueprint, render_template, send_from_directory
from flask_login import login_required, current_user
from werkzeug.exceptions import abort
from .views_methods import read_file

from app.game.game_repository import GameRepository
from app.user.user_repository import UserRepository
from models import User

main = Blueprint('main', __name__)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@main.route('/')
def index():
    return render_template('main/index.html',
                           title='Home')


@main.route('static/<path:path>')
def send_resource(path):
    return send_from_directory('static', path)


@main.route('rules')
def rules():
    game_rules = read_file()
    return render_template('main/rules.html',
                           title='Rules',
                           rules=game_rules)


@main.route('play')
@login_required
def play():
    user_repository = UserRepository()
    game_repository = GameRepository()

    db_user = user_repository.get_user_by_username(current_user.username)
    user_games = game_repository.get_games_count(db_user)

    if db_user is None:
        abort(404)

    game_rules = read_file()

    return render_template('main/play.html',
                           title='Play',
                           rules=game_rules,
                           user_games=user_games)


@main.app_errorhandler(403)
def forbidden(e):
    return render_template('403.html'), 403


@main.app_errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@main.app_errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500
