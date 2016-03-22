from flask.ext.script import Manager
from app import app
from db_manage import ServerStart, DbMigrate, DbDowngrade, DbUpgrade, DbCreate


manager = Manager(app)

manager.add_command('create', DbCreate())
manager.add_command('migrate', DbMigrate())
manager.add_command('upgrade', DbUpgrade())
manager.add_command('downgrade', DbDowngrade())
manager.add_command('startserver', ServerStart())

if __name__ == "__main__":
    manager.run()
