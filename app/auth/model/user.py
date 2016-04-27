class GameUser:

    def __init__(self):
        self.users = {}

    def add_user(self, username, games):
        self.users[username] = games

    def delete_user(self, username):
        del self.users[username]
