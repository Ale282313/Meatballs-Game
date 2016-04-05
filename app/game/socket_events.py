from app import socketio
from flask_socketio import emit


@socketio.on('connect', namespace='/game')
def test_connect():
    emit('my response', {'data': 'Connected'})
