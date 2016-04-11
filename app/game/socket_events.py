import queue, uuid
from app import socketio
from flask import session
from flask_socketio import emit, join_room, rooms


class SetQueue(queue.Queue):
    def _init(self, maxsize):
        self.queue = set()

    def _put(self, item):
        self.queue.add(item)

    def _get(self):
        return self.queue.pop()


class Client:
    def __init__(self, client_username, client_id):
        self.username = client_username
        self.id = client_id
        self.opponent_id = ''

    def add_opponent(self, opponent_id):
        self.opponent_id = opponent_id


class Clients:
    connected_clients = {}

    def add_client(self, client_id, client):
        self.connected_clients[client_id] = client

    def get_client_by_id(self, client_id):
        if client_id in self.connected_clients.keys():
            return self.connected_clients.get(client_id)

    def get_clients(self):
        return self.connected_clients


class Rooms:
    rooms = {}

    def get_client_room(self, client_obj):
        return [room_id for room_id, clients in self.rooms.items() if client_obj in clients]

    def get_next_free_room(self):
        try:
            return [room_id for room_id in self.rooms if len(self.rooms[room_id]) < 2][0]
        except IndexError:
            return False

    def add_client(self, room_id, client):
        self.rooms[room_id].append(client)

    def create_room(self, client):
        room_id = str(uuid.uuid4())
        self.rooms[room_id] = [client]

    def get_rooms(self):
        return self.rooms

player_queue = SetQueue()
connected_clients = Clients()
room = Rooms()


@socketio.on('connect', namespace='/game')
def connect_event():
    global player_queue

    new_client = Client(session['username'], session['_id'])
    connected_clients.add_client(session['_id'], new_client)

    player_queue.put(new_client.id)

    if not room.get_next_free_room():
        room.create_room(new_client)
    else:
        room.add_client(room.get_next_free_room(), new_client)

    print(room.get_rooms())
    client_room = room.get_client_room(new_client)
    join_room(str(client_room))
    print(rooms())

    if player_queue.qsize() % 2 == 0 and player_queue.qsize() > 0:

        player1_id = player_queue.get()
        player2_id = player_queue.get()

        player1 = connected_clients.get_client_by_id(player1_id)
        player2 = connected_clients.get_client_by_id(player2_id)

        player1.add_opponent(player2_id)
        player2.add_opponent(player1_id)

        emit('connected to game', {'data': player1.username + ' vs ' + player2.username}, room=str(client_room))


@socketio.on('disconnect', namespace='/game')
def disconnect():
    current_client = connected_clients.get_client_by_id(session['_id'])
    client_room = room.get_client_room(current_client)

    if len(client_room) > 0:
        del room.rooms[client_room[0]]

    emit('server response', {'data': current_client.username + ' disconnected',
                             'message': 'You should start another session.'}, room=str(client_room))

    print(current_client.username + " disconnected")
