#!/usr/bin/env python

import optparse
import sys
import os
import asyncio
import itertools
import json
from time import sleep
from turtle import position
import sumolib
from sumolib import checkBinary
import traci
import websockets
import xml.etree.ElementTree as ET
from aiohttp import web
import threading

RUNNING = False

#STATUS = 'running'
#STATUS = 'paused'
STATUS = 'finished'  # TODO premenovat

VEHICLES = None

SIMULATION_SPEED = 30  # lower means faster

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

    for ch in root.findall("edge"):
        lane = ch.find("lane")
        network[lane.attrib["id"]] = []
        for p in lane.attrib["shape"].split(" "):
            network[lane.attrib["id"]].append(p.split(","))
    return network


websocketClients = []


async def handler(websocket):
    websocketClients.append(websocket)
    print(
        f'New connection from: {websocket.remote_address} ({len(websocketClients)} total)')

    # asyncio.create_task(send(websocket))
    global RUNNING, STATUS, VEHICLES, SIMULATION_SPEED
    # while True:
    try:
        async for message in websocket:
            # message = await websocket.recv()
            event = json.loads(message)
            print(event)

            if event["type"] == "start":
                if STATUS == "finished":
                    RUNNING = True
                    STATUS = "running"
                    VEHICLES = None
                    loop = asyncio.get_event_loop()
                    loop.create_task(traciStart(websocket))

            elif event["type"] == "pause":
                if STATUS == "running":
                    STATUS = "paused"
                    RUNNING = False

            elif event["type"] == "play":
                if STATUS == "paused":
                    STATUS = "played"
                    RUNNING = True
                    loop.create_task(run(websocket))

            elif event["type"] == "restart":
                if STATUS != "finished":
                    RUNNING = False
                    STATUS = "finished"
                    traci.close()
                    await confirmRestart(websocket)

            elif event["type"] == "setSpeed":
                SIMULATION_SPEED = int(event["value"])

    except websockets.ConnectionClosedOK:
        pass
    finally:
        print(f'Disconnected from socket [{id(websocket)}]...')
        RUNNING = False
        STATUS = "finished"
        traci.close()
        websocketClients.remove(websocket)

# contains TraCI control loop


async def confirmRestart(websocket):
    msg = {"type": "restart"}
    await websocket.send(json.dumps(msg))


async def traciStart(websocket):
    sumoBinary = checkBinary('sumo')

    traci.start([sumoBinary, "-c", "..\sumo\demoAAA.sumocfg",
                "--tripinfo-output", "..\sumo\_tripinfo.xml"])

    network = xmlnetToNetwork("../sumo/demoAAA.net.xml")
    msg = {"type": "network", "data": network}
    await websocket.send(json.dumps(msg))

    print(traci.simulation.getNetBoundary())
    await run(websocket)


async def run(websocket):
    step = 0
    global VEHICLES, STATUS
    print("::::::::::::RUN TRACI\n")
    vehicleData = None
    if (STATUS == 'running'):
        vehicleData = getVehicles()
    elif (STATUS == "played"):
        STATUS = "running"
        vehicleData = updateVehicles(VEHICLES)

    if vehicleData == None:
        print("Neosetrena udalost!")
        return

    while RUNNING and traci.simulation.getMinExpectedNumber() > 0:

        try:
            await traciSimStep(websocket, vehicleData)
        except websockets.ConnectionClosedOK:
            break

        await asyncio.sleep(SIMULATION_SPEED / 1000)

    if STATUS == "paused":
        VEHICLES = vehicleData
        print("Simulation paused!")

    elif STATUS == "finished":
        print("Simulation ended!")
        return
    else:
        STATUS = "finished"
        traci.close()
        # sys.stdout.flush()
        print("Simulation ended!")


def getVehicles():
    vehicleIDs = traci.vehicle.getIDList()
    vehicleData = {"removed": [], "added": vehicleIDs,
                   "data": {}, "all": vehicleIDs}

    for id in vehicleIDs:
        pos = traci.vehicle.getPosition(id)
        angle = traci.vehicle.getAngle(id)
        vehicleData["added"][id] = {"position": pos, "angle": angle}
    return vehicleData


def updateVehicles(vehicleData):
    vehicleIDs = traci.vehicle.getIDList()
    vehicleData["removed"] = traci.simulation.getArrivedIDList()
    vehicleData["added"] = traci.simulation.getDepartedIDList()

    for i in vehicleData["removed"]:
        vehicleData["all"] = [item for item in vehicleData["all"] if item != i]

    vehicleData["all"] += vehicleData["added"]

    for id in vehicleIDs:
        pos = traci.vehicle.getPosition(id)
        angle = traci.vehicle.getAngle(id)
        vehicleData["data"][id] = {"position": pos, "angle": angle}

    return vehicleData


async def traciSimStep(websocket, vehicleData):

    vehicleData = updateVehicles(vehicleData)
    traci.simulationStep()

    time = traci.simulation.getTime()
    # print("_______________________\n", time)
    msg = {"type": "step", "data": vehicleData}
    await websocket.send(json.dumps(msg))


async def main():

    # FUNKCNE -->
    async with websockets.serve(handler, "", 8001):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
    # Test -->
    # server = threading.Thread(target=main, daemon=True)
    # server.start()
