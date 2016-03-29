from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required
from models import User
from sqlalchemy import exc
from .forms import LoginForm, RegisterForm
from .. import db, bcrypt

auth = Blueprint('auth', __name__)


@auth.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()

    if form.validate_on_submit():
        pw_hash = bcrypt.generate_password_hash(form.password.data)
        new_user = User(
            form.username.data,
            pw_hash,
            form.email.data,
            form.first_name.data,
            form.last_name.data
        )
        try:
            #when the user tries to register with a used username, SQLAlchemy throws a nasty error
            db.session.add(new_user)
            db.session.commit()
        except exc.IntegrityError as e:
            #catch that error and reload the register page, letting the user know that the username is already used
            return render_template('auth/register.html',
                           title="Register",
                           form=form,
                           used_username=True)
        #after the new user has registered, I will log him in automatically
        login_user(new_user)
        return redirect(url_for('main.index'))
        #old implementation required user to login after registration - which I think is annoying
        #as the user has to type the username and password twice.
        #return redirect(url_for('.login'))


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
            login_user(db_user)
            return redirect(url_for('main.index'))
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
    return render_template('main/index.html',
                           message=True)
