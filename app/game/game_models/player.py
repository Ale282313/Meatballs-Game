import time


class Player():
    def __init__(self, player_username, player_id, room_sid=None, **player_config):

        self.username = player_username
        self.id = player_id
        self.room_sid = room_sid
        self.opponent = None
        self.current_health = player_config.get('current_health')
        self.damage = player_config.get('damage')
        self.shot_cooldown = player_config.get('shot_cooldown')
        self.shield_cooldown = player_config.get('shield_cooldown')
        self.shield_duration = player_config.get('shield_duration')
        self.has_shield = player_config.get('has_shield')
        self.total_shots = player_config.get('total_shots')
        self.hit_shots = player_config.get('hit_shots')
        self.last_shot_time = time.time() - self.shot_cooldown
        self.last_shield_time = time.time() - self.shield_cooldown

    def set_opponent(self, opponent_obj):
        self.opponent = opponent_obj

    def missile_hit(self):
        self.current_health -= self.damage
        print(self.current_health)
        if self.is_dead():
            return True
        return self.current_health

    def is_dead(self):
        if self.current_health <= 0:
            return True
        return False

    def shot(self):
        if time.time() - self.last_shot_time > self.shot_cooldown:
            self.last_shot_time = time.time()
            return True
        else:
            return False

    def activate_shield(self):
        if time.time() - self.last_shield_time > self.shield_cooldown:
            self.last_shield_time = time.time()
            return True
        else:
            return False

    # def shot(self):
    #     if not self.has_shot_cooldown:
    #         if self.projectile.compute_target():
    #             return self.missile_hit()
    #         # TODO: other cases

    # def activate_shield(self):
    #     if not self.has_shield_cooldown:
    #         return True
    #     return False

    # # shot will receive additional parameters. This hard code is
    # def shot(self):
    #     self.verify_cooldown_shot_time()
    #     if self.shot_cooldown:
    #         # 223 = shot cooldown not ready
    #         return 223
    #     else:
    #         self.total_shots += 1
    #         # compute shot
    #         self.projectile.shot_time = time.time()
    #         self.projectile.calculate_vector()
    #         # if not out of bounds
    #         while 0 < self.projectile.x < 1200 and 0 < self.projectile.y < 500:
    #             self.projectile.y = self.projectile.compute_new_y_coordinate(self.game.gravity)
    #             self.projectile.x = self.projectile.compute_new_x_coordinate()
    #             print(self.projectile.x, self.projectile.y, self.projectile.frame_count)
    #             # if enemy hit
    #             if self.has_shield:
    #                 if 1000 < self.projectile.x < 1200 and 0 < self.projectile.y < 120:
    #                     self.shield_hit_shots += 1
    #                     # 224 = enemy shield hit
    #                     return 224
    #                 else:
    #                     # 222 = missed shot
    #                     return 222
    #             if 1099 < self.projectile.x < 1200 and 0 < self.projectile.y < 60:
    #                 self.hit_shots += 1
    #                 # 221 = enemy hit
    #                 return 221
    #             elif self.projectile.y == 0:
    #                 # 222 = missed shot
    #                 return 222
    #             self.projectile.frame_count += 1
