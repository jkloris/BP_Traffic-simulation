#!/usr/bin/env python

import optparse
import sys
import os
import asyncio
import itertools
import json
import math
import subprocess
from time import sleep
from turtle import position
import sumolib
from sumolib import checkBinary
import traci
import websockets
import xml.etree.ElementTree as ET
from aiohttp import web
import threading
from multiprocessing import Process
from socketSim import SocketSim
from fileHandler import FileHandler
import argparse
import socket

import re
PARSER = argparse.ArgumentParser()

FILE_HANDLER = FileHandler()

# we need to import some python modules from the $SUMO_HOME/tools directory
if 'SUMO_HOME' in os.environ:
    tools = os.path.join(os.environ['SUMO_HOME'], 'tools')
    sys.path.append(tools)
else:
    sys.exit("please declare environment variable 'SUMO_HOME'")


def xmlnetToNetwork(path="../sumo/demoAAA.net.xml"):
    tree = ET.parse(path)
    root = tree.getroot()
    network = {}

    # boundaries of network map
    boundList = root.find("location").attrib["convBoundary"].split(" ")[
        0].split(",")
    convBoundary = {
        "x0": boundList[0], "y0": boundList[1], "x1": boundList[2], "y1": boundList[3]}

    # formating roads, lanes, paths, etc.
    for e in root.findall("edge"):
        type = "road"
        if "type" in e.attrib:
            if "rail" in e.attrib["type"]:
                type = "rail"
            elif "path" in e.attrib["type"] or "footway" in e.attrib["type"]:
                type = "pathway"

        lanes = e.findall("lane")
        for lane in lanes:
            network[lane.attrib["id"]] = {"type": type, "points": []}
            for p in lane.attrib["shape"].split(" "):
                network[lane.attrib["id"]]["points"].append(p.split(","))

    # traffic lights
    tl = {}

    for idd in traci.trafficlight.getIDList():
        lanes = traci.trafficlight.getControlledLanes(idd)
        for id in lanes:
            tl[id] = network[id]["points"][-1]

    return {"type": "network", "data": network, "boundary": convBoundary, "trafficLights": tl}


webClients = {}


async def sendErrorToClient(websocket, text, duration=5000):
    msg = {"type": "error", "text": text, "duration": duration}
    await websocket.send(json.dumps(msg))


