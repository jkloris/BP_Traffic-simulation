var elem = document.getElementById('board');
var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;

var two = new Two({ width: elem.style.width, height: elem.style.height }).appendTo(elem);
var stage = new Two.Group();

let network = null;

var vehicles = {};




function updateVehicleObjects(vehicleData) {
	for (i in vehicleData.added) {
		id = vehicleData.added[i];
		pos = vehicleData.data[id].position;
		vehicles[id] = new Vehicle(id, pos[0], pos[1]);
		stage.add(vehicles[id].obj);
	}
	for (i in vehicleData.removed) {
		id = vehicleData.removed[i];
		stage.remove(vehicles[id].obj);
		two.remove(vehicles[id].obj);
		delete vehicles[id];
	}
}

function drawVehicles(vehicleData) {
	for (i in vehicleData.all) {
		id = vehicleData.all[i];
		data = vehicleData.data[id];
		vehicles[id].move(data.position[0], data.position[1], data.angle, network.offset);
	}
	two.update();
}

function clearNetwork() {
	for (id in vehicles) {
		stage.remove(vehicles[id].obj);
		two.remove(vehicles[id].obj);
		delete vehicles[id];
	}
	two.update();
}

two.add(stage);
var zui = new Two.ZUI(stage);
addZUI();

function addZUI() {
	var domElement = two.renderer.domElement;
	var zui = new Two.ZUI(stage, elem);
	var mouse = new Two.Vector();
	var touches = {};
	var distance = 0;

	zui.addLimits(0.06, 8);

	domElement.addEventListener('mousedown', mousedown, false);
	domElement.addEventListener('mousewheel', mousewheel, false);
	domElement.addEventListener('wheel', mousewheel, false);

	domElement.addEventListener('touchstart', touchstart, false);
	domElement.addEventListener('touchmove', touchmove, false);
	domElement.addEventListener('touchend', touchend, false);
	domElement.addEventListener('touchcancel', touchend, false);

	function mousedown(e) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		window.addEventListener('mousemove', mousemove, false);
		window.addEventListener('mouseup', mouseup, false);
	}

	function mousemove(e) {
		var dx = e.clientX - mouse.x;
		var dy = e.clientY - mouse.y;
		zui.translateSurface(dx, dy);
		mouse.set(e.clientX, e.clientY);
		two.update();
	}

	function mouseup(e) {
		window.removeEventListener('mousemove', mousemove, false);
		window.removeEventListener('mouseup', mouseup, false);
	}

	function mousewheel(e) {
		var dy = (e.wheelDeltaY || -e.deltaY) / 2000;
		zui.zoomBy(dy, e.clientX, e.clientY);
		two.update();
	}

	function touchstart(e) {
		switch (e.touches.length) {
			case 2:
				pinchstart(e);
				break;
			case 1:
				panstart(e);
				break;
		}
	}

	function touchmove(e) {
		switch (e.touches.length) {
			case 2:
				pinchmove(e);
				break;
			case 1:
				panmove(e);
				break;
		}
	}

	function touchend(e) {
		touches = {};
		var touch = e.touches[0];
		if (touch) {
			// Pass through for panning after pinching
			mouse.x = touch.clientX;
			mouse.y = touch.clientY;
		}
	}

	function panstart(e) {
		var touch = e.touches[0];
		mouse.x = touch.clientX;
		mouse.y = touch.clientY;
	}

	function panmove(e) {
		var touch = e.touches[0];
		var dx = touch.clientX - mouse.x;
		var dy = touch.clientY - mouse.y;
		zui.translateSurface(dx, dy);
		mouse.set(touch.clientX, touch.clientY);
	}

	function pinchstart(e) {
		for (var i = 0; i < e.touches.length; i++) {
			var touch = e.touches[i];
			touches[touch.identifier] = touch;
		}
		var a = touches[0];
		var b = touches[1];
		var dx = b.clientX - a.clientX;
		var dy = b.clientY - a.clientY;
		distance = Math.sqrt(dx * dx + dy * dy);
		mouse.x = dx / 2 + a.clientX;
		mouse.y = dy / 2 + a.clientY;
	}

	function pinchmove(e) {
		for (var i = 0; i < e.touches.length; i++) {
			var touch = e.touches[i];
			touches[touch.identifier] = touch;
		}
		var a = touches[0];
		var b = touches[1];
		var dx = b.clientX - a.clientX;
		var dy = b.clientY - a.clientY;
		var d = Math.sqrt(dx * dx + dy * dy);
		var delta = d - distance;
		zui.zoomBy(delta / 250, mouse.x, mouse.y);
		distance = d;
	}
}

// document.addEventListener('click', function (event) {});

//Selecting object in network
elem.addEventListener('pointerdown', pointerdown, false);

function pointerdown(e) {
	let x = e.clientX - elem.getBoundingClientRect().left;
	let y = e.clientY - elem.getBoundingClientRect().top;
	let dist = 0;

	if (network) {
		// selecting of traffic lights
		for (const [id, tl] of Object.entries(network.trafficLights)) {
			//  magic formula, DONT TOUCH
			dist = Math.sqrt((tl.position.x * stage.scale + stage.position.x - x) ** 2 + (tl.position.y * stage.scale + stage.position.y - y) ** 2);

			if (dist <= tl.radius * stage.scale) {
				console.log(id);
				main.sendTLightMsg(id);
				return;
			}
		}

		// selecting vehicle
		for (const [id, v] of Object.entries(vehicles)) {
			//  magic formula, DONT TOUCH
			dist = Math.sqrt((v.obj.position.x * stage.scale + stage.position.x - x) ** 2 + (v.obj.position.y * stage.scale + stage.position.y - y) ** 2);

			if (dist <= v.width * stage.scale) {
				console.log(id);
				main.vehicleClicked(v);
				return;
			}
		}
	}
}
