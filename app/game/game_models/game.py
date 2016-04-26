import time
from random import uniform

class Game:
    def __init__(self):
        self.gravity = round(uniform(1, 11), 2)
        self.background = self.get_background()
        self.start_time = time.time()

    def get_background(self):
        if self.gravity < 5:
            return 'moon'
        elif self.gravity < 8:
            return 'mars'
        else:
            return 'earth'

    def get_game_duration(self):
        return time.time() - self.start_time

