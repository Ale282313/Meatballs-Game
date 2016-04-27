import datetime
from .game import Game


class Player():
    def __init__(self, player_username, player_id, room_sid=None, **player_config):

        self.game = Game()
        self.username = player_username
        self.id = player_id
        self.room_sid = room_sid
        self.opponent = None
        self.current_health = player_config.get('current_health')
        self.damage = player_config.get('damage')
        self.shot_cooldown = player_config.get('shot_cooldown')
        self.shield_cooldown = player_config.get('shield_cooldown')
        self.shield_duration = player_config.get('shield_duration')
        self.total_shots = player_config.get('total_shots')
        self.hit_shots = player_config.get('hit_shots')
        self.shield_activation = player_config.get('shield_activation')
        self.last_shot_time = (datetime.datetime.utcnow() - datetime.timedelta(seconds=self.shot_cooldown))
        self.last_shield_time = (datetime.datetime.utcnow() - datetime.timedelta(seconds=self.shield_cooldown))

    def set_opponent(self, opponent_obj):
        self.opponent = opponent_obj

    def missile_hit(self):
        self.current_health -= self.damage
        self.hit_shots += 1
        if self.is_dead():
            return 0
        return self.current_health

    def is_dead(self):
        if self.current_health <= 0:
            return True
        return False

    def is_valid_shot(self):
        if (datetime.datetime.utcnow() - self.last_shot_time).total_seconds() > self.shot_cooldown:
            self.total_shots += 1
            self.last_shot_time = datetime.datetime.utcnow()
            return True

        return False

    def is_valid_shield(self):
        if (datetime.datetime.utcnow() - self.last_shield_time).total_seconds() > self.shot_cooldown:
            self.shield_activation += 1
            self.last_shield_time = datetime.datetime.utcnow()
            return True

        return False
