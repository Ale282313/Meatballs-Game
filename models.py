from app import db
from flask.ext.login import UserMixin
from datetime import datetime


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, index=True)
    password = db.Column(db.String(60))
    email = db.Column(db.String(120), unique=True)
    first_name = db.Column(db.String(40))
    last_name = db.Column(db.String(40))
    games = db.relationship('Game',
                            secondary='player',
                            backref=db.backref('players', lazy='select'),
                            lazy='select')

    def __init__(self, username, password, email, first_name, last_name):
        self.username = username
        self.password = password
        self.email = email
        self.first_name = first_name
        self.last_name = last_name

    def __repr__(self):
        return "user_id: {} , username: {}".format(self.id, self.username)

    def __str__(self):
        return "user_id: {} , username: {}".format(self.id, self.username)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    played_date = db.Column(db.DateTime, default=datetime.now())
    winner_id = db.Column(db.Integer)

    def __init__(self, winner_id, played_date=None):
        self.winner_id = winner_id
        self.played_date = played_date

    def __repr__(self):
        return "game_id: {} , winner_id: {}".format(self.id, self.winner_id)

    def __str__(self):
        return "game_id {} , winner_id: {}".format(self.id, self.winner_id)


class Player(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), primary_key=True)
