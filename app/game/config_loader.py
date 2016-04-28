import json


def load_player_config():
    with open('app/game/config/player_config.json') as json_data:
        data = json.load(json_data)

    return data
