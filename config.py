import os

basedir = os.path.abspath(os.path.dirname(__file__))

WTF_CSRF_ENABLED = False
SECRET_KEY = 'meatballs-game-yonder'

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_versions')
SQLALCHEMY_TRACK_MODIFICATIONS = True

DEBUG = False
