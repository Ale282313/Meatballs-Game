class Clients:
    def __init__(self):
        self.connected_clients = {}

    def add_client(self, client):
        """Adds a new client.

        This method adds a new item in connected_clients dictionary with an id
        of a client as a key and the client object as a value.

        :param client: A client object.
        """
        self.connected_clients[client.id] = client

    def get_client_by_id(self, client_id):
        """Returns a client.

        This method returns a client which is an item value in
        connected_clients dictionary for an item with the client_id as a key.

        :param client_id: An id of a client which is a string.
        :return: Returns the client objec.
        """
        return self.connected_clients.get(client_id, None)