async def handler(websocket):
    # TODO mozno pouzit id(websocket) miesto portu
    port = websocket.remote_address[1]
    webClients[port] = SocketSim()
    print(f'\nNew connection from: {port} ({len(webClients)} total)\n')

    uploading = False

    try:
        async for message in websocket:

            # File upload handling
            if type(message) == bytes:
                if uploading:
                    FILE_HANDLER.appendToFile(port, message)
                continue

            event = json.loads(message)
            if event == None or "type" not in event:
                print("ERROR: Wrong message format!", event)
                await sendErrorToClient(websocket, "ERROR: Wrong message format!")
                continue
            print("--------------------\n", event)

            if event["type"] == "start":
                if webClients[port].STATUS == "finished":
                    webClients[port].RUNNING = True
                    webClients[port].STATUS = "running"
                    webClients[port].VEHICLES = None
                    webClients[port].scenario = event["scenario"]
                    print(PARSER.parse_args())
                    loop = asyncio.get_event_loop()
                    loop.create_task(traciStart(websocket, event["scenario"]))

            elif event["type"] == "pause":

                if webClients[port].STATUS == "running":
                    webClients[port].STATUS = "paused"
                    webClients[port].RUNNING = False
                    print(traci.getConnection(
                        port).simulation.getSubscriptionResults())

            elif event["type"] == "play":
                if webClients[port].STATUS == "paused":
                    webClients[port].STATUS = "played"
                    webClients[port].RUNNING = True
                    traci.getConnection(port).simulation.subscribe()
                    loop.create_task(run(websocket, traci.getConnection(port)))

            elif event["type"] == "end":
                if webClients[port].STATUS != "finished":

                    webClients[port].RUNNING = False
                    webClients[port].STATUS = "finished"
                    webClients[port].trafficLight.clearState()

                    await confirmEnd(websocket)

                    conn = traci.getConnection(port)
                    await simulationFinished(websocket, conn)

                    conn.close()

            elif event["type"] == "setSpeed":
                webClients[port].SIMULATION_SPEED = int(event["value"])

            elif event["type"] == "setScale":
                if webClients[port].STATUS != "finished":
                    traci.getConnection(port).simulation.setScale(
                        int(event["value"]))
                    if webClients[port].STATUS != "finished":
                        TRAFFIC_SCALE = int(event["value"])

            elif event["type"] == "trafficLight":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    tlightObj = webClients[port].trafficLight
                    tlightObj.findIDs(conn)

                    if event["id"] in tlightObj.ids.keys():
                        tlightId = tlightObj.ids[event["id"]]

                        # if tlightObj.getState(tlightId) == None:
                        tlightObj.extractStates(conn, tlightId)

                        msg = tlightObj.getTrafficLightMsg(conn, tlightId)
                        await websocket.send(json.dumps(msg))

            elif event["type"] == "trafficLightState":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    tlightId = tlightObj.ids[event["id"]]

                    conn.trafficlight.setRedYellowGreenState(
                        tlightId, event["state"])

            elif event["type"] == "trafficLightReset":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    tlightId = tlightObj.ids[event["id"]]
                    conn.trafficlight.setProgram(tlightId, 0)

            elif event["type"] == "trafficLightStateUpdate":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    tlightId = tlightObj.ids[event["id"]]
                    webClients[port].trafficLight.setPhase(
                        conn, tlightId, event["state"], event["duration"], event["index"])

                    msg = msg = tlightObj.getTrafficLightMsg(conn, tlightId)
                    await websocket.send(json.dumps(msg))

            elif event["type"] == "trafficLightStateAdd":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    tlightId = tlightObj.ids[event["id"]]
                    webClients[port].trafficLight.addPhase(
                        conn, tlightId, event["state"], event["duration"])

                    msg = tlightObj.getTrafficLightMsg(conn, tlightId)
                    await websocket.send(json.dumps(msg))

            elif event["type"] == "trafficLightStateDel":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    tlightId = tlightObj.ids[event["id"]]
                    webClients[port].trafficLight.deletePhase(
                        conn, tlightId, event["index"])

                    msg = tlightObj.getTrafficLightMsg(conn, tlightId)
                    await websocket.send(json.dumps(msg))

            elif event["type"] == "vehicleRoute":
                if webClients[port].STATUS != "finished":
                    await sendVehicleRoute(websocket, traci.getConnection(port), event["id"])

            elif event["type"] == "stopVehicle":
                if webClients[port].STATUS != "finished":
                    setVehicleStop(traci.getConnection(port), event["id"])

            elif event["type"] == "resumeVehicle":
                if webClients[port].STATUS != "finished":
                    resumeVehicleStop(traci.getConnection(port), event["id"])

            elif event["type"] == "path":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    edgeID = conn.lane.getEdgeID(event["id"])

                    msg = {"type": "path",
                           "id": event["id"],
                           "maxSpeed": math.floor(float(conn.lane.getMaxSpeed(event["id"])) * 360) / 100.0,
                           "averageSpeed": math.floor(float(conn.lane.getLastStepMeanSpeed(event["id"])) * 360) / 100.0,
                           "streetName": conn.edge.getStreetName(edgeID)
                           }
                    await websocket.send(json.dumps(msg))

            elif event["type"] == "pathMaxSpeed":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    conn.lane.setMaxSpeed(
                        event["id"], float(event["value"])/3.6)

            elif event["type"] == "vehicleDestination":
                if webClients[port].STATUS != "finished":
                    conn = traci.getConnection(port)
                    edgeID = conn.lane.getEdgeID(event["pathId"])
                    try:
                        conn.vehicle.changeTarget(event["vehId"], edgeID)
                        await sendVehicleRoute(websocket, conn, event["vehId"])
                    except:
                        await sendErrorToClient(websocket, "ERROR: Non existing route or prohibited destination.")
                        print("ERROR: Route not found")

            elif event["type"] == "upload":
                if webClients[port].STATUS == "finished":
                    uploading = True
                    FILE_HANDLER.handleNewFile(port, event["format"])
            elif event["type"] == "uploadFin":
                if webClients[port].STATUS == "finished":
                    uploading = False
                    FILE_HANDLER.closeFile(port, event["format"])

    except websockets.ConnectionClosedOK:
        print(f"{websocket} ConnectionClosed OK\n")
    except websockets.ConnectionClosedError:
        print(f"{websocket} ConnectionClosed Error\n")
    finally:
        print(f'\nDisconnected from socket [{id(websocket)}]...')
        webClients[port].RUNNING = False
        webClients[port].STATUS = "finished"
        try:
            conn = traci.getConnection(port)
            conn.close()
        except:
            pass

        FILE_HANDLER.removeFile(port)
        webClients.pop(port)


