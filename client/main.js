class Main {
	constructor(websocket, buttons) {
		this.websocket = websocket;

		this.vehicleMng = new VehicleMng();

		this.receiveMsgs(websocket);
		this.sendButtonMsgs(buttons, websocket);

		this.follow = true;
	}

	// test
	center() {
		if (!this.vehicleMng.selectedVehicle) return;

		zui.zoomSet(4, 0, 0);
        // Hokus pokus magic equation 
		stage.position.x = -this.vehicleMng.selectedVehicle.obj.car.position.x * stage.scale + elem.offsetWidth / 2;
		stage.position.y = -this.vehicleMng.selectedVehicle.obj.car.position.y * stage.scale + elem.offsetHeight / 2;
		zui.surfaceMatrix.elements[2] = stage.position.x;
		zui.surfaceMatrix.elements[5] = stage.position.y;

		two.update();
	}

	step(event) {
		this.vehicleMng.updateVehicleObjects(event.data);
		this.vehicleMng.drawVehicles(event.data);
		network.drawTrafficLights(event.trafficLights);

		if (this.vehicleMng.selectedVehicle && this.follow) this.center();
	}

	sendTLightMsg(id) {
		const event = {
			type: 'traffic_light',
			id: id,
		};
		this.websocket.send(JSON.stringify(event));
	}

	setVisibility(item, visible) {
		if (visible) item.style.visibility = 'visible';
		else item.style.visibility = 'hidden';
	}

	vehicleClicked(vehicle) {
		if (this.vehicleMng.selectedVehicle) this.vehicleMng.selectedVehicle.deselect();
		vehicle.select();
		this.vehicleMng.selectedVehicle = vehicle;

		this.getVehicleRoute(vehicle.id);
	}

	getVehicleRoute(id) {
		const event = {
			type: 'vehicleRoute',
			id: id,
		};
		this.websocket.send(JSON.stringify(event));
	}

	start(event) {
		if (network == null) {
			network = new Network(event.data, event.trafficLights, event.boundary, two);
			network.draw();
		}

		network.resetMark();

		this.selectedVehicle = null;
	}

	receiveMsgs(websocket) {
		websocket.addEventListener('message', ({ data }) => {
			const event = JSON.parse(data);

			// console.log(event);
			switch (event.type) {
				case 'step':
					this.step(event);
					break;
				case 'network':
					this.start(event);
				case 'end':
					this.vehicleMng.clearNetwork();
					break;
				case 'finish':
					createStatPopup(event['data']);
					break;
				case 'route':
					network.markRoute(event['data']);
				default:
					break;
			}
		});
	}

	sendButtonMsgs(buttons, websocket) {
		buttons['start'].onclick = async () => {
			document.querySelector('#scenarioBlock').style.display = 'none';
			[...document.querySelectorAll('.menuButton, .slider')].map((e) => {
				this.setVisibility(e, true);
			});

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
		//end button
		buttons['end'].onclick = async () => {
			console.log('Click end');

			const event = {
				type: 'end',
			};
			await websocket.send(JSON.stringify(event));
		};

		// setSpeed button
		buttons['setSpeed'].oninput = async () => {
			var sliderVal = buttons['setSpeed'].value;
			document.getElementById('speedSliderOut').value = sliderVal;
			const event = {
				type: 'setSpeed',
				value: sliderVal,
			};
			await websocket.send(JSON.stringify(event));
		};

		// setScale button
		buttons['setScale'].oninput = async () => {
			var sliderVal = buttons['setScale'].value;
			document.getElementById('scaleSliderOut').value = sliderVal;
			const event = {
				type: 'setScale',
				value: sliderVal,
			};
			await this.websocket.send(JSON.stringify(event));
		};
	}
}
// let main = null;

window.addEventListener('DOMContentLoaded', () => {
	// Initialize the UI.
	const startButton = document.getElementById('startButton');
	const pauseButton = document.getElementById('pauseButton');
	const playButton = document.getElementById('playButton');
	const endButton = document.getElementById('endButton');
	const setSpeedSlider = document.getElementById('speedSlider');
	const setScaleSlider = document.getElementById('scaleSlider');
	const buttons = {
		start: startButton,
		pause: pauseButton,
		play: playButton,
		setSpeed: setSpeedSlider,
		setScale: setScaleSlider,
		end: endButton,
	};
	// Open the WebSocket connection and register event handlers.
	const websocket = new WebSocket('ws://localhost:8001/');
	// receiveMsgs(websocket);
	// sendMsgs(buttons, websocket);
	main = new Main(websocket, buttons);
});
