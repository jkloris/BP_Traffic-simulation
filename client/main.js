class Main {
	constructor(websocket, buttons) {
		this.websocket = websocket;

		this.vehicleMng = new VehicleMng();
		this.tLightMng = new TLightMng();

		this.receiveMsgs(websocket);
		this.sendButtonMsgs(buttons, websocket);

		this.follow = false;
		this.selectPath = true;
	}

	pathSelected(obj, id) {
		obj.stroke = 'orange';
		console.log(id);
	}

	stopVehicle() {
		const msg = this.vehicleMng.getVehicleStopMsg();
		if (msg) this.websocket.send(JSON.stringify(msg));
	}

	resumeVehicle() {
		const msg = this.vehicleMng.getVehicleResumeMsg();
		if (msg) this.websocket.send(JSON.stringify(msg));
	}

	center(twoElement) {
		if (!twoElement) return;

		zui.zoomSet(4, 0, 0);
		// Hokus pokus magic equation
		stage.position.x = -twoElement.position.x * stage.scale + elem.offsetWidth / 2;
		stage.position.y = -twoElement.position.y * stage.scale + elem.offsetHeight / 2;
		zui.surfaceMatrix.elements[2] = stage.position.x;
		zui.surfaceMatrix.elements[5] = stage.position.y;

		two.update();
	}

	step(event) {
		this.vehicleMng.updateVehicleObjects(event.data);
		this.vehicleMng.drawVehicles(event.data);
		network.drawTrafficLights(event.trafficLights);

		if (this.vehicleMng.selectedVehicle && this.follow) this.center(this.vehicleMng.selectedVehicle.obj.car);
	}

	tLightClicked(id) {
		const event = {
			type: 'trafficLight',
			id: id,
		};
		this.tLightMng.selected = id;
		this.websocket.send(JSON.stringify(event));
	}

	sendtLightState() {
		const msg = this.tLightMng.getStateMsg();
		if (msg) this.websocket.send(JSON.stringify(msg));
	}
	sendTLightReset() {
		const msg = { type: 'trafficLightReset', id: this.tLightMng.selected };
		this.websocket.send(JSON.stringify(msg));
	}

	sendTLightStateUpdate() {
		const msg = this.tLightMng.getStateSetMsg();
		this.websocket.send(JSON.stringify(msg));
	}
	sendTLightStateAdd() {
		const msg = this.tLightMng.getStateAddMsg();
		this.websocket.send(JSON.stringify(msg));
	}

	sendTLightStateDelete() {
		const msg = this.tLightMng.getStateDelMsg();
		this.websocket.send(JSON.stringify(msg));
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
		document.querySelector('#vehicleOptions').style.display = 'block';
		document.querySelector('#tLightOptions').style.display = 'none';
		// TODO ID change
		openOptions();
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
		loadingOff();
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
					closeOptions();
					createStatPopup(event['data']);
					break;
				case 'route':
					network.markRoute(event['data']);
					break;
				case 'trafficLight':
					console.log(event);
					this.selected = event['id'];
					this.tLightMng.fillOptions(event['states'], event['logicType']);
					openOptions();

					break;
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

			loadingOn();

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

		buttons['stopVehicle'].onclick = () => this.stopVehicle();
		buttons['resumeVehicle'].onclick = () => this.resumeVehicle();
		buttons['centerVehicle'].onclick = () => this.center(this.vehicleMng.selectedVehicle.obj.car);
		buttons['followVehicle'].onclick = () => {
			if (this.follow) {
				buttons['followVehicle'].innerHTML = 'Follow';
			} else {
				buttons['followVehicle'].innerHTML = 'Unfollow';
			}
			this.follow = !this.follow;
		};
		buttons['deselectVehicle'].onclick = () => {
			this.vehicleMng.selectedVehicle.deselect();
			this.vehicleMng.selectedVehicle = null;
			network.resetMark();
			this.follow = false;
			document.querySelector('#vehicleOptions').style.display = 'none';
		};

		buttons['tlightCenter'].onclick = () => {
			this.center(network.trafficLights[this.tLightMng.selected]);
		};
		buttons['setStateTLight'].onclick = () => this.sendtLightState();
		buttons['resetTLight'].onclick = () => this.sendTLightReset();
		buttons['saveStateTLight'].onclick = () => this.sendTLightStateUpdate();
		buttons['addStateTLight'].onclick = () => this.sendTLightStateAdd();
		buttons['removeStatusTLight'].onclick = () => this.sendTLightStateDelete();
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
	const followVehicleBtn = document.getElementById('followVehicleBtn');
	const centerVehicleBtn = document.getElementById('centerVehicleBtn');
	const stopVehicleBtn = document.getElementById('stopVehicleBtn');
	const resumeVehicleBtn = document.getElementById('resumeVehicleBtn');
	const deselectVehicleBtn = document.getElementById('deselectVehicleBtn');
	const tlightCenterBtn = document.getElementById('tlightCenterBtn');
	const setStateTLightBtn = document.getElementById('setStateTLightBtn');
	const resetTLightBtn = document.getElementById('resetTLightBtn');

	const buttons = {
		start: startButton,
		pause: pauseButton,
		play: playButton,
		setSpeed: setSpeedSlider,
		setScale: setScaleSlider,
		end: endButton,
		followVehicle: followVehicleBtn,
		centerVehicle: centerVehicleBtn,
		stopVehicle: stopVehicleBtn,
		resumeVehicle: resumeVehicleBtn,
		deselectVehicle: deselectVehicleBtn,
		tlightCenter: tlightCenterBtn,
		setStateTLight: setStateTLightBtn,
		resetTLight: resetTLightBtn,
		saveStateTLight: document.getElementById('saveStateTLightBtn'),
		addStateTLight: document.getElementById('addStateTLightBtn'),
		removeStatusTLight: document.getElementById('removeStatusTLightBtn'),
	};
	// Open the WebSocket connection and register event handlers.
	const websocket = new WebSocket('ws://localhost:8001/');
	// receiveMsgs(websocket);
	// sendMsgs(buttons, websocket);
	main = new Main(websocket, buttons);
});