def checkValidVehicleID(conn, id):
    print(conn.vehicle.getIDList())
    if id not in conn.vehicle.getIDList():
        print("ERROR: no id in vehicle ID List")
        return False
    return True


def resumeVehicleStop(conn, id):
    if not checkValidVehicleID(conn, id):
        return
    conn.vehicle.setSpeed(id, -1)


def setVehicleStop(conn, id):
    if not checkValidVehicleID(conn, id):
        return
    conn.vehicle.setSpeed(id, 0)


async def confirmEnd(websocket):
    msg = {"type": "end"}
    await websocket.send(json.dumps(msg))


async def resetProgram(websocket):
    port = websocket.remote_address[1]

    webClients[port].RUNNING = False
    webClients[port].STATUS = "finished"
    webClients[port].trafficLight.clearState()

    conn = traci.getConnection(port)
    conn.close()

    msg = {"type": "reset"}
    await websocket.send(json.dumps(msg))


def find_available_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('localhost', 0))
        return s.getsockname()[1]


async def traciStart(websocket, sumocfgFile):
    label = websocket.remote_address[1]
    port = find_available_port()
    print(port, "tracistart", sumocfgFile)

    if sumocfgFile == "upload":
        if not FILE_HANDLER.setupConfig(label):
            return
        sumocfgFile += str(label)

    sumoBinary = checkBinary('sumo')
    sumocmd = [sumoBinary, "-c", f"../sumo/{sumocfgFile}.sumocfg"]

    try:
        traci.start(sumocmd, label=label, port=port, numRetries=2)
    except:
        print("Error: Wrong .sumocfg file")
        await resetProgram(websocket)
        await sendErrorToClient(websocket, "Error: Probable corruption in uploaded files. Make sure you have uploaded the correct files.", 10000)
        return
    msg = xmlnetToNetwork("../sumo/"+sumocfgFile + ".net.xml")

    await websocket.send(json.dumps(msg))

    # conn is client connection to traci
    conn = traci.getConnection(label)
    conn.simulation.setScale(webClients[label].TRAFFIC_SCALE)

    await run(websocket, conn)


async def run(websocket, conn):
    port = websocket.remote_address[1]

    print("::::::::::::RUN TRACI\n")
    vehicleData = None
    if (webClients[port].STATUS == 'running'):
        vehicleData = getVehicles(conn)
    elif (webClients[port].STATUS == "played"):
        webClients[port].STATUS = "running"
        vehicleData = updateVehicles(webClients[port].VEHICLES, conn)

    if vehicleData == None:
        print("Neosetrena udalost!")
        return

    while webClients[port].RUNNING and conn.simulation.getMinExpectedNumber() > 0:

        try:
            await traciSimStep(websocket, vehicleData)
        except websockets.ConnectionClosedOK:
            break

        await asyncio.sleep(webClients[port].SIMULATION_SPEED / 1000)

    if webClients[port].STATUS == "paused":
        webClients[port].VEHICLES = vehicleData
        print(f"Simulation {port} paused!")

    # finished via end
    elif webClients[port].STATUS == "finished":
        return
    # funished normally
    else:
        webClients[port].STATUS = "finished"
        await simulationFinished(websocket, conn)
        conn.close()


