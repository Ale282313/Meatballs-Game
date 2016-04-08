import queue
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

player_queue = SetQueue()
connected_clients = Clients()


@socketio.on('connect', namespace='/game')
def connect_event():
    global player_queue

    new_client = Client(session['username'], session['_id'])
    connected_clients.add_client(session['_id'], new_client)

    player_queue.put(new_client.id)

    join_room(session['_id'])

    if player_queue.qsize() % 2 == 0 and player_queue.qsize() > 0:

        player1_id = player_queue.get()
        player2_id = player_queue.get()

        player1 = connected_clients.get_client_by_id(player1_id)
        player2 = connected_clients.get_client_by_id(player2_id)

        player1.add_opponent(player2_id)
        player2.add_opponent(player1_id)

        emit('connected to game', {'data': player1.username + ' vs ' + player2.username}, room=player1_id)
        emit('connected to game', {'data': player1.username + ' vs ' + player2.username}, room=player2_id)


@socketio.on('disconnect', namespace='/game')
def disconnect():
    current_client = connected_clients.get_client_by_id(session['_id'])
    emit('server response', {'data': current_client.username + ' disconnected'}, room=current_client.opponent_id)
    print(current_client.username + " disconnected")
