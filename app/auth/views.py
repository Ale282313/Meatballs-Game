from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_user, logout_user, login_required
from models import User
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
            pw_hash
        )
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('.login'))

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
    return render_template('index.html',
                           message=True)
