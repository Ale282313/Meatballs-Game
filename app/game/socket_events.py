from flask import session, request, render_template
from app import socketio
from app.game.game_models.rooms import Rooms
from app.game.game_models.setqueue import SetQueue
from flask_socketio import emit, join_room
from .game_models.game import Game
from app.game.config_loader import load_player_config
from ..user.user_repository import UserRepository
from .. import db
from .game_models.player import Player

player_queue = SetQueue()
player_rooms = Rooms()
player_config = load_player_config()

user_repository = UserRepository()

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
    if current_player.shot():
        emit('221', data, room=opponent_sid)
        emit('222', data, room=current_player.room_sid)
    else:
        emit('262', {'message': 'Shot cooldown!'}, room=current_player.room_sid)


@socketio.on('230', namespace='/game')
def shield():
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid

    # verify if shield is valid
    if current_player.activate_shield():
        emit('231', room=opponent_sid)
        emit('232', room=current_player.room_sid)
    else:
        emit('262', {'message': 'Shield cooldown!'}, room=current_player.room_sid)


@socketio.on('240', namespace='/game')
def shield_cooldown_reset():
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid
    emit('241', room=opponent_sid)
    emit('242', room=current_player.room_sid)


@socketio.on('250', namespace='/game')
def missile_hit(data):
    current_player = player_rooms.get_player_by_id(session['_id'])
    opponent_sid = current_player.opponent.room_sid
    emit('251', data, room=opponent_sid)
    emit('252', data, room=current_player.room_sid)


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
def game_over(data):
    current_player = player_rooms.get_player_by_id(session['_id'])
    player_room_id = player_rooms.get_player_room_id(current_player)

    opponent_player = current_player.opponent
    opponent_user = user_repository.get_user_by_username(opponent_player.username)

    winner_username = data
    current_user = user_repository.get_user_by_username(winner_username)
    current_user_id = user_repository.get_user_id(winner_username)

    game = Game(current_user_id)

    current_user.games.append(game)
    opponent_user.games.append(game)
    db.session.commit()

    emit('290', data, room=player_room_id)
    return render_template('game/after_game.html',
                           title='After Game')
