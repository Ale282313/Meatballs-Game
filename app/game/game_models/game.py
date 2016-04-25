from ..game_repository import GameRepository
from random import uniform
import time

class Game:
    def __init__(self):
        self.gravity = round(uniform(1, 11), 2)
        self.background = self.get_background()
        self.duration = time.time()
        self.after_game_stats = {}

    def update_after_game_stats(self, data):
        self.after_game_stats = data

    def get_background(self):
        if self.gravity < 5:
            return 'moon'
        elif self.gravity < 8:
            return 'mars'
        else:
            return 'earth'

    def get_game_duration(self):
        return time.time() - self.duration

    def update_database(self, loser_username, winner_username):
        game_repository = GameRepository()
        game_repository.add_win(loser_username, winner_username)

