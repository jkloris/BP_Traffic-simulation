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
from multiprocessing import Process
from socketSim import SocketSim

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


webClients = {}


async def handler(websocket):
    # TODO mozno pouzit id(websocket) miesto portu
    port = websocket.remote_address[1]
    webClients[port] = SocketSim()
    print(
        f'\nNew connection from: {websocket.remote_address} ({len(webClients)} total)\n')
    # asyncio.create_task(send(websocket))

    global RUNNING, STATUS, VEHICLES, SIMULATION_SPEED

    try:
        async for message in websocket:
            # message = await websocket.recv()
            event = json.loads(message)
            print(event)

            if event["type"] == "start":
                webClients[port].print()
                if webClients[port].STATUS == "finished":
                    RUNNING = True
                    webClients[port].RUNNING = True
                    STATUS = "running"
                    webClients[port].STATUS = "running"
                    VEHICLES = None
                    webClients[port].VEHICLES = None

                    loop = asyncio.get_event_loop()
                    loop.create_task(traciStart(websocket))

            elif event["type"] == "pause":

                if webClients[port].STATUS == "running":
                    webClients[port].STATUS = "paused"
                    webClients[port].RUNNING = False

            elif event["type"] == "play":
                if webClients[port].STATUS == "paused":
                    webClients[port].STATUS = "played"
                    webClients[port].RUNNING = True
                    loop.create_task(run(websocket, traci.getConnection(port)))

            elif event["type"] == "restart":
                if webClients[port].STATUS != "finished":
                    webClients[port].RUNNING = False
                    webClients[port].STATUS = "finished"

                    conn = traci.getConnection(port)
                    conn.close(False)
                    await confirmRestart(websocket)

            elif event["type"] == "setSpeed":
                webClients[port].SIMULATION_SPEED = int(event["value"])

    except websockets.ConnectionClosedOK:
        print(f"{websocket} ConnectionClosed OK\n")
    except websockets.ConnectionClosedError:
        print(f"{websocket} ConnectionClosed Error\n")
    finally:
        print(f'Disconnected from socket [{id(websocket)}]...')
        RUNNING = False
        STATUS = "finished"
        try:
            conn = traci.getConnection(port)
            conn.close(False)
        except:
            pass

        webClients.pop(port)
        print(webClients, "\n")
        # websocketClients.remove(websocket)

# contains TraCI control loop


async def confirmRestart(websocket):
    msg = {"type": "restart"}
    await websocket.send(json.dumps(msg))


async def traciStart(websocket):
    sumoBinary = checkBinary('sumo')

    try:
        traci.start([sumoBinary, "-c", "..\sumo\demoAAA.sumocfg",
                     "--tripinfo-output", "..\sumo\_tripinfo.xml"], label=websocket.remote_address[1])
    except:
        conn = traci.getConnection(websocket.remote_address[1])
        print(f"\n {conn.simulation.getNetBoundary()}\n")
        print(conn, "jsdklsjdklsjdlksajdsalkdjsalkdjslk\n")

    network = xmlnetToNetwork("../sumo/demoAAA.net.xml")
    msg = {"type": "network", "data": network}
    await websocket.send(json.dumps(msg))

    # conn is client connection to traci
    conn = traci.getConnection(websocket.remote_address[1])
    print(f"\n {conn.simulation.getNetBoundary()}\n")

    await run(websocket, conn)


async def run(websocket, conn):
    step = 0
    global VEHICLES, STATUS
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

    elif webClients[port].STATUS == "finished":
        print(f"Simulation {port} ended!")
        return
    else:
        webClients[port].STATUS = "finished"
        conn.close(False)
        # sys.stdout.flush()
        print(f"Simulation {port} ended!")


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


async def traciSimStep(websocket, vehicleData):

    conn = traci.getConnection(websocket.remote_address[1])
    vehicleData = updateVehicles(vehicleData, conn)
    conn.simulationStep()

    # time = traci.simulation.getTime()
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
