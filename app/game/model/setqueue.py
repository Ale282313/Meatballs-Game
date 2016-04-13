import queue


class SetQueue(queue.Queue):
    """Creates a SetQueue.

    This method extends parent class Queue and the queue itself becomes a set
    which is an unordered collection of unique elements
    """
    def _init(self, maxsize):
        self.queue = set()

    def _put(self, item):
        self.queue.add(item)

    def _get(self):
        return self.queue.pop()

    def remove_item(self, client_id):
        return self.queue.remove(client_id)

    def get_queue(self):
        return self.queue
