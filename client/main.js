function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

function receiveMoves(board, websocket) {
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

function sendMoves(board, websocket) {
    // When clicking a column, send a "play" event for a move in that column.
    board.addEventListener("click", ({ target }) => {
        const column = target.dataset.column;
        console.log("Click");

        // Ignore clicks outside a column.

        const event = {
            type: "start",
        };
        websocket.send(JSON.stringify(event));
    });

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
    const board = document.querySelector(".board");

    // Open the WebSocket connection and register event handlers.
    const websocket = new WebSocket("ws://localhost:8001/");
    receiveMoves(board, websocket);
    sendMoves(board, websocket);
});
