import uuid


class Rooms:
    def __init__(self):
        self.rooms = {}

    def get_client_room_id(self, client_obj):
        """Returns client's room id.

        This method searches a specific client in the list of clients from
        rooms dictionary.

        :param client_obj: A client object.
        :return: It returns a string, the room_id which is a key in rooms
        dictionary.
        """
        for room_id, clients in self.rooms.items():
            if client_obj in clients:
                return room_id

    def get_next_free_room_id(self):
        """Returns a free room's id.

        This method iterates over the dictionary items and returns a free
        room's id or the id of a new created room.

        :return: It returns a string, the room_id which is a key, if a room is
        found and it also returns an id of a new created room if the first
        return is 'None'.
        """
        for room_id, clients in self.rooms.items():
            if len(clients) < 2:
                return room_id

        return self.create_room()

    def add_client(self, client):
        """Adds a client in a room.

        This method invokes get_next_free_room_id() and the magic is done
        there and adds a client in a rooms dictionary which key is the room id
        and the value a list of client objects.

        :param client: A client object to be added in rooms dictionary.
        """

        free_room_id = self.get_next_free_room_id()
        self.rooms[free_room_id].append(client)

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
