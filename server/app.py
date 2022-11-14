#!/usr/bin/env python

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


import os
import sys
import optparse


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


async def handler(websocket):
    async for message in websocket:
        # Parse a "play" event from the UI.
        event = json.loads(message)
        if event["type"] == "start":
            await traciStart(websocket)
        if event["type"] == "play":
            await traciSimStep(websocket)


# contains TraCI control loop

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
    print("::::::::::::RUN TRACI\n")
    vehicleData = getVehicles()

    while traci.simulation.getMinExpectedNumber() > 0:

        await traciSimStep(websocket, vehicleData)
        await asyncio.sleep(10 / 1000)
    traci.close()
    sys.stdout.flush()
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

    async with websockets.serve(handler, "", 8001):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
