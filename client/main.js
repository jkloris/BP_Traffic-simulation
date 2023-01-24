function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

function receiveMoves(websocket) {
    websocket.addEventListener("message", ({ data }) => {
        const event = JSON.parse(data);

        console.log(event);
        switch (event.type) {
            case "step":
                updateVehicleObjects(event.data);
                drawVehicles(event.data);
                break;
            case "network":
                var network = new Network(event.data, two);
                // network.addPathToStage(stage);
                network.draw();

            default:
                break;
        }

        // console.log(event.positions);
        // window.globals.changePos(event.positions);
    });
}

function sendMoves(buttons, websocket) {
    buttons["start"].onclick = async () => {
        const event = {
            type: "start",
        };
        websocket.send(JSON.stringify(event));
    };

    buttons["pause"].onclick = async () => {
        console.log("Click pause");

        const event = {
            type: "pause",
        };
        await websocket.send(JSON.stringify(event));
    };

    buttons["play"].onclick = async () => {
        console.log("Click play");
        //tmp play
        const event = {
            type: "play",
        };
        await websocket.send(JSON.stringify(event));
    };
    //restart button
    buttons["restart"].onclick = async () => {
        console.log("Click restart");
        //tmp play
        const event = {
            type: "restart",
        };
        await websocket.send(JSON.stringify(event));
    };

    // setSpeed button
    buttons["setSpeed"].onclick = async () => {
        var sliderVal = document.getElementById("speedSlider").value;
        console.log(sliderVal);
        const event = {
            type: "setSpeed",
            value: sliderVal,
        };
        await websocket.send(JSON.stringify(event));
    };

    document.addEventListener("keypress", ({}) => {
        console.log("Key press!");
        const event = {
            type: "play",
        };
        // websocket.send(JSON.stringify(event));
    });
}

window.addEventListener("DOMContentLoaded", () => {
    // Initialize the UI.
    const startButton = document.getElementById("startButton");
    const pauseButton = document.getElementById("pauseButton");
    const playButton = document.getElementById("playButton");
    const restartButton = document.getElementById("restartButton");
    const setSpeedButton = document.getElementById("setSpeedButton");
    const buttons = {
        start: startButton,
        pause: pauseButton,
        play: playButton,
        setSpeed: setSpeedButton,
        restart: restartButton,
    };
    // Open the WebSocket connection and register event handlers.
    const websocket = new WebSocket("ws://localhost:8001/");
    receiveMoves(websocket);
    sendMoves(buttons, websocket);
});
