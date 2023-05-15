class Main {
	constructor(websocket, buttons) {
		this.websocket = websocket;

		this.vehicleMng = new VehicleMng();
		this.tLightMng = new TLightMng();
		this.pathMng = new PathMng();
		this.stateMng = new StateMng();

		this.receiveMsgs(websocket);
		this.sendButtonMsgs(buttons, websocket);

		this.follow = false;
		this.selectPath = true;

		this.upload = { net: false, trips: false };
	}

	sendFile(format) {
		//tmp format
		if (format != 'trips' && format != 'net') {
			console.log('Wrong format');

			return false;
		}
		let input = document.querySelector('#upload' + format + 'Input');

		let file = input?.files[0];

		if (!file || file.type != 'text/xml') {
			console.log('Wrong file format. Acceptable is only XML');
			openToast('Error: Wrong file format! Acceptable is only XML.', 5000);
			return false;
		}
		let reader = new FileReader();
		let rawData = new ArrayBuffer();
		let decoder = new TextDecoder('utf-8');

		reader.loadend = function () {};
		let ws = this.websocket;
		reader.onload = function (e) {
			rawData = e.target.result;
			// if (decoder.decode(rawData.slice(2, 5)).toLowerCase() != 'xml') {
			// 	console.log('Wrong file format. Acceptable is only XML');
			// 	return false;
			// }

			ws.send(JSON.stringify({ type: 'upload', format: format }));

			let chunk;
			for (let i = 0; i < rawData.byteLength; i += 1024 * 512) {
				chunk = rawData.slice(i, i + 1024 * 512);
				ws.send(chunk);
				console.log(i);
			}

			ws.send(JSON.stringify({ type: 'uploadFin', format: format }));
			console.log('the File has been transferred.');
		};

		reader.readAsArrayBuffer(file);
		return true;
	}

	sendVehicleDestination() {
		const msg = {
			type: 'vehicleDestination',
			vehId: this.vehicleMng.selectedVehicle.id,
			pathId: this.pathMng.selected.id,
		};
		this.websocket.send(JSON.stringify(msg));
	}

	pathSelected(obj, id) {
		this.pathMng.select(obj, id);

		if (this.vehicleMng.selectedVehicle) {
			this.vehicleMng.drawOptions(this.vehicleMng.selectedVehicle, id);
			return;
		}

		const msg = { type: 'path', id: id };
		this.websocket.send(JSON.stringify(msg));
	}

	sendPathMaxSpeed() {
		const msg = this.pathMng.getMaxSpeedMsg();
		this.websocket.send(JSON.stringify(msg));
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

	vehicleClicked(vehicle) {
		clearOptions();
		this.vehicleMng.drawOptions(vehicle, this.pathMng.selected ? this.pathMng.selected.id : null);
		this.getVehicleRoute(vehicle.id);
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
					this.stateMng.end();
					break;
				case 'route':
					network.markRoute(event['data']);
					break;
				case 'trafficLight':
					clearOptions();
					this.tLightMng.fillOptions(event['states'], event['logicType']);
					openOptions();
					break;
				case 'path':
					clearOptions();
					this.pathMng.fillOptions(event);
					openOptions();
					break;
				case 'reset':
					loadingOff();
					this.stateMng.swichToPresimulationScreen();
				case 'error':
					openToast(event['text'], event['duration']);
				default:
					break;
			}
		});
	}

	changeScenario() {
		this.end();
		this.stateMng.swichToPresimulationScreen();

		network?.clearAll();
		network = null;
	}

	end() {
		this.websocket.send(JSON.stringify({ type: 'end' }));
		this.stateMng.end();
		this.pathMng.deselect();
		this.follow = false;
	}

	sendButtonMsgs(buttons, websocket) {
		buttons['start'].onclick = async () => {
			loadingOn();
			const scenario = document.querySelector('#scenarios').selectedOptions[0].value;

			if (scenario == 'upload') {
				if (!this.upload.trips || !this.upload.net) {
					loadingOff();
					console.log(this.upload);
					return;
				}
			}
			this.stateMng.swichToSimulationScreen();

			const event = {
				type: 'start',
				scenario: scenario,
			};
			websocket.send(JSON.stringify(event));
		};

		buttons['pause'].onclick = async () => {
			console.log('Click pause');

			const event = {
				type: 'pause',
			};
			await websocket.send(JSON.stringify(event));
			this.stateMng.pause();
		};

		buttons['play'].onclick = async () => {
			console.log('Click play');

			const event = {
				type: 'play',
			};
			await websocket.send(JSON.stringify(event));
			this.stateMng.play();
		};
		//end button
		buttons['end'].onclick = async () => this.end();

		// setSpeed button
		buttons['setSpeed'].oninput = async () => {
			var sliderVal = buttons['setSpeed'].value;
			const max = buttons['setSpeed'].max;
			document.getElementById('speedSliderOut').value = sliderVal;
			const event = {
				type: 'setSpeed',
				value: Math.floor((max - sliderVal) * 2.5),
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
			this.follow
				? (buttons['followVehicle'].innerHTML = 'Follow')
				: (buttons['followVehicle'].innerHTML = 'Unfollow');
			this.follow = !this.follow;
		};
		buttons['deselectVehicle'].onclick = () => {
			this.vehicleMng.selectedVehicle.deselect();
			this.vehicleMng.selectedVehicle = null;
			network.resetMark();
			this.follow = false;
			clearOptions();
			closeOptions();
			document.querySelector('#vehicleOptionsPath').innerHTML = '';
			document.querySelector('#newDestVehicleBtn').classList = ['hidden'];
		};

		buttons['tlightCenter'].onclick = () => {
			this.center(network.trafficLights[this.tLightMng.selected]);
		};
		buttons['setStateTLight'].onclick = () => this.sendtLightState();
		buttons['resetTLight'].onclick = () => this.sendTLightReset();
		buttons['saveStateTLight'].onclick = () => this.sendTLightStateUpdate();
		buttons['addStateTLight'].onclick = () => this.sendTLightStateAdd();
		buttons['removeStatusTLight'].onclick = () => this.sendTLightStateDelete();

		buttons['pathMaxSpeed'].onclick = () => this.sendPathMaxSpeed();
		buttons['pathCenter'].onclick = () => this.center(this.pathMng.selected.obj);
		buttons['pathDeselect'].onclick = () => {
			this.pathMng.deselect();
			this.pathMng.closePathOptions();
		};
		buttons['newDestVehicle'].onclick = () => this.sendVehicleDestination();
		buttons['uploadnet'].onchange = () => {
			this.upload.net = this.sendFile('net');
		};
		buttons['uploadtrips'].onchange = () => {
			this.upload.trips = this.sendFile('trips');
		};
		buttons['scenarioChange'].onclick = () => this.changeScenario(websocket);
	}
}

