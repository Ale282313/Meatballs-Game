import queue
import uuid
from app import socketio
from flask import session
from flask_socketio import emit, join_room


class SetQueue(queue.Queue):
    def _init(self, maxsize):
        self.queue = set()

    def _put(self, item):
        self.queue.add(item)

    def _get(self):
        return self.queue.pop()

    def remove_item(self, client_id):
        return self.queue.remove(client_id)

    def get_queue(self):
        return self.queue


class Client:
    def __init__(self, client_username, client_id):
        self.username = client_username
        self.id = client_id


class Clients:
    connected_clients = {}

    def add_client(self, client):
        self.connected_clients[client.id] = client

    def get_client_by_id(self, client_id):
        if client_id in self.connected_clients.keys():
            return self.connected_clients.get(client_id, None)

    def get_clients(self):
        return self.connected_clients


class Rooms:
    rooms = {}

    def get_client_room_id(self, client_obj):
        for room_id, clients in self.rooms.items():
            if client_obj in clients:
                return room_id

    def get_next_free_room_id(self):
        for room_id, clients in self.rooms.items():
            if len(clients) < 2:
                return room_id

        return self.create_room()

    def add_client(self, client):
        free_room_id = self.get_next_free_room_id()
        self.rooms[free_room_id].append(client)

    def create_room(self):
        room_id = str(uuid.uuid4())
        self.rooms[room_id] = []
        return room_id

    def get_rooms(self):
        return self.rooms

player_queue = SetQueue()
connected_clients = Clients()
rooms = Rooms()


@socketio.on('connect', namespace='/game')
def connect_event():
    global player_queue

    new_client = Client(session['username'], session['_id'])
    connected_clients.add_client(new_client)

    player_queue.put(new_client.id)

    rooms.add_client(new_client)

    client_room = rooms.get_client_room_id(new_client)
    join_room(client_room)

    if player_queue.qsize() % 2 == 0 and not player_queue.empty():

        player1_id = player_queue.get()
        player2_id = player_queue.get()

        player1 = connected_clients.get_client_by_id(player1_id)
        player2 = connected_clients.get_client_by_id(player2_id)

        emit('connected to game', {'data': player1.username + ' vs ' + player2.username}, room=client_room)


@socketio.on('disconnect', namespace='/game')
def disconnect():
    current_client = connected_clients.get_client_by_id(session['_id'])
    client_room_id = rooms.get_client_room_id(current_client)

    if player_queue.qsize() % 2 == 1:
        player_queue.remove_item(session['_id'])

    if client_room_id:
        del rooms.rooms[client_room_id]

    emit('server response', {'data': current_client.username + ' disconnected',
                             'message': 'You should start another session.'}, room=client_room_id)

    print(current_client.username + " disconnected")
