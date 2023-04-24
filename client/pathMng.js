class PathMng {
	selected = null;
	constructor() {}

	select(obj, id) {
		this.deselect();
		this.selected = { obj: obj, id: id };
		obj.stroke = 'orange';
		two.update();
	}

	deselect() {
		if (!this.selected) return;
		this.selected.obj.stroke = 'black';
		this.selected = null;
		two.update();
	}

	fillOptions(event) {
		document.querySelector('#pathOptions').style.display = 'block';

		const id = document.querySelector('#pathId');
		const street = document.querySelector('#pathStreetName');
		const maxSpeed = document.querySelector('#pathMaxSpeed');
		const avgSpeed = document.querySelector('#pathAvgSpeed');
		const allowed = document.querySelector('#pathAllowed tbody');

		id.innerHTML = event['id'];
		street.innerHTML = event['streetName'];
		maxSpeed.innerHTML = event['maxSpeed'];
		avgSpeed.innerHTML = event['averageSpeed'];

		console.log(event);
		allowed.innerHTML = '';

		allowed.innerHTML = '';
		if (event['allowed'].length == 0) {
			let tr = document.createElement('tr');
			let vehtr = document.createElement('td');

			vehtr.innerHTML = 'Everything';

			tr.append(vehtr);
			allowed.append(tr);
		}
		for (const veh of event['allowed']) {
			let tr = document.createElement('tr');
			let vehtr = document.createElement('td');

			vehtr.innerHTML = veh;

			tr.append(vehtr);
			allowed.append(tr);
		}
	}

	getMaxSpeedMsg() {
		if (!this.selected) return null;
		const input = document.querySelector('#pathMaxSpeedInput');
		const speed = input.value > 1 ? input.value : 1;
		return { type: 'pathMaxSpeed', value: speed, id: this.selected.id };
	}

	closePathOptions() {
		document.querySelector('#pathOptions').style.display = 'none';
		closeOptions();
	}
}
