class Main {
	constructor(websocket, buttons) {
		this.websocket = websocket;
		this.receiveMsgs(websocket);
		this.sendButtonMsgs(buttons, websocket);
	}

	sendTLightMsg(id) {
		const event = {
			type: 'traffic_light',
			id: id,
		};
		this.websocket.send(JSON.stringify(event));
	}

	receiveMsgs(websocket) {
		websocket.addEventListener('message', ({ data }) => {
			const event = JSON.parse(data);

			// console.log(event);
			switch (event.type) {
				case 'step':
					updateVehicleObjects(event.data);
					drawVehicles(event.data);
					network.drawTrafficLights(event.trafficLights);
					break;
				case 'network':
					if (network == null) {
						network = new Network(event.data, event.trafficLights, event.boundary, two);
						network.draw();
					}
				case 'restart':
					clearNetwork();
					break;
				default:
					break;
			}
		});
	}

	sendButtonMsgs(buttons, websocket) {
		buttons['start'].onclick = async () => {
			document.querySelector('#scenarios').style.display = 'none';
			const event = {
				type: 'start',
				scenario: document.querySelector('#scenarios').selectedOptions[0].value,
			};
			websocket.send(JSON.stringify(event));
		};

		buttons['pause'].onclick = async () => {
			console.log('Click pause');

			const event = {
				type: 'pause',
			};
			await websocket.send(JSON.stringify(event));
		};

		buttons['play'].onclick = async () => {
			console.log('Click play');

			const event = {
				type: 'play',
			};
			await websocket.send(JSON.stringify(event));
		};
		//restart button
		buttons['restart'].onclick = async () => {
			console.log('Click restart');

			const event = {
				type: 'restart',
			};
			await websocket.send(JSON.stringify(event));
		};

		// setSpeed button
		buttons['setSpeed'].onclick = async () => {
			var sliderVal = document.getElementById('speedSlider').value;
			console.log(sliderVal);
			const event = {
				type: 'setSpeed',
				value: sliderVal,
			};
			await websocket.send(JSON.stringify(event));
		};
		// setScale button
		buttons['setScale'].onclick = async () => {
			var sliderVal = document.getElementById('scaleSlider').value;
			const event = {
				type: 'setScale',
				value: sliderVal,
			};
			console.log('scale');
			await websocket.send(JSON.stringify(event));
		};
	}
}
// let main = null;

window.addEventListener('DOMContentLoaded', () => {
	// Initialize the UI.
	const startButton = document.getElementById('startButton');
	const pauseButton = document.getElementById('pauseButton');
	const playButton = document.getElementById('playButton');
	const restartButton = document.getElementById('restartButton');
	const setSpeedButton = document.getElementById('setSpeedButton');
	const setScaleButton = document.getElementById('setScaleButton');
	const buttons = {
		start: startButton,
		pause: pauseButton,
		play: playButton,
		setSpeed: setSpeedButton,
		setScale: setScaleButton,
		restart: restartButton,
	};
	// Open the WebSocket connection and register event handlers.
	const websocket = new WebSocket('ws://localhost:8001/');
	// receiveMsgs(websocket);
	// sendMsgs(buttons, websocket);
	main = new Main(websocket, buttons);
});
