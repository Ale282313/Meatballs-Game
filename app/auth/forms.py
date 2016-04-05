from flask_wtf import Form
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, EqualTo, Regexp


class RegisterForm(Form):
    username = StringField('Username:', validators=[
        DataRequired(message="Username required."),
        Length(min=4, max=25,message="Sorry, not long enough.")
    ])

    password = PasswordField('Password:', validators=[
        DataRequired(message="Password required."),
        EqualTo('confirm',message="Passwords must match.")
    ])

    confirm = PasswordField('Repeat Password:', validators=[
        DataRequired(message="Password confirmation required.")
    ])

    email = StringField('Email:', validators=[
        DataRequired(message="Email required."),
        Length(min=4, max=25, message="Sorry, not long enough."),
        Regexp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',message="This doesn't look like an e-mail...")
    ])

    first_name = StringField('First Name:', validators=[
        DataRequired(message="First name required."),
        Length(min=2, max=25,message="Sorry, not long enough.")
    ])

    last_name = StringField('Last Name:', validators=[
        DataRequired(message="Last name required."),
        Length(min=2, max=25,message="Sorry, not long enough.")
    ])


class LoginForm(Form):
    username = StringField('Username:', validators=[
        DataRequired(message="Username required."),
        Length(min=4, max=25,message="Sorry, not long enough.")
    ])

    password = PasswordField('Password:', validators=[
        DataRequired(message="Password required."),
    ])
