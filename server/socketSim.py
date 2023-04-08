from trafficLight import TrafficLight


class SocketSim:
    def __init__(self):

        self.RUNNING = False
        # types : 'paused', 'running', 'finished'
        self.STATUS = 'finished'
        self.VEHICLES = None
        self.SIMULATION_SPEED = 70  # lower means faster
        self.TRAFFIC_SCALE = 1
        self.trafficLight = TrafficLight()
        self.scenario = None
        # self.thread = None

    # tmp debug
    def print(self):
        print(self.STATUS, self.RUNNING, self.SIMULATION_SPEED)
