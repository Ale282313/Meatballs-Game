import imp
import os.path
from app import db, app
from config import SQLALCHEMY_DATABASE_URI
from config import SQLALCHEMY_MIGRATE_REPO
from flask.ext.script import Command
from migrate.versioning import api


class ServerStart(Command):
    def run(self):
        app.run(debug=True)


class DbCreate(Command):
    def run(self):
        db.create_all()

        if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
            api.create(SQLALCHEMY_MIGRATE_REPO, 'database repository')
            api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
        else:
            api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, api.version(SQLALCHEMY_MIGRATE_REPO))


class DbDowngrade(Command):
    def run(self):
        database_version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
        print('Current database version: ', database_version)


class DbMigrate(Command):
    def run(self):
        db_version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
        migration = SQLALCHEMY_MIGRATE_REPO + ('/versions/%03d_migration.py' % (db_version+1))

        tmp_module = imp.new_module('old_model')
        old_model = api.create_model(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
        exec(old_model, tmp_module.__dict__)
        script = api.make_update_script_for_model(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO,
                                                  tmp_module.meta, db.metadata)

        with open(migration, "wt") as migration_file:
            migration_file.write(script)

        api.upgrade(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)

        print('New migration saved as ', migration)
        print('Current database version: ', db_version)


class DbUpgrade(Command):
    def run(self):
        api.upgrade(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
        database_version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
        print('Current database version: ', database_version)