window.addEventListener('DOMContentLoaded', () => {
	disableDevOptions();

	const buttons = {
		start: document.getElementById('startButton'),
		pause: document.getElementById('pauseButton'),
		play: document.getElementById('playButton'),
		end: document.getElementById('endButton'),
		setSpeed: document.getElementById('speedSlider'),
		setScale: document.getElementById('scaleSlider'),
		followVehicle: document.getElementById('followVehicleBtn'),
		centerVehicle: document.getElementById('centerVehicleBtn'),
		stopVehicle: document.getElementById('stopVehicleBtn'),
		resumeVehicle: document.getElementById('resumeVehicleBtn'),
		deselectVehicle: document.getElementById('deselectVehicleBtn'),
		tlightCenter: document.getElementById('tlightCenterBtn'),
		setStateTLight: document.getElementById('setStateTLightBtn'),
		resetTLight: document.getElementById('resetTLightBtn'),
		saveStateTLight: document.getElementById('saveStateTLightBtn'),
		addStateTLight: document.getElementById('addStateTLightBtn'),
		removeStatusTLight: document.getElementById('removeStatusTLightBtn'),
		pathMaxSpeed: document.getElementById('pathMaxSpeedBtn'),
		pathDeselect: document.getElementById('pathDeselectBtn'),
		pathCenter: document.getElementById('pathCenterBtn'),
		newDestVehicle: document.getElementById('newDestVehicleBtn'),
		scenarioChange: document.getElementById('scenarioChangeButton'),

		uploadnet: document.querySelector('#uploadnetInput'),
		uploadtrips: document.querySelector('#uploadtripsInput'),
	};

	// Open the WebSocket connection and register event handlers.
	const websocket = new WebSocket('ws://localhost:8001'); ///ws://147.175.161.232:8001/
	websocket.addEventListener('open', () => {
		websocket.send(JSON.stringify({ type: 'connected' }));
	});
	loadingOn('Author: Kapusta J.   FIIT STU');
	let websocket2 = null;
	websocket.addEventListener('message', ({ data }) => {
		const event = JSON.parse(data);

		switch (event['type']) {
			case 'newPort':
				console.log(event);
				websocket2 = new WebSocket(`ws://localhost:${event['port']}`);
				main = new Main(websocket2, buttons);
				websocket2.addEventListener('open', () => {
					loadingOff();
				});
				break;

			default:
				break;
		}
	});

	// main = new Main(websocket2, buttons);
});

function disableDevOptions() {
	document.addEventListener('contextmenu', (e) => e.preventDefault(), false);

	document.addEventListener('keydown', (e) => {
		if (e.ctrlKey || e.key == 'F12') {
			e.stopPropagation();
			e.preventDefault();
		}
	});
}