async def simulationFinished(websocket, conn):

    stats = {'Average statistics': {
        'Route length (m)': {
            "value": conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.routeLength"),
            "title": "The average length in metres of routes of all the vehicles."},
        "Vehicle Speed (m/s)": {
            "value": conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.speed"),
            "title": "The average speed of the vehicles in metres per second."},
        "Vehicle Speed (km/h)": {
            "value": float(conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.speed"))*3.6,
            "title": "The average speed of the vehicles in kilometres per hour."},
        "Trip Duration (s)": {
            "value": conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.duration"),
            "title": "The average duration of all vehicle trips during the simulation."},
        'Waiting Time (s)': {
            "value": conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.waitingTime"),
            "title": "The average time spent standing (involuntarily) in seconds"},
        'Time Lost (s)': {
            "value": conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.timeLoss"),
            "title": "The average time lost due to walking below maximum speed or stopping."}, },
        'Total statistics': {
        "Vehicle count": {
            "value": conn.simulation.getParameter("", "device.tripinfo.count"),
            "title": "Total number of vehicles that entered the simulation."},
        'Vehicle Travel Time (s)': {
            "value": conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.totalTravelTime"),
            "title": "The total travel time of all vehicles."},
        'Vehicle Depart Delay (s)': {
            "value": conn.simulation.getParameter("", "device.tripinfo.vehicleTripStatistics.totalDepartDelay"),
            "title": "The total depart delay of all vehicles."},
    },
    }
    print(stats)

    msg = {"type": "finish", "data": stats}
    await websocket.send(json.dumps(msg))
    print(f"Simulation ended!")


def getVehicles(conn):
    vehicleIDs = conn.vehicle.getIDList()
    vehicleData = {"removed": [], "added": vehicleIDs,
                   "data": {}, "all": vehicleIDs}

    for id in vehicleIDs:
        pos = conn.vehicle.getPosition(id)
        angle = conn.vehicle.getAngle(id)
        vehicleData["added"][id] = {"position": pos, "angle": angle}

    return vehicleData


def updateVehicles(vehicleData, conn):
    vehicleIDs = conn.vehicle.getIDList()
    vehicleData["removed"] = conn.simulation.getArrivedIDList()
    vehicleData["added"] = conn.simulation.getDepartedIDList()

    for i in vehicleData["removed"]:
        vehicleData["all"] = [item for item in vehicleData["all"] if item != i]

    vehicleData["all"] += vehicleData["added"]

    for id in vehicleIDs:
        pos = conn.vehicle.getPosition(id)
        angle = conn.vehicle.getAngle(id)
        vehicleData["data"][id] = {"position": pos, "angle": angle}

    return vehicleData


async def sendVehicleRoute(websocket, conn, id):
    if not checkValidVehicleID(conn, id):
        return

    msg = {"type": "route", "data": conn.vehicle.getRoute(id)}
    await websocket.send(json.dumps(msg))


def getTrafficLights(conn):
    tlights = {}
    for id in conn.trafficlight.getIDList():
        # state = webClients[label].trafficLight.getState(id)
        # if state is not None:
        #     conn.trafficlight.setPhase(id, state)
        #     print(conn.trafficlight.getRedYellowGreenState(id))

        # conn.trafficlight.setRedYellowGreenState(id, len(signal)*'G')
        signal = conn.trafficlight.getRedYellowGreenState(id)

        # print(conn.trafficlight.getAllProgramLogics(id), '\n')

        lanes = conn.trafficlight.getControlledLanes(id)
        for i in range(len(lanes)):
            tlights[lanes[i]] = signal[i]
    return tlights


async def traciSimStep(websocket, vehicleData):

    conn = traci.getConnection(websocket.remote_address[1])
    tlights = getTrafficLights(conn)
    vehicleData = updateVehicles(vehicleData, conn)
    # await testVehicle(websocket, conn)  # test
    conn.simulationStep()

    # time = traci.simulation.getTime()
    msg = {"type": "step", "data": vehicleData, "trafficLights": tlights}
    # print("_______________________\n", msg)
    await websocket.send(json.dumps(msg))


async def startWebsocket(port):
    async with websockets.serve(handler, "", port):
        print(f"Websocket opened of {port}")
        await asyncio.Future()


async def main():

    PARSER.add_argument("-p", "--port", type=int,
                        help="port number for Traci simulation")
    args = PARSER.parse_args()
    print(args)

    print(args.port, "app")
    async with websockets.serve(handler, "", args.port):
        await asyncio.Future()  # run forever

if __name__ == "__main__":

    asyncio.run(main())
