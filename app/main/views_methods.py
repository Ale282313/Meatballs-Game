def read_file():
    with open('app/static/resources/game_rules.txt', 'r') as file:
        rules = file.readlines()
    return rules
