from flask import Flask
from flask.ext.bcrypt import Bcrypt
from flask.ext.login import LoginManager
from flask.ext.sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
socketio = SocketIO(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

toolbar = DebugToolbarExtension(app)

# TODO: Fix blueprints registrations to be generic in future.
from .auth.views import auth as auth_blueprint
app.register_blueprint(auth_blueprint, url_prefix='/auth')

from .main.views import main as main_blueprint
app.register_blueprint(main_blueprint, url_prefix='/')

from .user.views import user as user_blueprint
app.register_blueprint(user_blueprint, url_prefix='/user')

from .game.views import game as game_blueprint
app.register_blueprint(game_blueprint, url_prefix='/game')
