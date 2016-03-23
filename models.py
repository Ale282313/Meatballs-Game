from app import db
from flask.ext.login import UserMixin


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, index=True)
    password = db.Column(db.String(60))

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return "User: {} {}".format(self.id, self.username)

    def __str__(self):
        return "User: {} {}".format(self.id, self.username)
