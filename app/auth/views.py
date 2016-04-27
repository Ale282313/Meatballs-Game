from app.game.game_repository import GameRepository
from flask import Blueprint, render_template, redirect, url_for, session
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import exc
from .forms import LoginForm, RegisterForm
from .. import db, bcrypt
from models import User
from .model.user import GameUser

auth = Blueprint('auth', __name__)
game_users = GameUser()


@auth.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()

    if form.validate_on_submit():
        password_hash = bcrypt.generate_password_hash(form.password.data)
        new_user = User(
            form.username.data,
            password_hash,
            form.email.data,
            form.first_name.data,
            form.last_name.data
        )
        try:
            db.session.add(new_user)
            db.session.commit()
        except exc.IntegrityError:
            return render_template('auth/register.html',
                                   title="Register",
                                   form=form,
                                   used_username=True)

        login_user(new_user)
        session['username'] = current_user.username
        game_users.add_user(session['username'], 0)
        return redirect(url_for('main.play', username=current_user.username, users=game_users.users))

    return render_template('auth/register.html',
                           title="Register",
                           form=form)


@auth.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    form = LoginForm()
    if form.validate_on_submit():
        db_user = User.query.filter_by(username=form.username.data).first()
        if db_user and bcrypt.check_password_hash(db_user.password, form.password.data):
            game_repository = GameRepository()
            login_user(db_user)
            session['username'] = current_user.username
            user_games = game_repository.get_games_count(db_user)
            game_users.add_user(session['username'], user_games)
            return redirect(url_for('main.play', username=current_user.username, users=game_users.users))
        else:
            error = "Wrong username or password."

    return render_template('auth/login.html',
                           title='Login',
                           form=form,
                           error=error)


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    game_users.delete_user(session['username'])
    return render_template('main/index.html',
                           message=True)
