import xml.etree.ElementTree as ET


class TrafficLight:
    def __init__(self):
        self.__state = {}
        self.__stateCounter = {}
        self.ids = {}

    def getState(self, id):
        if (id not in self.__state.keys()):
            return None
        return self.__state[id]

    def setStateCounter(self, id, value):
        self.__stateCounter[id] = value if 0 <= value < len(
            self.getState(id)) else 0

    def clearState(self):
        self.__state = {}
        self.__stateCounter = {}

    def statePlusOne(self, id):
        if (id not in self.__stateCounter.keys()):
            self.setStateCounter(id, 0)
            return
        self.setStateCounter(id, self.__stateCounter[id] + 1)

    def findIDs(self, conn):
        if len(self.ids) > 0:
            return
        for id in conn.trafficlight.getIDList():
            for l in conn.trafficlight.getControlledLanes(id):
                self.ids[l] = id

    def saveProgram(self, program):
        pass

    def extractStates(self, conn, id):
        program = conn.trafficlight.getAllProgramLogics(id)
        self.__state[id] = []
        for log in program:
            for ph in log.getPhases():
                self.__state[id].append(ph.state)


    def getCurrentState(self, id):
        state = self.getState(id)
        if state == None:
            return None
        return state[self.__stateCounter[id]]
