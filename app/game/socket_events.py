from flask import session
from flask_socketio import emit, join_room
from app import socketio
from app.game.model.client import Client
from app.game.model.clients import Clients
from app.game.model.rooms import Rooms
from app.game.model.setqueue import SetQueue

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
