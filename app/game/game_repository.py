class GameRepository:
    def get_games_count(self, user_object):
        return len(user_object.games)

    def get_winning_games_count(self, user_obj):
        return len([game for game in user_obj.games if game.winner_id == user_obj.id])

    def get_lost_games_count(self, user_obj):
        return len([game for game in user_obj.games if game.winner_id != user_obj.id])
