from trafficLight import TrafficLight


class SocketSim:
    def __init__(self):

        self.RUNNING = False
        # types : 'paused', 'running', 'finished'
        self.STATUS = 'finished'
        self.VEHICLES = None
        self.SIMULATION_SPEED = 85  # lower means faster
        self.TRAFFIC_SCALE = 1
        self.trafficLight = TrafficLight()
        self.scenario = None
        self.uploading = False
        # self.thread = None

    #  debug
    def print(self):
        print(self.STATUS, self.RUNNING, self.SIMULATION_SPEED)
