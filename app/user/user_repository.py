from models import User


class UserRepository:

    @staticmethod
    def get_user_by_username(username):
        return User.query.filter_by(username=username).first()

    def get_user_id(self, username):
        user = self.get_user_by_username(username)
        return user.id
