from models import User


class UserRepository:
    def get_user_by_username(self, username):
        return User.query.filter_by(username=username).first()
