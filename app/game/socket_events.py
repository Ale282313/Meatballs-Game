import queue, uuid
from app import socketio
from flask import session, request
from flask_socketio import emit, join_room

player_queue = queue.Queue()
current_games = {}
connected_clients = {}


class Game:
    def __init__(self, player1, player2, game_id):
        self.player1 = player1
        self.player2 = player2
        self.game_id = game_id


class Client:
    def __init__(self, client_username, client_id):
        self.username = client_username
        self.opponentid = ''
        self.gameid = ''
        self.id = client_id


@socketio.on('connect', namespace='/game')
def connect_event():
    global player_queue
    global connected_clients

    new_client = Client(session['username'], request.sid)

    connected_clients[request.sid] = new_client

    join_room(request.sid)

    player_queue.put({'username': session['username'], 'id': request.sid})

    if player_queue.qsize() % 2 == 0 and player_queue.qsize() > 0:
        player1 = player_queue.get()
        player2 = player_queue.get()

        for room in [player1['id'], player2['id']]:
            if room == request.sid:
                emit('connected to game', {'data': player1['username'] + ' vs ' + player2['username']}, room=player1['id'])
            else:
                emit('connected to game', {'data': player1['username'] + ' vs ' + player2['username']}, room=player2['id'])


@socketio.on('join', namespace='/game')
def join(message):
    emit('test')


@socketio.on('disconnect', namespace='/game')
def disconnect_event():
    print('disconnected')


@socketio.on('goodbye', namespace='/game')
def goodbye(message):
    print(message)
