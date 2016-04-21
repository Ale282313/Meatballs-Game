from flask import session, request
from flask_socketio import emit, join_room
from app import socketio

from .game_models.player import Player
from app.game.model.clients import Clients
from app.game.model.rooms import Rooms
from app.game.model.setqueue import SetQueue
from .game_models.game import Game
from app.game.config_loader import load_player_config

player_queue = SetQueue()
connected_clients = Clients()
client_rooms = Rooms()
player_config = load_player_config()


@socketio.on('connect', namespace='/game')
def connect_event():
    global player_queue

    new_player = Player(session['username'], session['_id'], request.sid, **player_config)
    connected_clients.add_client(new_player)

    player_queue.put(new_player.id)
    client_rooms.add_client(new_player)

    client_room = client_rooms.get_client_room_id(new_player)
    join_room(client_room)

    if not player_queue.qsize() % 2 == 0 or player_queue.empty():
        return
    
    game = Game()

    player1_id = player_queue.get()
    player2_id = player_queue.get()

    player1 = connected_clients.get_client_by_id(player1_id)
    player2 = connected_clients.get_client_by_id(player2_id)

    player1.set_opponent(player2)
    player2.set_opponent(player1)

    emit('200', {'gravity': game.gravity, 'background': game.background}, room=client_room)

    emit('201', {'player1': player1.username,
                 'player2': player2.username}, room=player1.room_sid)

    emit('202', {'player1': player2.username,
                 'player2': player1.username}, room=player2.room_sid)


@socketio.on('disconnect', namespace='/game')
def disconnect():
    current_client = connected_clients.get_client_by_id(session['_id'])
    client_room_id = client_rooms.get_client_room_id(current_client)

    if player_queue.qsize() % 2 == 1 and current_client.id in player_queue.queue:
        player_queue.remove_item(current_client.id)

    if client_room_id:
        del client_rooms.rooms[client_room_id]

    emit('300', {'data': current_client.username + ' disconnected',
                 'message': 'You should start another session.'}, room=client_room_id)

    print(current_client.username + " disconnected")


@socketio.on('210', namespace='/game')
def rotate_cannon(data):
    current_client = connected_clients.get_client_by_id(session['_id'])
    opponent_sid = current_client.opponent.room_sid
    emit('210', data, room=opponent_sid)


@socketio.on('220', namespace='/game')
def shot(data):
    current_client = connected_clients.get_client_by_id(session['_id'])
    opponent_sid = current_client.opponent.room_sid
    emit('220', data, room=opponent_sid)


@socketio.on('230', namespace='/game')
def shield():
    current_client = connected_clients.get_client_by_id(session['_id'])
    opponent_sid = current_client.opponent.room_sid

    emit('231', room=opponent_sid)
    emit('232', room=current_client.room_sid)

    # if player1.activate_shield():
    #     emit('231', room=opponent_sid)
    #     emit('232', room=current_client.room_sid)
    # else:
    #     # TODO: Emit shield cooldown message

    # emit('233', room=opponent_sid)
    # emit('234', room=current_client.room_sid)


@socketio.on('240', namespace='/game')
def cooldown_reset():
    current_client = connected_clients.get_client_by_id(session['_id'])
    opponent_sid = current_client.opponent.room_sid
    emit('241', room=opponent_sid)
    emit('242', room=current_client.room_sid)


@socketio.on('250', namespace='/game')
def missile_hit(data):
    current_client = connected_clients.get_client_by_id(session['_id'])
    opponent_sid = current_client.opponent.room_sid
    emit('251', data, room=opponent_sid)
    emit('252', data, room=current_client.room_sid)


@socketio.on('261', namespace='/game')
def message(data):
    current_client = connected_clients.get_client_by_id(session['_id'])
    opponent_sid = current_client.opponent.room_sid
    emit('261', data, room=opponent_sid)


@socketio.on('262', namespace='/game')
def message(data):
    current_client = connected_clients.get_client_by_id(session['_id'])
    emit('262', data, room=current_client.room_sid)


@socketio.on('290', namespace='/game')
def game_over(data):
    current_client = connected_clients.get_client_by_id(session['_id'])
    client_room_id = client_rooms.get_client_room_id(current_client)
    emit('290', data, room=client_room_id)
