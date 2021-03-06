from app.user.user_repository import UserRepository
from app import db
import models

user_repository = UserRepository()


class GameRepository:

    @staticmethod
    def get_games_count(user_object):
        return len(user_object.games)

    @staticmethod
    def get_winning_games_count(user_obj):
        return len([game for game in user_obj.games if game.winner_id == user_obj.id])

    @staticmethod
    def get_lost_games_count(user_obj):
        return len([game for game in user_obj.games if game.winner_id != user_obj.id])

    @staticmethod
    def end_game(loser_username, winner_username):
        opponent = user_repository.get_user_by_username(loser_username)

        winner = user_repository.get_user_by_username(winner_username)
        winner_id = user_repository.get_user_id(winner_username)

        db_game = models.Game(winner_id)

        winner.games.append(db_game)
        opponent.games.append(db_game)
        db.session.commit()
