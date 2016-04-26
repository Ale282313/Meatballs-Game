from app import socketio
from app.game.config_loader import load_player_config
from app.game.game_models.rooms import Rooms
from app.game.game_models.setqueue import SetQueue
from .game_models.game import Game
from .game_models.player import Player
from flask import session, request, redirect, url_for
from flask_socketio import emit, join_room

player_queue = SetQueue()
player_rooms = Rooms()
player_config = load_player_config()

@socketio.on('connect', namespace='/game')
def connect_event():
    global player_queue

    new_player = Player(session['username'], session['_id'], request.sid, **player_config)

    player_queue.put(new_player.id)
    player_rooms.add_player(new_player)

    player_room = player_rooms.get_player_room_id(new_player)
    join_room(player_room)

    if not player_queue.qsize() % 2 == 0 or player_queue.empty():
        return
    
    game = Game()

    player1_id = player_queue.get()
    player2_id = player_queue.get()

    player1 = player_rooms.get_player_by_id(player1_id)
    player2 = player_rooms.get_player_by_id(player2_id)

    player1.set_game(game)
    player2.set_game(game)

    player1.set_opponent(player2)
    player2.set_opponent(player1)

    player_config.update({'player1_username': player1.username})
    player_config.update({'player2_username': player2.username})
    player_config.update({'gravity': game.gravity})
    player_config.update({'background': game.background})

    emit('200', player_config, room=player_room)

    emit('201', player_config, room=player2.room_sid)

    emit('202', player_config, room=player1.room_sid)


@socketio.on('disconnect', namespace='/game')
def disconnect():
    current_player = player_rooms.get_player_by_id(session['_id'])
    player_room_id = player_rooms.get_player_room_id(current_player)

    if player_queue.qsize() % 2 == 1 and current_player.id in player_queue.queue:
        player_queue.remove_item(current_player.id)

    emit('300', {'data': current_player.username + ' disconnected',
                 'message': 'You should start another session.'}, room=player_room_id)

    player_rooms.delete_player_from_room(current_player)


@socketio.on('210', namespace='/game')
def rotate_cannon(data):
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid
    emit('210', data, room=opponent_sid)


@socketio.on('220', namespace='/game')
def shot(data):
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid

    # verify if shot is valid
    if current_player.is_valid_shot():
        emit('221', data, room=opponent_sid)
        emit('222', data, room=current_player.room_sid)
    else:
        emit('262', {'message': 'Shot cooldown!'}, room=current_player.room_sid)


@socketio.on('230', namespace='/game')
def shield():
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid

    # verify if shield is valid
    if current_player.is_valid_shield():
        emit('231', room=opponent_sid)
        emit('232', room=current_player.room_sid)
    else:
        emit('262', {'message': 'Shield cooldown!'}, room=current_player.room_sid)


@socketio.on('250', namespace='/game')
def missile_hit(data):
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid
    hit_points = current_player.missile_hit()
    room = player_rooms.get_player_room_id(current_player)

    emit('251', data['damage'], room=opponent_sid)
    emit('252', data['damage'], room=current_player.room_sid)

    if hit_points==0:
        emit('290', data['whoShot'], room=room)
        game = current_player.game
        game.update_database(current_player.opponent.username, current_player.username)


@socketio.on('261', namespace='/game')
def message(data):
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid
    emit('261', data, room=opponent_sid)


@socketio.on('262', namespace='/game')
def message(data):
    current_player = player_rooms.get_player_by_id(session['_id'])
    emit('262', data, room=current_player.room_sid)


@socketio.on('290', namespace='/game')
def game_over(winner_username):
    player1 = player_rooms.get_player_by_id(session['_id'])
    player2 = player1.opponent
    game = player1.game
    room = player_rooms.get_player_room_id(player1)

    emit('291', {'winner':winner_username,
                'game_duration':round(game.get_game_duration()),
                'player1_username':player1.username,
                'player1_totalShots':player1.total_shots,
                'player1_hitShots':player1.hit_shots,
                'player1_shieldActivation':player1.shield_activation,
                'player2_username':player2.username,
                'player2_totalShots':player2.total_shots,
                'player2_hitShots':player2.hit_shots,
                'player2_shieldActivation':player2.shield_activation
    }, room=room)


