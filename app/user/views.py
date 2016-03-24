from flask import Blueprint, render_template, redirect, url_for

user = Blueprint('user', __name__)


@user.route('/<username>')
def user_profile(username):
    return render_template('user/profile.html', user=username)
