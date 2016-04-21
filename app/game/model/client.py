class Client:
    def __init__(self, client_username, client_id, room_sid=None, opponent_obj=None):
        self.username = client_username
        self.id = client_id
        self.room_sid = room_sid
        self.opponent = opponent_obj

    def set_opponent(self, opponent_obj):
        self.opponent = opponent_obj
