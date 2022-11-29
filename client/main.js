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

        // console.log(event.positions);
        // window.globals.changePos(event.positions);
    });
}

function sendMoves(buttons, websocket) {
    // When clicking a column, send a "play" event for a move in that column.
    buttons[0].addEventListener("click", ({ target }) => {
        const column = target.dataset.column;
        console.log("Click");

        // Ignore clicks outside a column.

        const event = {
            type: "start",
        };
        websocket.send(JSON.stringify(event));
    });

    buttons[1].addEventListener("click", async ({ target }) => {
        const column = target.dataset.column;
        console.log("Click pause");

        // Ignore clicks outside a column.

        const event = {
            type: "pause",
        };
        await websocket.send(JSON.stringify(event));
    });

    buttons[2].addEventListener("click", async ({ target }) => {
        const column = target.dataset.column;
        console.log("Click play");

        // Ignore clicks outside a column.

        const event = {
            type: "play",
        };
        await websocket.send(JSON.stringify(event));
    });

    // setSpeed button
    buttons[3].onclick = async () => {
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
        websocket.send(JSON.stringify(event));
    });
}

window.addEventListener("DOMContentLoaded", () => {
    // Initialize the UI.
    const startButton = document.querySelector(".startButton");
    const pauseButton = document.getElementById("pauseButton");
    const playButton = document.getElementById("playButton");
    const setSpeedButton = document.getElementById("setSpeedButton");
    const buttons = [startButton, pauseButton, playButton, setSpeedButton];
    // Open the WebSocket connection and register event handlers.
    const websocket = new WebSocket("ws://localhost:8001/");
    receiveMoves(websocket);
    sendMoves(buttons, websocket);
});
