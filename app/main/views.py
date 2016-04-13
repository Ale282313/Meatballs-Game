from app import login_manager
from flask import Blueprint, render_template
from flask_login import login_required
from models import User

main = Blueprint('main', __name__)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@main.route('/')
def index():
    return render_template('main/index.html',
                           title='Home')


@main.route('rules')
def rules():

    file = open('app/static/resources/game_rules.txt', 'r')
    rules = file.readlines()

    return render_template('main/rules.html',
                           title='Rules',
                           rules=rules)


@main.route('<username>')
@login_required
def play(username):
    from app.game.game_repository import GameRepository
    from app.user.user_repository import UserRepository

    user_repository = UserRepository()
    game_repository = GameRepository()

    db_user = user_repository.get_user_by_username(username)
    user_games = game_repository.get_games_count(db_user)

    if db_user is None:
        return render_template('404.html'), 404

    print(db_user)
    file = open('app/static/resources/game_rules.txt', 'r')
    rules = file.readlines()

    return render_template('main/play.html',
                           title='Play',
                           rules=rules,
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
