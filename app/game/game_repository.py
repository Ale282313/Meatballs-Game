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
