import os
import subprocess
import json
import asyncio
import websockets
import socket

connections = []

IPADDRESS = ''


def find_available_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((IPADDRESS, 0))
        return s.getsockname()[1]


async def start_subprocess(port, websocket):
    # Use asyncio.create_subprocess_exec to start the subprocess
    process = await asyncio.create_subprocess_exec("python", "./app.py", "-p", str(port),
                                                   stderr=asyncio.subprocess.PIPE)
    msg = {"type": "newPort", "port": port}
    await websocket.send(json.dumps(msg))


async def handler(websocket):

    try:
        async for message in websocket:
            event = json.loads(message)
            if event["type"] == "connected":
                port = find_available_port()
                asyncio.create_task(start_subprocess(port, websocket))
    except:
        pass


async def main():
    port = 8001

    async with websockets.serve(handler, IPADDRESS, port):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
