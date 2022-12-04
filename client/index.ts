import { Network } from "./network";
import { updateVehicleObjects } from "./twot";
import { drawVehicles } from "./twot";
import { two } from "./twot";

function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

function receiveMoves(websocket) {
    websocket.addEventListener("message", ({ data }) => {
        const event = JSON.parse(data);

        switch (event.type) {
            case "step":
                updateVehicleObjects(event.data);
                drawVehicles(event.data);
                break;
            case "network":
                var network = new Network(event.data, two);
                network.draw();

            default:
                break;
        }

    });
}

function sendMoves(buttons, websocket) {

    buttons[0].onclick =  () => {

        console.log("Click start");

        const event = {
            type: "start",
        };
        websocket.send(JSON.stringify(event));
    };

    buttons[1].onclick =  async () => {

        console.log("Click pause");

        const event = {
            type: "pause",
        };
        await websocket.send(JSON.stringify(event));
    };

    buttons[2].onclick = async () => {

        console.log("Click play");

        const event = {
            type: "play",
        };
        await websocket.send(JSON.stringify(event));
    };

    // setSpeed button
    buttons[3].onclick = async () => {
        const slider = <HTMLInputElement>document.getElementById("speedSlider");

        if(slider != null){
            console.log(slider.value);
            const event = {
                type: "setSpeed",
                value: slider.value,
            };
            await websocket.send(JSON.stringify(event));
        }
    };

    document.addEventListener("keypress", ({}) => {
        console.log("Key press!");
        const event = {
            type: "play",
        };
        websocket.send(JSON.stringify(event));
    });
}

window.addEventListener("DOMContentLoaded", () => {
    // Initialize the UI.
    const startButton = document.getElementById("startButton");
    const pauseButton = document.getElementById("pauseButton");
    const playButton = document.getElementById("playButton");
    const setSpeedButton = document.getElementById("setSpeedButton");
    const buttons = [startButton, pauseButton, playButton, setSpeedButton];
    // Open the WebSocket connection and register event handlers.
    const websocket = new WebSocket("ws://localhost:8001/");
    receiveMoves(websocket);
    sendMoves(buttons, websocket);
});
