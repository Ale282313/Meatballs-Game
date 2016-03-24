from flask_wtf import Form
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, EqualTo


class RegisterForm(Form):
    username = StringField('Username:', validators=[
        DataRequired(),
        Length(min=4, max=25)
    ])

    password = PasswordField('Password:', validators=[
        DataRequired(),
        EqualTo('confirm')
    ])

    confirm = PasswordField('Repeat Password:')

class LoginForm(Form):
    username = StringField('Username:', validators=[
        DataRequired(),
        Length(min=4, max=25)
    ])

    password = PasswordField('Password:', validators=[
        DataRequired(),
    ])
