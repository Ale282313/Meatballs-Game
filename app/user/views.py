from flask import Blueprint, render_template, abort
from flask_login import current_user
from ..game.game_repository import GameRepository
from ..user.user_repository import UserRepository

user = Blueprint('user', __name__)


@user.route('/<username>')
def user_profile(username):
    user_repository = UserRepository()
    game_repository = GameRepository()

    db_user = user_repository.get_user_by_username(username)

    user_games = game_repository.get_games_count(db_user)
    user_winning_games = game_repository.get_winning_games_count(db_user)
    user_lost_games = game_repository.get_lost_games_count(db_user)
    user_email = db_user.email
    full_name = "{} {}".format(db_user.first_name, db_user.last_name)

    verify_self_profile = current_user.is_authenticated and current_user.username == username
    is_self_profile = True if verify_self_profile else False

    if db_user is None:
        abort(404)

    return render_template('user/profile.html',
                           user=username,
                           email=user_email,
                           name=full_name,
                           games=user_games,
                           won=user_winning_games,
                           lost=user_lost_games,
                           is_self_profile=is_self_profile
                           )
