# Meatballs Game

## Under the hood
- [Python 3.5](python.org)
- [Flask Microframework](flask.pocoo.org)
- [SocketIO](socket.io)
- [Flask SockeIO](flask-socketio.readthedocs.io/en/latest/)

## Requirements
- [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/)
- [pip](https://pip.readthedocs.org/en/stable/)

## Setup
`git clone https://github.com/Ale282313/Meatballs-Game.git`

`virtualenv -p path_to_python3.5_interpreter venv` to create a virtual environment

`source venv/bin/activate`(unix based OS)

`venv/Scripts/activate.bat`(windows)

`pip install -r requirements.txt` (required packages)

## Creating the database
`python manage.py create`

## Starting the web server
`python manage.py startserver`

### After the server initializes it will listen on port 5000, waiting for connections
* Open your web browser and enter the following URL
    
    `http://localhost:5000`
  
## To play with friends, open CMD/Terminal

`ifconfig`(unix based OS)

`ipconfig`(windows)

## Copy your local IP
* Open your browser and enter the following URL

    `http://<yourIP>:5000`


# Database Management

## Creating the database
`python manage.py create`

## Generate a migration
`python manage.py migrate`

## Upgrade database
`python manage.py upgrade`

## Downrade database
`python manage.py downgrade`