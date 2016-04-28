import cmath
import math


class Projectile:
    def __init__(self, start_x, start_y, velocity, angle):
        self.start_x = start_x
        self.start_y = start_y
        self.x = start_x
        self.y = start_y
        self.velocity = velocity
        self.angle = angle
        self.frame_count = 0
        self.vector_0_x = 0
        self.vector_0_y = 0
        self.shot_time = None

    def calculate_vector(self):
        self.vector_0_x = self.velocity * cmath.cos(self.angle * math.PI / 180)
        self.vector_0_y = self.velocity * cmath.sin(self.angle * math.PI / 180)

    def compute_new_y_coordinate(self, gravity):
        self.y = self.start_y - self.vector_0_y * self.frame_count - \
                 (1 / 2 * gravity * math.pow(self.frame_count, 2))

    def compute_new_x_coordinate(self):
        self.x = self.startX + self.vector_0_x * self.frame_count
