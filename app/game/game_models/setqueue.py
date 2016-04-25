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

    def remove_item(self, player_id):
        return self.queue.remove(player_id)

    def get_queue(self):
        return self.queue
