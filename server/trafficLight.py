import xml.etree.ElementTree as ET


class TrafficLight:
    def __init__(self):
        self.__state = {}
        self.ids = {}

    def getState(self, id):
        if (id not in self.__state.keys()):
            return None
        return self.__state[id]

    def setState(self, id, value):
        self.__state[id] = value if 0 <= value <= 3 else 0

    def statePlusOne(self, id):
        if (id not in self.__state.keys()):
            self.setState(id, 0)
            return
        self.setState(id, self.__state[id] + 1)

    def findIDs(self, conn):
        if len(self.ids) > 0:
            return
        for id in conn.trafficlight.getIDList():
            for l in conn.trafficlight.getControlledLanes(id):
                self.ids[l] = id
