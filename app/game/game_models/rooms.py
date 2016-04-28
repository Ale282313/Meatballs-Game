import uuid


class Rooms:
    def __init__(self):
        self.rooms = {}

    def get_player_by_id(self, player_id):
        for rooms, players in self.rooms.items():
            for player in players:
                if player.id == player_id:
                    return player

    def get_player_room_id(self, player_obj):
        """Returns player's room id.

        This method searches a specific player in the list of players from
        rooms dictionary.

        :param player_obj: A player object.
        :return: It returns a string, the room_id which is a key in rooms
        dictionary.
        """
        for room_id, players in self.rooms.items():
            if player_obj in players:
                return room_id

    def get_next_free_room_id(self):
        """Returns a free room's id.

        This method iterates over the dictionary items and returns a free
        room's id or the id of a new created room.

        :return: It returns a string, the room_id which is a key, if a room is
        found and it also returns an id of a new created room if the first
        return is 'None'.
        """
        for room_id, players in self.rooms.items():
            if len(players) < 2:
                return room_id

        return self.create_room()

    def add_player(self, player):
        """Adds a player in a room.

        This method invokes get_next_free_room_id() and the magic is done
        there and adds a player in a rooms dictionary which key is the room id
        and the value a list of player objects.

        :param player: A player object to be added in rooms dictionary.
        """

        free_room_id = self.get_next_free_room_id()
        self.rooms[free_room_id].append(player)

    def create_room(self):
        """Creates a new room.

        This method creates a new item in rooms dictionary containing a key
        value pair, where the key is a random generated universally unique
        identifier and the value is an empty list.

        :return: A string containing the new room's id.
        """
        room_id = str(uuid.uuid4())
        self.rooms[room_id] = []
        return room_id
